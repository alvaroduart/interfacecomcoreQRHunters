import { ProgressRepository } from '../../domain/repositories/ProgressRepository';
import { QRCode } from '../../domain/entities/QRCode';
import { Code } from '../../domain/value-objects/Code';
import { Location } from '../../domain/value-objects/Location';
import { Coordinates } from '../../domain/value-objects/Coordinates';
import { Latitude } from '../../domain/value-objects/Latitude';
import { Longitude } from '../../domain/value-objects/Longitude';
import { Question, Answer } from '../../domain/entities/Question';
import { supabase } from '../api/supabaseClient';
import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { NetworkService } from '../services/NetworkService';
import { CacheSyncService } from '../services/CacheSyncService';

export class ProgressRepositoryHybrid implements ProgressRepository {
  private static instance: ProgressRepositoryHybrid;
  private db: SQLiteDatabase;
  private network: NetworkService;
  private cacheSync: CacheSyncService;

  private constructor() {
    this.db = SQLiteDatabase.getInstance();
    this.network = NetworkService.getInstance();
    this.cacheSync = CacheSyncService.getInstance();
  }

  public static getInstance(): ProgressRepositoryHybrid {
    if (!ProgressRepositoryHybrid.instance) {
      ProgressRepositoryHybrid.instance = new ProgressRepositoryHybrid();
    }
    return ProgressRepositoryHybrid.instance;
  }

  async getUserProgress(userId: string): Promise<QRCode[]> {
    const isOnline = await this.network.checkConnection();

    if (isOnline) {
      try {
        return await this.getUserProgressFromSupabase(userId);
      } catch (error) {
        console.log('[ProgressRepositoryHybrid] Falha no Supabase, tentando cache...');
        return await this.getUserProgressFromCache(userId);
      }
    } else {
      return await this.getUserProgressFromCache(userId);
    }
  }

  private async getUserProgressFromSupabase(userId: string): Promise<QRCode[]> {
    console.log('[ProgressRepositoryHybrid] Buscando progresso no Supabase');

    const { data, error } = await supabase
      .from('validations')
      .select(`
        id,
        status,
        created_at,
        qrcodes (
          id,
          code,
          location_name,
          latitude,
          longitude,
          description,
          question_id,
          questions (
            id,
            text,
            answers (
              id,
              text,
              is_correct
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ProgressRepositoryHybrid] Erro ao buscar:', error);
      throw new Error('Erro ao buscar progresso');
    }

    if (!data || data.length === 0) {
      console.log('[ProgressRepositoryHybrid] Nenhuma validação encontrada');
      return [];
    }

    console.log('[ProgressRepositoryHybrid] Validações encontradas:', data.length);

    // Sincronizar com cache (apenas QRCodes com question_id válido)
    for (const validation of data) {
      const qrcode: any = validation.qrcodes;
      if (qrcode && !Array.isArray(qrcode) && qrcode.question_id) {
        try {
          await this.cacheSync.syncQRCode(qrcode);
        } catch (err) {
          console.warn('[ProgressRepositoryHybrid] Erro ao sincronizar QRCode:', qrcode.code, err);
        }
      }
    }

    const qrcodesMap = new Map<string, QRCode>();

    for (const validation of data) {
      const qrcode: any = validation.qrcodes;
      if (qrcode && !Array.isArray(qrcode) && !qrcodesMap.has(qrcode.id)) {
        try {
          // Passar status e created_at da validação para o mapeamento
          const mappedQRCode = this.mapToQRCode(qrcode, validation.status, validation.created_at);
          qrcodesMap.set(qrcode.id, mappedQRCode);
        } catch (err) {
          console.warn('[ProgressRepositoryHybrid] Erro ao mapear QRCode:', qrcode.code, err);
        }
      }
    }

    const result = Array.from(qrcodesMap.values());
    console.log('[ProgressRepositoryHybrid] QRCodes mapeados:', result.length);
    return result;
  }

  private async getUserProgressFromCache(userId: string): Promise<QRCode[]> {
    console.log('[ProgressRepositoryHybrid] Buscando progresso no cache');

    const database = this.db.getDatabase();

    const validations = await database.getAllAsync<any>(`
      SELECT DISTINCT
        q.id, q.code, q.location_name, q.latitude, q.longitude, q.description, q.question_id,
        v.status, v.created_at
      FROM validations v
      INNER JOIN qrcodes q ON v.qrcode_id = q.id
      WHERE v.user_id = ?
      ORDER BY v.created_at DESC
    `, [userId]);

    if (!validations || validations.length === 0) {
      return [];
    }

    const qrcodes: QRCode[] = [];

    for (const validation of validations) {
      const question = await database.getFirstAsync<any>(`
        SELECT * FROM questions WHERE id = ?
      `, [validation.question_id]);

      let questionEntity: Question | undefined;

      if (question) {
        const answers = await database.getAllAsync(`
          SELECT * FROM answers WHERE question_id = ?
        `, [question.id]);

        const answersEntities: Answer[] = answers.map((ans: any) => ({
          id: ans.id,
          text: ans.text,
          isCorrect: ans.is_correct === 1
        }));

        if (answersEntities.length === 4) {
          questionEntity = Question.create(
            question.id,
            question.text,
            answersEntities
          );
        }
      }

      if (questionEntity) {
        qrcodes.push(QRCode.create(
          validation.id,
          Code.create(validation.code),
          Location.create(validation.location_name),
          Coordinates.create(validation.latitude, validation.longitude),
          questionEntity,
          validation.created_at ? new Date(validation.created_at) : undefined,
          validation.status as 'acertou' | 'errou',
          validation.description || ''
        ));
      }
    }

    return qrcodes;
  }

  private mapToQRCode(data: any, status?: 'acertou' | 'errou', createdAt?: string): QRCode {
    let question: Question | undefined;

    // Se tiver pergunta completa com respostas
    if (data.questions && data.questions.answers && Array.isArray(data.questions.answers)) {
      const answers: Answer[] = data.questions.answers.map((ans: any) => ({
        id: ans.id,
        text: ans.text,
        isCorrect: ans.is_correct
      }));

      if (answers.length === 4) {
        question = Question.create(
          data.questions.id,
          data.questions.text,
          answers
        );
      }
    }
    // Se tiver apenas a pergunta sem respostas, criar respostas dummy
    else if (data.questions && data.questions.id && data.questions.text) {
      const dummyAnswers: Answer[] = [
        { id: '1', text: 'Resposta 1', isCorrect: true },
        { id: '2', text: 'Resposta 2', isCorrect: false },
        { id: '3', text: 'Resposta 3', isCorrect: false },
        { id: '4', text: 'Resposta 4', isCorrect: false },
      ];

      question = Question.create(
        data.questions.id,
        data.questions.text,
        dummyAnswers
      );
    }

    if (!question) {
      console.warn('[ProgressRepositoryHybrid] QRCode sem pergunta válida:', data.code);
      throw new Error('Pergunta não encontrada');
    }

    return QRCode.create(
      data.id,
      Code.create(data.code),
      Location.create(data.location_name),
      Coordinates.create(data.latitude, data.longitude),
      question,
      createdAt ? new Date(createdAt) : undefined,
      status || 'acertou',
      data.description || ''
    );
  }
}
