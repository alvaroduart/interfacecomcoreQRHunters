import { QRCodeRepository } from '../../domain/repositories/QRCodeRepository';
import { QRCode } from '../../domain/entities/QRCode';
import { Question, Answer } from '../../domain/entities/Question';
import { Code } from '../../domain/value-objects/Code';
import { Location } from '../../domain/value-objects/Location';
import { Coordinates } from '../../domain/value-objects/Coordinates';
import { supabase } from '../api/supabaseClient';

export class QRCodeRepositorySupabase implements QRCodeRepository {
  private static instance: QRCodeRepositorySupabase;

  private constructor() {}

  public static getInstance(): QRCodeRepositorySupabase {
    if (!QRCodeRepositorySupabase.instance) {
      QRCodeRepositorySupabase.instance = new QRCodeRepositorySupabase();
    }
    return QRCodeRepositorySupabase.instance;
  }

  async scanQRCode(code: Code, location: Location): Promise<QRCode> {
    const qrCode = await this.getQRCodeByCode(code.value);
    
    if (!qrCode) {
      throw new Error('QR Code não encontrado');
    }

    return qrCode;
  }

  async getQRCodeDetails(id: string): Promise<QRCode | undefined> {
    try {
      console.log('QRCodeRepositorySupabase.getQRCodeDetails - buscando ID:', id);
      
      // Buscar QR Code com pergunta e respostas
      const { data: qrcodeData, error: qrcodeError } = await supabase
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
        .eq('id', id)
        .single();

      if (qrcodeError || !qrcodeData) {
        console.error('Erro ao obter detalhes do QR Code:', qrcodeError);
        return undefined;
      }

      console.log('Detalhes do QR Code encontrado:', { id: qrcodeData.id, code: qrcodeData.code });
      return this.mapToQRCodeEntity(qrcodeData);
    } catch (error) {
      console.error('Erro ao obter detalhes do QR Code:', error);
      return undefined;
    }
  }

  async getQRCodeByCode(code: string): Promise<QRCode | undefined> {
    try {
      // Limpar o código removendo espaços e quebras de linha
      const cleanCode = code.trim();
      console.log('QRCodeRepositorySupabase.getQRCodeByCode - buscando código:', cleanCode);
      
      // Tentar buscar por 'code' primeiro
      let { data: qrcodeData, error: qrcodeError } = await supabase
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
        .eq('code', cleanCode)
        .maybeSingle(); // Usa maybeSingle() em vez de single() para não dar erro se não encontrar

      // Se não encontrou por 'code', tentar buscar por 'id' (UUID)
      if (!qrcodeData && !qrcodeError) {
        console.log('Não encontrou por code, tentando buscar por ID (UUID)...');
        const result = await supabase
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
          .eq('id', cleanCode)
          .maybeSingle();
        
        qrcodeData = result.data;
        qrcodeError = result.error;
      }

      if (qrcodeError || !qrcodeData) {
        console.error('Erro ao buscar QR Code por código:', qrcodeError);
        return undefined;
      }

      console.log('QR Code encontrado no banco:', { id: qrcodeData.id, code: qrcodeData.code });
      return this.mapToQRCodeEntity(qrcodeData);
    } catch (error) {
      console.error('Erro ao obter QR Code por código:', error);
      return undefined;
    }
  }

  async updateQRCode(qrCode: QRCode): Promise<QRCode> {
    // Salvar validação no banco de dados
    if (qrCode.status && qrCode.scannedAt) {
      try {
        // Aqui você pode salvar o histórico de validações
        // Por enquanto, apenas retornamos o QR Code atualizado
        return qrCode;
      } catch (error) {
        console.error('Erro ao atualizar QR Code:', error);
        throw error;
      }
    }
    
    return qrCode;
  }

  async saveValidation(
    userId: string,
    qrCodeId: string,
    answerId: string,
    userLatitude: number,
    userLongitude: number,
    distanceMeters: number,
    status: 'acertou' | 'errou'
  ): Promise<void> {
    console.log('[QRCodeRepositorySupabase] Salvando validação:', {
      userId,
      qrCodeId,
      answerId,
      userLatitude,
      userLongitude,
      distanceMeters,
      status
    });

    try {
      const { data, error } = await supabase.from('validations').insert({
        user_id: userId,
        qrcode_id: qrCodeId,
        answer_id: answerId,
        user_latitude: userLatitude,
        user_longitude: userLongitude,
        distance_meters: distanceMeters,
        status,
      }).select();

      if (error) {
        console.error('[QRCodeRepositorySupabase] Erro ao salvar validação:', error);
        throw error;
      }

      console.log('[QRCodeRepositorySupabase] Validação salva com sucesso:', data);
    } catch (error) {
      console.error('[QRCodeRepositorySupabase] Erro ao salvar validação:', error);
      throw error;
    }
  }

  async getUserValidations(userId: string): Promise<any[]> {
    try {
      console.log('QRCodeRepositorySupabase.getUserValidations - buscando validações do usuário:', userId);
      
      const { data, error } = await supabase
        .from('validations')
        .select(`
          *,
          qrcodes (
            code,
            location_name,
            description,
            latitude,
            longitude
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'acertou')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar validações do usuário:', error);
        return [];
      }

      console.log('Validações encontradas:', data?.length || 0);
      
      if (!data || data.length === 0) {
        return [];
      }

      // Filtrar para manter apenas a primeira validação de cada QR Code (mais recente)
      // Apenas validações com 'acertou' (já filtrado na query)
      const uniqueQRCodes = new Map<string, any>();
      
      for (const validation of data) {
        const qrcodeId = validation.qrcode_id;
        
        // Se já temos uma validação deste QR Code, pula (queremos apenas a primeira - mais recente)
        if (uniqueQRCodes.has(qrcodeId)) {
          continue;
        }
        
        uniqueQRCodes.set(qrcodeId, validation);
      }

      const uniqueValidations = Array.from(uniqueQRCodes.values());
      console.log('Validações únicas (apenas acertou):', uniqueValidations.length);
      
      return uniqueValidations;
    } catch (error) {
      console.error('Erro ao buscar validações do usuário:', error);
      return [];
    }
  }

  private mapToQRCodeEntity(data: any): QRCode {
    const answers: Answer[] = data.questions.answers.map((answer: any) => ({
      id: answer.id,
      text: answer.text,
      isCorrect: answer.is_correct,
    }));

    const question = Question.create(
      data.questions.id,
      data.questions.text,
      answers
    );

    return QRCode.create(
      data.id,
      Code.create(data.code),
      Location.create(data.location_name),
      Coordinates.create(data.latitude, data.longitude),
      question,
      undefined,
      undefined,
      data.description
    );
  }
}
