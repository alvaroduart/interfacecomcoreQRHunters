import { JourneyRepository } from '../../domain/repositories/JourneyRepository';
import { Journey } from '../../domain/entities/Journey';
import { JourneyPoint } from '../../domain/entities/JourneyPoint';
import { Latitude } from '../../domain/value-objects/Latitude';
import { Longitude } from '../../domain/value-objects/Longitude';
import { supabase } from '../api/supabaseClient';

export class JourneyRepositorySupabase implements JourneyRepository {
  private static instance: JourneyRepositorySupabase;

  private constructor() {}

  public static getInstance(): JourneyRepositorySupabase {
    if (!JourneyRepositorySupabase.instance) {
      JourneyRepositorySupabase.instance = new JourneyRepositorySupabase();
    }
    return JourneyRepositorySupabase.instance;
  }

  async getJourney(journeyId: string): Promise<Journey | undefined> {
    console.log('[JourneyRepositorySupabase] Buscando jornada:', journeyId);
    
    try {
      // Buscar a jornada
      const { data: journeyData, error: journeyError } = await supabase
        .from('journeys')
        .select('*')
        .eq('id', journeyId)
        .single();

      if (journeyError) {
        console.error('[JourneyRepositorySupabase] Erro ao buscar jornada:', journeyError);
        return undefined;
      }

      if (!journeyData) {
        console.log('[JourneyRepositorySupabase] Jornada não encontrada');
        return undefined;
      }

      // Buscar os pontos da jornada com os dados dos QR codes
      const { data: pointsData, error: pointsError } = await supabase
        .from('journey_points')
        .select(`
          id,
          order_index,
          description,
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
        console.error('[JourneyRepositorySupabase] Erro ao buscar pontos:', pointsError);
        return undefined;
      }

      // Buscar progresso do usuário (se existir)
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

        // Buscar quais pontos já foram validados
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
          qrcode.id, // Usar o ID do QR code, não do journey_point
          qrcode.location_name,
          Latitude.create(Number(qrcode.latitude)),
          Longitude.create(Number(qrcode.longitude)),
          isPointCompleted,
          point.description
        );
      });

      const journey = Journey.create(
        journeyData.id,
        journeyData.name,
        points,
        currentPointIndex,
        isCompleted,
        journeyData.description
      );

      console.log('[JourneyRepositorySupabase] Jornada carregada:', {
        id: journey.id,
        name: journey.name,
        pointsCount: points.length,
        currentPointIndex,
        isCompleted
      });

      return journey;
    } catch (error) {
      console.error('[JourneyRepositorySupabase] Erro inesperado:', error);
      return undefined;
    }
  }

  async getAllJourneys(): Promise<Journey[]> {
    console.log('[JourneyRepositorySupabase] Buscando todas as jornadas');
    
    try {
      // Buscar todas as jornadas
      const { data: journeysData, error: journeysError } = await supabase
        .from('journeys')
        .select('*')
        .order('created_at', { ascending: false });

      if (journeysError) {
        console.error('[JourneyRepositorySupabase] Erro ao buscar jornadas:', journeysError);
        return [];
      }

      if (!journeysData || journeysData.length === 0) {
        console.log('[JourneyRepositorySupabase] Nenhuma jornada encontrada');
        return [];
      }

      // Para cada jornada, buscar os detalhes completos
      const journeys = await Promise.all(
        journeysData.map(async (journeyData: any) => {
          const journey = await this.getJourney(journeyData.id);
          return journey;
        })
      );

      // Filtrar jornadas que não foram carregadas (undefined)
      const validJourneys = journeys.filter((j: any): j is Journey => j !== undefined);

      console.log('[JourneyRepositorySupabase] Total de jornadas:', validJourneys.length);
      return validJourneys;
    } catch (error) {
      console.error('[JourneyRepositorySupabase] Erro inesperado:', error);
      return [];
    }
  }

  async startJourney(journeyId: string): Promise<Journey> {
    console.log('[JourneyRepositorySupabase] Iniciando jornada:', journeyId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se já existe um registro de progresso
      const { data: existingData } = await supabase
        .from('user_journeys')
        .select('*')
        .eq('user_id', user.id)
        .eq('journey_id', journeyId)
        .single();

      if (existingData) {
        // Resetar o progresso
        const { error: updateError } = await supabase
          .from('user_journeys')
          .update({
            current_point_index: 0,
            is_completed: false,
            started_at: new Date().toISOString(),
            completed_at: null
          })
          .eq('user_id', user.id)
          .eq('journey_id', journeyId);

        if (updateError) {
          console.error('[JourneyRepositorySupabase] Erro ao resetar jornada:', updateError);
          throw new Error('Erro ao resetar jornada');
        }
      } else {
        // Criar novo registro de progresso
        const { error: insertError } = await supabase
          .from('user_journeys')
          .insert({
            user_id: user.id,
            journey_id: journeyId,
            current_point_index: 0,
            is_completed: false,
            started_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('[JourneyRepositorySupabase] Erro ao iniciar jornada:', insertError);
          throw new Error('Erro ao iniciar jornada');
        }
      }

      // Retornar a jornada atualizada
      const journey = await this.getJourney(journeyId);
      if (!journey) {
        throw new Error('Erro ao carregar jornada após iniciar');
      }

      console.log('[JourneyRepositorySupabase] Jornada iniciada com sucesso');
      return journey;
    } catch (error) {
      console.error('[JourneyRepositorySupabase] Erro ao iniciar jornada:', error);
      throw error;
    }
  }

  async completeJourneyPoint(journeyId: string, pointId: string): Promise<Journey> {
    console.log('[JourneyRepositorySupabase] Completando ponto:', { journeyId, pointId });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar o progresso atual
      const { data: userJourneyData } = await supabase
        .from('user_journeys')
        .select('current_point_index')
        .eq('user_id', user.id)
        .eq('journey_id', journeyId)
        .single();

      if (!userJourneyData) {
        throw new Error('Jornada não iniciada');
      }

      // Buscar a jornada para verificar quantos pontos tem
      const journey = await this.getJourney(journeyId);
      if (!journey) {
        throw new Error('Jornada não encontrada');
      }

      // Incrementar o índice do ponto atual
      const newIndex = userJourneyData.current_point_index + 1;
      const allCompleted = newIndex >= journey.points.length;

      // Atualizar o progresso
      const updateData: any = {
        current_point_index: newIndex
      };

      if (allCompleted) {
        updateData.is_completed = true;
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('user_journeys')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('journey_id', journeyId);

      if (updateError) {
        console.error('[JourneyRepositorySupabase] Erro ao atualizar progresso:', updateError);
        throw new Error('Erro ao atualizar progresso');
      }

      console.log('[JourneyRepositorySupabase] Ponto completado:', { newIndex, allCompleted });

      // Retornar a jornada atualizada
      const updatedJourney = await this.getJourney(journeyId);
      if (!updatedJourney) {
        throw new Error('Erro ao carregar jornada após completar ponto');
      }

      return updatedJourney;
    } catch (error) {
      console.error('[JourneyRepositorySupabase] Erro ao completar ponto:', error);
      throw error;
    }
  }

  async finishJourney(journeyId: string): Promise<Journey> {
    console.log('[JourneyRepositorySupabase] Finalizando jornada:', journeyId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar a jornada
      const journey = await this.getJourney(journeyId);
      if (!journey) {
        throw new Error('Jornada não encontrada');
      }

      // Marcar como completada
      const { error: updateError } = await supabase
        .from('user_journeys')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          current_point_index: journey.points.length
        })
        .eq('user_id', user.id)
        .eq('journey_id', journeyId);

      if (updateError) {
        console.error('[JourneyRepositorySupabase] Erro ao finalizar jornada:', updateError);
        throw new Error('Erro ao finalizar jornada');
      }

      console.log('[JourneyRepositorySupabase] Jornada finalizada com sucesso');

      // Retornar a jornada atualizada
      const updatedJourney = await this.getJourney(journeyId);
      if (!updatedJourney) {
        throw new Error('Erro ao carregar jornada após finalizar');
      }

      return updatedJourney;
    } catch (error) {
      console.error('[JourneyRepositorySupabase] Erro ao finalizar jornada:', error);
      throw error;
    }
  }
}
