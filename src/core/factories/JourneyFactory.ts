import { JourneyRepositoryMock } from '../infra/repositories/JourneyRepositoryMock';
import { GetJourneyUseCase } from '../domain/use-cases/GetJourneyUseCase';
import { StartJourneyUseCase } from '../domain/use-cases/StartJourneyUseCase';
import { CompleteJourneyPointUseCase } from '../domain/use-cases/CompleteJourneyPointUseCase';
import { FinishJourneyUseCase } from '../domain/use-cases/FinishJourneyUseCase';
import { GetAllJourneysUseCase } from '../domain/use-cases/GetAllJourneysUseCase';

export class JourneyFactory {
  private static journeyRepository = JourneyRepositoryMock.getInstance();

  static createGetJourneyUseCase(): GetJourneyUseCase {
    return new GetJourneyUseCase(JourneyFactory.journeyRepository);
  }

  static createStartJourneyUseCase(): StartJourneyUseCase {
    return new StartJourneyUseCase(JourneyFactory.journeyRepository);
  }

  static createCompleteJourneyPointUseCase(): CompleteJourneyPointUseCase {
    return new CompleteJourneyPointUseCase(JourneyFactory.journeyRepository);
  }

  static createFinishJourneyUseCase(): FinishJourneyUseCase {
    return new FinishJourneyUseCase(JourneyFactory.journeyRepository);
  }

  static createGetAllJourneysUseCase(): GetAllJourneysUseCase {
    return new GetAllJourneysUseCase(JourneyFactory.journeyRepository);
  }
}

