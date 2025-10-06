import { JourneyRepository } from '../repositories/JourneyRepository';
import { Journey } from '../entities/Journey';

export class CompleteJourneyPointUseCase {
  constructor(private readonly journeyRepository: JourneyRepository) {}

  async execute(params: {
    journeyId: string;
    pointId: string;
  }): Promise<Journey> {
    const { journeyId, pointId } = params;
    return this.journeyRepository.completeJourneyPoint(journeyId, pointId);
  }
}