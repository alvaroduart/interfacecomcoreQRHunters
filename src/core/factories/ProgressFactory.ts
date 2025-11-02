import { ProgressRepository } from '../domain/repositories/ProgressRepository';
import { GetUserProgressUseCase } from '../domain/use-cases/GetUserProgressUseCase';
import { ProgressRepositoryMock } from '../infra/repositories/ProgressRepositoryMock';
import { ProgressRepositorySupabase } from '../infra/repositories/ProgressRepositorySupabase';
import { config } from '../config';

export function makeProgressUseCases() {
  const progressRepository: ProgressRepository = 
    config.repository === 'supabase' 
      ? ProgressRepositorySupabase.getInstance()
      : ProgressRepositoryMock.getInstance();

  const getUserProgressUseCase = new GetUserProgressUseCase(progressRepository);

  return {
    getUserProgressUseCase,
  };
}