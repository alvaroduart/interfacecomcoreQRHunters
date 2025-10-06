import { JourneyRepository } from '../repositories/JourneyRepository';
import { Journey } from '../entities/Journey';

export class GetAllJourneysUseCase {
  constructor(private readonly journeyRepository: JourneyRepository) {}

  async execute(): Promise<Journey[]> {
    return this.journeyRepository.getAllJourneys();
  }
}