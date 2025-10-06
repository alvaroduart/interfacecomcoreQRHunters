import { JourneyRepository } from '../repositories/JourneyRepository';
import { Journey } from '../entities/Journey';

export class GetJourneyUseCase {
  constructor(private readonly journeyRepository: JourneyRepository) {}

  async execute(params: { journeyId: string }): Promise<Journey | undefined> {
    const { journeyId } = params;
    return this.journeyRepository.getJourney(journeyId);
  }
}