import { ProgressRepository } from '../domain/repositories/ProgressRepository';
import { GetUserProgressUseCase } from '../domain/use-cases/GetUserProgressUseCase';
import { ProgressRepositoryMock } from '../infra/repositories/ProgressRepositoryMock';

export function makeProgressUseCases() {
  const progressRepository: ProgressRepository = ProgressRepositoryMock.getInstance();

  const getUserProgressUseCase = new GetUserProgressUseCase(progressRepository);

  return {
    getUserProgressUseCase,
  };
}