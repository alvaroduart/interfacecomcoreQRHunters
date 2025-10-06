import { Journey } from '../../../domain/entities/Journey';
import { JourneyPoint } from '../../../domain/entities/JourneyPoint';
import { Latitude } from '../../../domain/value-objects/Latitude';
import { Longitude } from '../../../domain/value-objects/Longitude';

describe('Entidade: Journey', () => {
  let samplePoints: JourneyPoint[];

  beforeEach(() => {
    const lat = Latitude.create(0);
    const lon = Longitude.create(0);
    samplePoints = [
      JourneyPoint.create('p1', 'Point 1', lat, lon, false, 'Desc 1'),
      JourneyPoint.create('p2', 'Point 2', lat, lon, false, 'Desc 2'),
    ];
  });

  it('deve criar uma Journey válida', () => {
    const journey = Journey.create('j1', 'Test Journey', samplePoints, 0, false, 'Test Description');

    expect(journey).toBeInstanceOf(Journey);
    expect(journey.id).toBe('j1');
    expect(journey.name).toBe('Test Journey');
    expect(journey.points.length).toBe(2);
    expect(journey.currentPointIndex).toBe(0);
    expect(journey.isCompleted).toBe(false);
    expect(journey.description).toBe('Test Description');
  });

  it('deve atualizar o índice do ponto atual', () => {
    const journey = Journey.create('j1', 'Test Journey', samplePoints, 0, false);
    const updatedJourney = journey.updateCurrentPointIndex(1);

    expect(updatedJourney.currentPointIndex).toBe(1);
  });

  it('deve marcar a jornada como concluída', () => {
    const journey = Journey.create('j1', 'Test Journey', samplePoints, 0, false);
    const updatedJourney = journey.markAsCompleted();

    expect(updatedJourney.isCompleted).toBe(true);
  });

  it('deve atualizar os pontos da jornada', () => {
    const journey = Journey.create('j1', 'Test Journey', samplePoints, 0, false);
    const lat = Latitude.create(10);
    const lon = Longitude.create(10);
    const newPoints = [JourneyPoint.create('p3', 'Point 3', lat, lon, false, 'Desc 3')];
    const updatedJourney = journey.updatePoints(newPoints);

    expect(updatedJourney.points.length).toBe(1);
    expect(updatedJourney.points[0].id).toBe('p3');
  });
});