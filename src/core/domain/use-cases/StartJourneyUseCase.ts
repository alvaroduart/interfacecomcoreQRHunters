import { JourneyRepository } from '../repositories/JourneyRepository';
import { Journey } from '../entities/Journey';

export class StartJourneyUseCase {
  constructor(private journeyRepository: JourneyRepository) {}

  async execute(journeyId: string): Promise<Journey> {
    return this.journeyRepository.startJourney(journeyId);
  }
}

