import { JourneyRepository } from '../../domain/repositories/JourneyRepository';
import { Journey } from '../../domain/entities/Journey';
import { JourneyPoint } from '../../domain/entities/JourneyPoint';
import { Latitude } from '../../domain/value-objects/Latitude';
import { Longitude } from '../../domain/value-objects/Longitude';
import { supabase } from '../api/supabaseClient';
import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { NetworkService } from '../services/NetworkService';
import { CacheSyncService } from '../services/CacheSyncService';

/**
 * Repositório híbrido que usa Supabase quando online e SQLite quando offline
 */
export class JourneyRepositoryHybrid implements JourneyRepository {
  private static instance: JourneyRepositoryHybrid;
  private db: SQLiteDatabase;
  private network: NetworkService;
  private cacheSync: CacheSyncService;

  private constructor() {
    this.db = SQLiteDatabase.getInstance();
    this.network = NetworkService.getInstance();
    this.cacheSync = CacheSyncService.getInstance();
  }

  public static getInstance(): JourneyRepositoryHybrid {
    if (!JourneyRepositoryHybrid.instance) {
      JourneyRepositoryHybrid.instance = new JourneyRepositoryHybrid();
    }
    return JourneyRepositoryHybrid.instance;
  }

  async getJourney(journeyId: string): Promise<Journey | undefined> {
    const isOnline = await this.network.checkConnection();

    if (isOnline) {
      try {
        return await this.getJourneyFromSupabase(journeyId);
      } catch (error) {
        console.log('[JourneyRepositoryHybrid] Falha no Supabase, tentando cache...');
        return await this.getJourneyFromCache(journeyId);
      }
    } else {
      return await this.getJourneyFromCache(journeyId);
    }
  }

  async getAllJourneys(): Promise<Journey[]> {
    const isOnline = await this.network.checkConnection();

    if (isOnline) {
      try {
        return await this.getAllJourneysFromSupabase();
      } catch (error) {
        console.log('[JourneyRepositoryHybrid] Falha no Supabase, tentando cache...');
        return await this.getAllJourneysFromCache();
      }
    } else {
      return await this.getAllJourneysFromCache();
    }
  }

  async startJourney(journeyId: string): Promise<Journey> {
    // Operações de escrita sempre tentam Supabase primeiro
    const isOnline = await this.network.checkConnection();

    if (!isOnline) {
      throw new Error('Não é possível iniciar jornada offline. Conecte-se à internet.');
    }

    return await this.startJourneyOnSupabase(journeyId);
  }

  async completeJourneyPoint(journeyId: string, pointId: string): Promise<Journey> {
    const isOnline = await this.network.checkConnection();

    if (!isOnline) {
      throw new Error('Não é possível completar ponto offline. Conecte-se à internet.');
    }

    return await this.completeJourneyPointOnSupabase(journeyId, pointId);
  }

  async finishJourney(journeyId: string): Promise<Journey> {
    const isOnline = await this.network.checkConnection();

    if (!isOnline) {
      throw new Error('Não é possível finalizar jornada offline. Conecte-se à internet.');
    }

    return await this.finishJourneyOnSupabase(journeyId);
  }

  // ============ MÉTODOS PRIVADOS - SUPABASE ============

