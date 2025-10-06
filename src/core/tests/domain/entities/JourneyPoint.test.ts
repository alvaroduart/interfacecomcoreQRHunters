import { JourneyPoint } from '../../../domain/entities/JourneyPoint';
import { Latitude } from '../../../domain/value-objects/Latitude';
import { Longitude } from '../../../domain/value-objects/Longitude';

describe('Entidade: JourneyPoint', () => {
  it('deve criar um JourneyPoint válido', () => {
    const latitude = Latitude.create(45);
    const longitude = Longitude.create(90);
    const journeyPoint = JourneyPoint.create('1', 'Test Point', latitude, longitude, false, 'Test Description');

    expect(journeyPoint).toBeInstanceOf(JourneyPoint);
    expect(journeyPoint.id).toBe('1');
    expect(journeyPoint.name).toBe('Test Point');
    expect(journeyPoint.latitude.value).toBe(45);
    expect(journeyPoint.longitude.value).toBe(90);
    expect(journeyPoint.isCompleted).toBe(false);
    expect(journeyPoint.description).toBe('Test Description');
  });
});