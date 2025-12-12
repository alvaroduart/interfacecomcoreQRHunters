import { QRCodeRepository } from '../../domain/repositories/QRCodeRepository';
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

/**
 * Repositório híbrido que usa Supabase quando online e SQLite quando offline
 */
export class QRCodeRepositoryHybrid implements QRCodeRepository {
  private static instance: QRCodeRepositoryHybrid;
  private db: SQLiteDatabase;
  private network: NetworkService;
  private cacheSync: CacheSyncService;

  private constructor() {
    this.db = SQLiteDatabase.getInstance();
    this.network = NetworkService.getInstance();
    this.cacheSync = CacheSyncService.getInstance();
  }

  public static getInstance(): QRCodeRepositoryHybrid {
    if (!QRCodeRepositoryHybrid.instance) {
      QRCodeRepositoryHybrid.instance = new QRCodeRepositoryHybrid();
    }
    return QRCodeRepositoryHybrid.instance;
  }

  async scanQRCode(code: Code): Promise<QRCode> {
    const isOnline = await this.network.checkConnection();

    if (isOnline) {
      try {
        return await this.scanQRCodeFromSupabase(code);
      } catch (error) {
        console.log('[QRCodeRepositoryHybrid] Falha no Supabase, tentando cache...');
        return await this.scanQRCodeFromCache(code);
      }
    } else {
      return await this.scanQRCodeFromCache(code);
    }
  }

  private async scanQRCodeFromSupabase(code: Code): Promise<QRCode> {
    console.log('[QRCodeRepositoryHybrid] Buscando QRCode no Supabase:', code.value);

    const { data, error } = await supabase
      .from('qrcodes')
      .select(`
        *,
        questions (
          id,
          text,
          answers (
            id,
            text,
            is_correct
          )
        )
      `)
      .eq('code', code.value)
      .single();

    if (error || !data) {
      throw new Error('QR Code não encontrado');
    }

    // Sincronizar com cache
    await this.cacheSync.syncQRCode(data);

    return this.mapToQRCode(data);
  }

  private async scanQRCodeFromCache(code: Code): Promise<QRCode> {
    console.log('[QRCodeRepositoryHybrid] Buscando QRCode no cache:', code.value);

    const database = this.db.getDatabase();

    const qrcode = await database.getFirstAsync<any>(`
      SELECT * FROM qrcodes WHERE code = ?
    `, [code.value]);

    if (!qrcode) {
      throw new Error('QR Code não encontrado no cache');
    }

    // Buscar pergunta e respostas
    const question = await database.getFirstAsync<any>(`
      SELECT * FROM questions WHERE id = ?
    `, [qrcode.question_id]);

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

    if (!questionEntity) {
      throw new Error('Pergunta não encontrada para este QR Code');
    }

    return QRCode.create(
      qrcode.id,
      Code.create(qrcode.code),
      Location.create(qrcode.location_name),
      Coordinates.create(qrcode.latitude, qrcode.longitude),
      questionEntity,
      undefined,
      undefined,
      qrcode.description || ''
    );
  }

  async getQRCodeDetails(qrcodeId: string): Promise<QRCode> {
    const isOnline = await this.network.checkConnection();

    if (isOnline) {
      try {
        return await this.getQRCodeDetailsFromSupabase(qrcodeId);
      } catch (error) {
        console.log('[QRCodeRepositoryHybrid] Falha no Supabase, tentando cache...');
        return await this.getQRCodeDetailsFromCache(qrcodeId);
      }
    } else {
      return await this.getQRCodeDetailsFromCache(qrcodeId);
    }
  }

  private async getQRCodeDetailsFromSupabase(qrcodeId: string): Promise<QRCode> {
    const { data, error } = await supabase
      .from('qrcodes')
      .select(`
        *,
        questions (
          id,
          text,
          answers (
            id,
            text,
            is_correct
          )
        )
      `)
      .eq('id', qrcodeId)
      .single();

    if (error || !data) {
      throw new Error('QR Code não encontrado');
    }

    await this.cacheSync.syncQRCode(data);
    return this.mapToQRCode(data);
  }

  private async getQRCodeDetailsFromCache(qrcodeId: string): Promise<QRCode> {
    const database = await this.db.getDatabase();

    const qrcode = await database.getFirstAsync<any>(`
      SELECT * FROM qrcodes WHERE id = ?
    `, [qrcodeId]);

    if (!qrcode) {
      throw new Error('QR Code não encontrado no cache');
    }

    const question = await database.getFirstAsync<any>(`
      SELECT * FROM questions WHERE id = ?
    `, [qrcode.question_id]);

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

    if (!questionEntity) {
      throw new Error('Pergunta não encontrada');
    }

    return QRCode.create(
      qrcode.id,
      Code.create(qrcode.code),
      Location.create(qrcode.location_name),
      Coordinates.create(qrcode.latitude, qrcode.longitude),
      questionEntity,
      undefined,
      undefined,
      qrcode.description || ''
    );
  }

