import { ProgressRepositoryMock } from '../infra/repositories/ProgressRepositoryMock';
import { GetUserProgressUseCase } from '../domain/use-cases/GetUserProgressUseCase';

export class ProgressFactory {
  private static progressRepository = ProgressRepositoryMock.getInstance();

  static createGetUserProgressUseCase(): GetUserProgressUseCase {
    return new GetUserProgressUseCase(ProgressFactory.progressRepository);
  }
}