  private async getJourneyFromSupabase(journeyId: string): Promise<Journey | undefined> {
    console.log('[JourneyRepositoryHybrid] Buscando jornada no Supabase:', journeyId);

    const { data: journeyData, error: journeyError } = await supabase
      .from('journeys')
      .select('*')
      .eq('id', journeyId)
      .single();

    if (journeyError || !journeyData) {
      console.error('[JourneyRepositoryHybrid] Erro ao buscar jornada:', journeyError);
      return undefined;
    }

    // Sincronizar jornada para cache
    await this.cacheSync.syncJourney(journeyData);

    // Buscar os pontos da jornada
    const { data: pointsData, error: pointsError } = await supabase
      .from('journey_points')
      .select(`
        id,
        order_index,
        description,
        qrcode_id,
        qrcodes (
          id,
          code,
          location_name,
          latitude,
          longitude
        )
      `)
      .eq('journey_id', journeyId)
      .order('order_index', { ascending: true });

    if (pointsError) {
      console.error('[JourneyRepositoryHybrid] Erro ao buscar pontos:', pointsError);
      return undefined;
    }

    // Sincronizar pontos para cache
    for (const point of pointsData || []) {
      try {
        await this.cacheSync.syncQRCode(point.qrcodes);
      } catch (err) {
        console.warn('[JourneyRepositoryHybrid] Erro ao sincronizar QRCode do ponto:', err);
      }
    }

    // Buscar progresso do usuário
    const { data: { user } } = await supabase.auth.getUser();
    let currentPointIndex = 0;
    let isCompleted = false;
    let completedPointIds: string[] = [];

    if (user) {
      const { data: userJourneyData } = await supabase
        .from('user_journeys')
        .select('current_point_index, is_completed')
        .eq('user_id', user.id)
        .eq('journey_id', journeyId)
        .single();

      if (userJourneyData) {
        currentPointIndex = userJourneyData.current_point_index;
        isCompleted = userJourneyData.is_completed;
      }

      // Buscar pontos validados
      const qrcodeIds = pointsData?.map((p: any) => p.qrcodes.id) || [];
      if (qrcodeIds.length > 0) {
        const { data: validationsData } = await supabase
          .from('validations')
          .select('qrcode_id')
          .eq('user_id', user.id)
          .in('qrcode_id', qrcodeIds)
          .eq('status', 'acertou');

        completedPointIds = validationsData?.map((v: any) => v.qrcode_id) || [];
      }
    }

    // Mapear os pontos
    const points = (pointsData || []).map((point: any) => {
      const qrcode = point.qrcodes;
      const isPointCompleted = completedPointIds.includes(qrcode.id);

      return JourneyPoint.create(
        qrcode.id,
        qrcode.location_name,
        Latitude.create(Number(qrcode.latitude)),
        Longitude.create(Number(qrcode.longitude)),
        isPointCompleted,
        point.description
      );
    });

    return Journey.create(
      journeyData.id,
      journeyData.name,
      points,
      currentPointIndex,
      isCompleted,
      journeyData.description
    );
  }

  private async getAllJourneysFromSupabase(): Promise<Journey[]> {
    console.log('[JourneyRepositoryHybrid] Buscando todas as jornadas no Supabase');

    const { data: journeysData, error: journeysError } = await supabase
      .from('journeys')
      .select('*')
      .order('created_at', { ascending: false });

    if (journeysError || !journeysData || journeysData.length === 0) {
      console.error('[JourneyRepositoryHybrid] Erro ao buscar jornadas:', journeysError);
      return [];
    }

    // Sincronizar todas as jornadas
    for (const journeyData of journeysData) {
      try {
        await this.cacheSync.syncJourney(journeyData);
      } catch (err) {
        console.warn('[JourneyRepositoryHybrid] Erro ao sincronizar jornada:', err);
      }
    }

    // Buscar detalhes de cada jornada
    const journeys = await Promise.all(
      journeysData.map(async (journeyData: any) => {
        return await this.getJourneyFromSupabase(journeyData.id);
      })
    );

    return journeys.filter((j): j is Journey => j !== undefined);
  }

  private async startJourneyOnSupabase(journeyId: string): Promise<Journey> {
    console.log('[JourneyRepositoryHybrid] Iniciando jornada no Supabase:', journeyId);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: existingData } = await supabase
      .from('user_journeys')
      .select('*')
      .eq('user_id', user.id)
      .eq('journey_id', journeyId)
      .single();

    if (existingData) {
      await supabase
        .from('user_journeys')
        .update({
          current_point_index: 0,
          is_completed: false,
          started_at: new Date().toISOString(),
          completed_at: null
        })
        .eq('user_id', user.id)
        .eq('journey_id', journeyId);
    } else {
      await supabase
        .from('user_journeys')
        .insert({
          user_id: user.id,
          journey_id: journeyId,
          current_point_index: 0,
          is_completed: false,
          started_at: new Date().toISOString()
        });
    }

