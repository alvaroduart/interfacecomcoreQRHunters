import { JourneyRepository } from '../repositories/JourneyRepository';
import { Journey } from '../entities/Journey';

export class CompleteJourneyPointUseCase {
  constructor(private journeyRepository: JourneyRepository) {}

  async execute(journeyId: string, pointId: string): Promise<Journey> {
    return this.journeyRepository.completeJourneyPoint(journeyId, pointId);
  }
}

