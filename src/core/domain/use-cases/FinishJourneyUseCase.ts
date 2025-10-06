import { JourneyRepository } from '../repositories/JourneyRepository';
import { Journey } from '../entities/Journey';

export class FinishJourneyUseCase {
  constructor(private readonly journeyRepository: JourneyRepository) {}

  async execute(params: { journeyId: string }): Promise<Journey> {
    const { journeyId } = params;
    return this.journeyRepository.finishJourney(journeyId);
  }
}