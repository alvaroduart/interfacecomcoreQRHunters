import { JourneyRepository } from '../domain/repositories/JourneyRepository';
import { CompleteJourneyPointUseCase } from '../domain/use-cases/CompleteJourneyPointUseCase';
import { FinishJourneyUseCase } from '../domain/use-cases/FinishJourneyUseCase';
import { GetAllJourneysUseCase } from '../domain/use-cases/GetAllJourneysUseCase';
import { GetJourneyUseCase } from '../domain/use-cases/GetJourneyUseCase';
import { StartJourneyUseCase } from '../domain/use-cases/StartJourneyUseCase';
import { JourneyRepositorySupabase } from '../infra/repositories/JourneyRepositorySupabase';

export function makeJourneyUseCases() {
  const journeyRepository: JourneyRepository = JourneyRepositorySupabase.getInstance();

  const completeJourneyPointUseCase = new CompleteJourneyPointUseCase(journeyRepository);
  const finishJourneyUseCase = new FinishJourneyUseCase(journeyRepository);
  const getAllJourneysUseCase = new GetAllJourneysUseCase(journeyRepository);
  const getJourneyUseCase = new GetJourneyUseCase(journeyRepository);
  const startJourneyUseCase = new StartJourneyUseCase(journeyRepository);

  return {
    completeJourneyPointUseCase,
    finishJourneyUseCase,
    getAllJourneysUseCase,
    getJourneyUseCase,
    startJourneyUseCase,
  };
}