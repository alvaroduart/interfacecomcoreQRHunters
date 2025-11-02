import { ProgressRepository } from '../../domain/repositories/ProgressRepository';
import { QRCode } from '../../domain/entities/QRCode';
import { Code } from '../../domain/value-objects/Code';
import { Location } from '../../domain/value-objects/Location';
import { Coordinates } from '../../domain/value-objects/Coordinates';
import { Question } from '../../domain/entities/Question';
import { supabase } from '../api/supabaseClient';

export class ProgressRepositorySupabase implements ProgressRepository {
  private static instance: ProgressRepositorySupabase;

  private constructor() {}

  public static getInstance(): ProgressRepositorySupabase {
    if (!ProgressRepositorySupabase.instance) {
      ProgressRepositorySupabase.instance = new ProgressRepositorySupabase();
    }
    return ProgressRepositorySupabase.instance;
  }

  async getUserProgress(userId: string): Promise<QRCode[]> {
    console.log('[ProgressRepositorySupabase] Buscando progresso para userId:', userId);

    const { data, error } = await supabase
      .from('validations')
      .select(`
        id,
        status,
        created_at,
        qrcodes:qrcode_id (
          id,
          code,
          location_name,
          latitude,
          longitude,
          description,
          questions:question_id (
            id,
            text
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ProgressRepositorySupabase] Erro ao buscar progresso:', error);
      throw new Error(`Erro ao buscar progresso: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('[ProgressRepositorySupabase] Nenhuma validação encontrada para o usuário');
      return [];
    }

    console.log('[ProgressRepositorySupabase] Validações encontradas:', data.length);
    console.log('[ProgressRepositorySupabase] Dados brutos:', JSON.stringify(data, null, 2));

    // Mapear os dados para a entidade QRCode
    const qrcodes = data.map((validation: any) => {
      try {
        const qrcode = validation.qrcodes;
        
        console.log('[ProgressRepositorySupabase] Processando validação:', validation.id);
        console.log('[ProgressRepositorySupabase] QRCode data:', qrcode);
        
        if (!qrcode || !qrcode.questions) {
          console.warn('[ProgressRepositorySupabase] QRCode ou Question não encontrado para validação:', validation.id);
          return null;
        }

        const coordinates = Coordinates.create(
          Number(qrcode.latitude),
          Number(qrcode.longitude)
        );

        // Para a tela de progresso, criamos respostas dummy para satisfazer a validação da entidade Question
        const dummyAnswers = [
          { id: '1', text: 'Resposta 1', isCorrect: true },
          { id: '2', text: 'Resposta 2', isCorrect: false },
          { id: '3', text: 'Resposta 3', isCorrect: false },
          { id: '4', text: 'Resposta 4', isCorrect: false },
        ];

        const question = Question.create(
          qrcode.questions.id,
          qrcode.questions.text,
          dummyAnswers
        );

        const qrcodeEntity = QRCode.create(
          qrcode.id,
          Code.create(qrcode.code),
          Location.create(qrcode.location_name),
          coordinates,
          question,
          new Date(validation.created_at), // scannedAt
          validation.status, // 'acertou' ou 'errou'
          qrcode.description || ''
        );

        console.log('[ProgressRepositorySupabase] QRCode criado:', {
          id: qrcodeEntity.id,
          location: qrcodeEntity.location.value,
          status: qrcodeEntity.status,
          description: qrcodeEntity.description
        });

        return qrcodeEntity;
      } catch (error) {
        console.error('[ProgressRepositorySupabase] Erro ao criar QRCode:', error);
        console.error('[ProgressRepositorySupabase] Validation data:', validation);
        return null;
      }
    }).filter((qr: QRCode | null): qr is QRCode => qr !== null);

    console.log('[ProgressRepositorySupabase] QRCodes mapeados:', qrcodes.length);
    console.log('[ProgressRepositorySupabase] QRCodes finais:', qrcodes);

    return qrcodes;
  }
}
