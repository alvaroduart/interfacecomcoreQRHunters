import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { supabase } from '../api/supabaseClient';

/**
 * Serviço para sincronizar dados entre Supabase e SQLite (cache)
 */
export class CacheSyncService {
  private static instance: CacheSyncService;
  private db: SQLiteDatabase;

  private constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  public static getInstance(): CacheSyncService {
    if (!CacheSyncService.instance) {
      CacheSyncService.instance = new CacheSyncService();
    }
    return CacheSyncService.instance;
  }

  /**
   * Sincroniza um QR Code com suas perguntas e respostas para o cache
   */
  async syncQRCode(qrcodeData: any): Promise<void> {
    try {
      const database = await this.db.getDatabase();

      // Validar se o QRCode tem question_id válido
      if (!qrcodeData.question_id) {
        console.warn('[CacheSyncService] QRCode sem question_id, ignorando sincronização:', qrcodeData.code);
        return;
      }

      // Sincronizar Question
      if (qrcodeData.questions) {
        const question = qrcodeData.questions;
        await database.runAsync(
          `INSERT OR REPLACE INTO questions (id, text, created_at, updated_at)
           VALUES (?, ?, ?, ?)`,
          [question.id, question.text, question.created_at || new Date().toISOString(), question.updated_at || new Date().toISOString()]
        );

        // Sincronizar Answers
        if (question.answers && Array.isArray(question.answers)) {
          for (const answer of question.answers) {
            await database.runAsync(
              `INSERT OR REPLACE INTO answers (id, question_id, text, is_correct, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                answer.id,
                question.id,
                answer.text,
                answer.is_correct ? 1 : 0,
                answer.created_at || new Date().toISOString(),
                answer.updated_at || new Date().toISOString()
              ]
            );
          }
        }
      }

      // Sincronizar QRCode
      await database.runAsync(
        `INSERT OR REPLACE INTO qrcodes (id, code, location_name, latitude, longitude, description, question_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          qrcodeData.id,
          qrcodeData.code,
          qrcodeData.location_name,
          qrcodeData.latitude,
          qrcodeData.longitude,
          qrcodeData.description,
          qrcodeData.question_id,
          qrcodeData.created_at || new Date().toISOString(),
          qrcodeData.updated_at || new Date().toISOString()
        ]
      );

      console.log('[CacheSyncService] QRCode sincronizado:', qrcodeData.code);
    } catch (error) {
      console.error('[CacheSyncService] Erro ao sincronizar QRCode:', error);
      throw error;
    }
  }

  /**
   * Sincroniza uma validação para o cache
   */
  async syncValidation(validationData: any): Promise<void> {
    try {
      const database = await this.db.getDatabase();

      // Delete any existing validation for this user+qrcode combination
      // This prevents duplicates when syncing from Supabase after an offline save
      await database.runAsync(
        `DELETE FROM validations WHERE user_id = ? AND qrcode_id = ?`,
        [validationData.user_id, validationData.qrcode_id]
      );

      // Insert the new validation
      await database.runAsync(
        `INSERT INTO validations (id, user_id, qrcode_id, answer_id, user_latitude, user_longitude, distance_meters, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          validationData.id,
          validationData.user_id,
          validationData.qrcode_id,
          validationData.answer_id,
          validationData.user_latitude,
          validationData.user_longitude,
          validationData.distance_meters,
          validationData.status,
          validationData.created_at || new Date().toISOString()
        ]
      );

      console.log('[CacheSyncService] Validação sincronizada:', validationData.id);
    } catch (error) {
      console.error('[CacheSyncService] Erro ao sincronizar validação:', error);
      throw error;
    }
  }

  /**
   * Sincroniza uma jornada completa para o cache
   */
  async syncJourney(journeyData: any): Promise<void> {
    try {
      const database = await this.db.getDatabase();

      // Sincronizar Journey
      await database.runAsync(
        `INSERT OR REPLACE INTO journeys (id, name, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          journeyData.id,
          journeyData.name,
          journeyData.description,
          journeyData.created_at || new Date().toISOString(),
          journeyData.updated_at || new Date().toISOString()
        ]
      );

      // Sincronizar Journey Points
      if (journeyData.journey_points && Array.isArray(journeyData.journey_points)) {
        for (const point of journeyData.journey_points) {
          await database.runAsync(
            `INSERT OR REPLACE INTO journey_points (id, journey_id, qrcode_id, sequence_order, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [
              point.id,
              journeyData.id,
              point.qrcode_id,
              point.sequence_order,
              point.created_at || new Date().toISOString()
            ]
          );

          // Sincronizar o QRCode associado se disponível
          if (point.qrcodes) {
            await this.syncQRCode(point.qrcodes);
          }
        }
      }

      console.log('[CacheSyncService] Jornada sincronizada:', journeyData.name);
    } catch (error) {
      console.error('[CacheSyncService] Erro ao sincronizar jornada:', error);
      throw error;
    }
  }

  /**
   * Sincroniza o progresso do usuário em uma jornada
   */
  async syncUserJourney(userJourneyData: any): Promise<void> {
    try {
      const database = await this.db.getDatabase();

      await database.runAsync(
        `INSERT OR REPLACE INTO user_journeys (id, user_id, journey_id, status, current_point_index, started_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userJourneyData.id,
          userJourneyData.user_id,
          userJourneyData.journey_id,
          userJourneyData.status,
          userJourneyData.current_point_index,
          userJourneyData.started_at,
          userJourneyData.completed_at
        ]
      );

      console.log('[CacheSyncService] Progresso de jornada sincronizado');
    } catch (error) {
      console.error('[CacheSyncService] Erro ao sincronizar progresso:', error);
      throw error;
    }
  }

  /**
   * Sincroniza dados do usuário para o cache local
   */
  async syncUser(userData: any): Promise<void> {
    try {
      const database = await this.db.getDatabase();

      await database.runAsync(
        `INSERT OR REPLACE INTO users (id, name, email, avatar_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userData.id,
          userData.name,
          userData.email,
          userData.avatar_url || null,
          userData.created_at || new Date().toISOString(),
          new Date().toISOString() // Sempre atualizar updated_at
        ]
      );

      console.log('[CacheSyncService] Usuário sincronizado:', userData.email);
    } catch (error) {
      console.error('[CacheSyncService] Erro ao sincronizar usuário:', error);
      throw error;
    }
  }


  /**
   * Sincroniza dados offline pendentes para o Supabase quando voltar online
   */
  async syncPendingToSupabase(userId: string): Promise<void> {
    try {
      const database = await this.db.getDatabase();

      // Buscar validações criadas offline (que não existem no Supabase)
      // Esta é uma implementação básica - você pode adicionar uma coluna 'synced' para rastrear
      console.log('[CacheSyncService] Sincronizando dados pendentes para Supabase...');

      // TODO: Implementar lógica de sincronização de volta para o Supabase
      // Por exemplo, buscar validações recentes e tentar enviá-las

    } catch (error) {
      console.error('[CacheSyncService] Erro ao sincronizar pendências:', error);
      throw error;
    }
  }
}
