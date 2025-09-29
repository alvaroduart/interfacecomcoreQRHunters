import { Journey } from '../entities/Journey';
import { JourneyPoint } from '../entities/JourneyPoint';

export interface JourneyRepository {
  getJourney(journeyId: string): Promise<Journey | undefined>;
  startJourney(journeyId: string): Promise<Journey>;
  completeJourneyPoint(journeyId: string, pointId: string): Promise<Journey>;
  finishJourney(journeyId: string): Promise<Journey>;
  getAllJourneys(): Promise<Journey[]>;
}