  async updateQRCode(qrcode: QRCode): Promise<QRCode> {
    // QRCodes geralmente não são atualizados pelo app
    throw new Error('Operação não suportada');
  }

  async getQRCodeByCode(code: string): Promise<QRCode | undefined> {
    try {
      return await this.scanQRCode(Code.create(code)) || undefined;
    } catch {
      return undefined;
    }
  }

  async getUserValidations(userId: string): Promise<any[]> {
    const isOnline = await this.network.checkConnection();

    if (isOnline) {
      try {
        return await this.getUserValidationsFromSupabase(userId);
      } catch (error) {
        console.log('[QRCodeRepositoryHybrid] Falha no Supabase, tentando cache...');
        return await this.getUserValidationsFromCache(userId);
      }
    } else {
      return await this.getUserValidationsFromCache(userId);
    }
  }

  private async getUserValidationsFromSupabase(userId: string): Promise<any[]> {
    console.log('[QRCodeRepositoryHybrid] Buscando validações no Supabase');

    const { data, error } = await supabase
      .from('validations')
      .select(`
        *,
        qrcodes (
          id,
          code,
          location_name,
          latitude,
          longitude,
          description
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'acertou')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[QRCodeRepositoryHybrid] Erro ao buscar validações:', error);
      throw error;
    }

    console.log('[QRCodeRepositoryHybrid] Validações encontradas (total):', data?.length || 0);

    // Filtrar duplicatas - manter apenas a primeira validação de cada QR Code
    const uniqueValidations: any[] = [];
    const seenQRCodeIds = new Set<string>();

    if (data && data.length > 0) {
      for (const validation of data) {
        const qrcodeId = validation.qrcode_id;
        
        // Se ainda não vimos este QR Code, adicionar
        if (!seenQRCodeIds.has(qrcodeId)) {
          seenQRCodeIds.add(qrcodeId);
          uniqueValidations.push(validation);
        }
      }
    }

    console.log('[QRCodeRepositoryHybrid] Validações únicas (sem duplicatas):', uniqueValidations.length);

    // Sincronizar validações para cache
    if (uniqueValidations.length > 0) {
      for (const validation of uniqueValidations) {
        try {
          await this.cacheSync.syncValidation(validation);
          if (validation.qrcodes) {
            await this.cacheSync.syncQRCode(validation.qrcodes);
          }
        } catch (err) {
          console.warn('[QRCodeRepositoryHybrid] Erro ao sincronizar validação:', err);
        }
      }
    }

    return uniqueValidations;
  }

  private async getUserValidationsFromCache(userId: string): Promise<any[]> {
    console.log('[QRCodeRepositoryHybrid] Buscando validações no cache');

    const database = await this.db.getDatabase();

    const validations = await database.getAllAsync<any>(`
      SELECT 
        v.*,
        q.id as qrcode_id,
        q.code as qrcode_code,
        q.location_name as qrcode_location_name,
        q.latitude as qrcode_latitude,
        q.longitude as qrcode_longitude,
        q.description as qrcode_description
      FROM validations v
      INNER JOIN qrcodes q ON v.qrcode_id = q.id
      WHERE v.user_id = ? AND v.status = 'acertou'
      ORDER BY v.created_at DESC
    `, [userId]);

    console.log('[QRCodeRepositoryHybrid] Validações encontradas no cache (total):', validations?.length || 0);

    // Filtrar duplicatas - manter apenas a primeira validação de cada QR Code
    const uniqueValidations: any[] = [];
    const seenQRCodeIds = new Set<string>();

    for (const v of validations) {
      const qrcodeId = v.qrcode_id;
      
      // Se ainda não vimos este QR Code, adicionar
      if (!seenQRCodeIds.has(qrcodeId)) {
        seenQRCodeIds.add(qrcodeId);
        uniqueValidations.push({
          id: v.id,
          user_id: v.user_id,
          qrcode_id: v.qrcode_id,
          answer_id: v.answer_id,
          status: v.status,
          created_at: v.created_at,
          qrcodes: {
            id: v.qrcode_id,
            code: v.qrcode_code,
            location_name: v.qrcode_location_name,
            latitude: v.qrcode_latitude,
            longitude: v.qrcode_longitude,
            description: v.qrcode_description
          }
        });
      }
    }

    console.log('[QRCodeRepositoryHybrid] Validações únicas (sem duplicatas):', uniqueValidations.length);

    return uniqueValidations;
  }

  private mapToQRCode(data: any): QRCode {
    let question: Question | undefined;

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

    if (!question) {
      throw new Error('Pergunta não encontrada para o QR Code');
    }

    return QRCode.create(
      data.id,
      Code.create(data.code),
      Location.create(data.location_name),
      Coordinates.create(data.latitude, data.longitude),
      question,
      undefined,
      undefined,
      data.description || ''
    );
  }
}
