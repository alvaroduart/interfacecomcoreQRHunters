import { JourneyFactory } from '@factories/JourneyFactory';
import { Latitude } from '@domain/value-objects/Latitude';
import { Longitude } from '@domain/value-objects/Longitude';
import { JourneyPoint } from '@domain/entities/JourneyPoint';

describe('Journey Use Cases', () => {
  it('should get a journey successfully', async () => {
    const getJourneyUseCase = JourneyFactory.createGetJourneyUseCase();
    const journey = await getJourneyUseCase.execute('journey1');
    expect(journey).toBeDefined();
    expect(journey?.name).toBe('Percurso CEFET-MG');
    expect(journey?.points[0].latitude.value).toBe(-19.9227);
    expect(journey?.points[0].longitude.value).toBe(-43.9398);
  });

  it('should start a journey successfully', async () => {
    const startJourneyUseCase = JourneyFactory.createStartJourneyUseCase();
    const journey = await startJourneyUseCase.execute('journey1');
    expect(journey).toBeDefined();
    expect(journey.currentPointIndex).toBe(0);
    expect(journey.isCompleted).toBe(false);
  });

  it('should complete a journey point successfully', async () => {
    const completeJourneyPointUseCase = JourneyFactory.createCompleteJourneyPointUseCase();
    let journey = await JourneyFactory.createStartJourneyUseCase().execute('journey1');
    journey = await completeJourneyPointUseCase.execute(journey.id, journey.points[0].id);
    expect(journey).toBeDefined();
    expect(journey.points[0].isCompleted).toBe(true);
    expect(journey.currentPointIndex).toBe(1);
  });

  it('should finish a journey successfully', async () => {
    const finishJourneyUseCase = JourneyFactory.createFinishJourneyUseCase();
    let journey = await JourneyFactory.createStartJourneyUseCase().execute('journey1');
    journey = await finishJourneyUseCase.execute(journey.id);
    expect(journey).toBeDefined();
    expect(journey.isCompleted).toBe(true);
    expect(journey.points.every(p => p.isCompleted)).toBe(true);
  });

  it('should get all journeys successfully', async () => {
    const getAllJourneysUseCase = JourneyFactory.createGetAllJourneysUseCase();
    const journeys = await getAllJourneysUseCase.execute();
    expect(journeys).toBeDefined();
    expect(journeys.length).toBeGreaterThan(0);
  });
});