    const journey = await this.getJourneyFromSupabase(journeyId);
    if (!journey) {
      throw new Error('Erro ao carregar jornada após iniciar');
    }

    return journey;
  }

  private async completeJourneyPointOnSupabase(journeyId: string, pointId: string): Promise<Journey> {
    console.log('[JourneyRepositoryHybrid] Completando ponto no Supabase:', pointId);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const journey = await this.getJourneyFromSupabase(journeyId);
    if (!journey) {
      throw new Error('Jornada não encontrada');
    }

    const nextIndex = journey.currentPointIndex + 1;
    const isJourneyCompleted = nextIndex >= journey.points.length;

    await supabase
      .from('user_journeys')
      .update({
        current_point_index: nextIndex,
        is_completed: isJourneyCompleted,
        completed_at: isJourneyCompleted ? new Date().toISOString() : null
      })
      .eq('user_id', user.id)
      .eq('journey_id', journeyId);

    const updatedJourney = await this.getJourneyFromSupabase(journeyId);
    if (!updatedJourney) {
      throw new Error('Erro ao carregar jornada atualizada');
    }

    return updatedJourney;
  }

  private async finishJourneyOnSupabase(journeyId: string): Promise<Journey> {
    console.log('[JourneyRepositoryHybrid] Finalizando jornada no Supabase:', journeyId);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    await supabase
      .from('user_journeys')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('journey_id', journeyId);

    const journey = await this.getJourneyFromSupabase(journeyId);
    if (!journey) {
      throw new Error('Erro ao carregar jornada finalizada');
    }

    return journey;
  }

  // ============ MÉTODOS PRIVADOS - CACHE ============

  private async getJourneyFromCache(journeyId: string): Promise<Journey | undefined> {
    console.log('[JourneyRepositoryHybrid] Buscando jornada no cache:', journeyId);

    const database = await this.db.getDatabase();

    // Buscar jornada
    const journeyData = await database.getFirstAsync<any>(`
      SELECT * FROM journeys WHERE id = ?
    `, [journeyId]);

    if (!journeyData) {
      console.log('[JourneyRepositoryHybrid] Jornada não encontrada no cache');
      return undefined;
    }

    // Buscar pontos da jornada
    const pointsData = await database.getAllAsync<any>(`
      SELECT jp.*, q.code, q.location_name, q.latitude, q.longitude, q.description
      FROM journey_points jp
      INNER JOIN qrcodes q ON jp.qrcode_id = q.id
      WHERE jp.journey_id = ?
      ORDER BY jp.sequence_order ASC
    `, [journeyId]);

    // Mapear pontos (sem informação de completado offline - seria necessário adicionar lógica adicional)
    const points = pointsData.map((point: any) => {
      return JourneyPoint.create(
        point.qrcode_id,
        point.location_name,
        Latitude.create(Number(point.latitude)),
        Longitude.create(Number(point.longitude)),
        false, // Offline não temos info de conclusão
        point.description
      );
    });

    return Journey.create(
      journeyData.id,
      journeyData.name,
      points,
      0, // Offline começamos do zero
      false,
      journeyData.description
    );
  }

  private async getAllJourneysFromCache(): Promise<Journey[]> {
    console.log('[JourneyRepositoryHybrid] Buscando todas as jornadas no cache');

    const database = await this.db.getDatabase();

    const journeysData = await database.getAllAsync<any>(`
      SELECT * FROM journeys
      ORDER BY created_at DESC
    `);

    if (!journeysData || journeysData.length === 0) {
      console.log('[JourneyRepositoryHybrid] Nenhuma jornada no cache');
      return [];
    }

    const journeys = await Promise.all(
      journeysData.map(async (journeyData: any) => {
        return await this.getJourneyFromCache(journeyData.id);
      })
    );

    return journeys.filter((j): j is Journey => j !== undefined);
  }
}
