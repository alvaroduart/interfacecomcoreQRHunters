import { JourneyRepository } from '../repositories/JourneyRepository';
import { Journey } from '../entities/Journey';

export class FinishJourneyUseCase {
  constructor(private journeyRepository: JourneyRepository) {}

  async execute(journeyId: string): Promise<Journey> {
    return this.journeyRepository.finishJourney(journeyId);
  }
}

