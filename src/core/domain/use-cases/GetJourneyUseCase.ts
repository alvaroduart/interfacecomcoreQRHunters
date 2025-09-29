import { JourneyRepository } from '../repositories/JourneyRepository';
import { Journey } from '../entities/Journey';

export class GetJourneyUseCase {
  constructor(private journeyRepository: JourneyRepository) {}

  async execute(journeyId: string): Promise<Journey | undefined> {
    return this.journeyRepository.getJourney(journeyId);
  }
}

