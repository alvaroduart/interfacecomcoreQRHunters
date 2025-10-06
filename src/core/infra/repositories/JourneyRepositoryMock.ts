import { JourneyRepository } from '../../domain/repositories/JourneyRepository';
import { Journey } from '../../domain/entities/Journey';
import { JourneyPoint } from '../../domain/entities/JourneyPoint';
import { Latitude } from '../../domain/value-objects/Latitude';
import { Longitude } from '../../domain/value-objects/Longitude';

export class JourneyRepositoryMock implements JourneyRepository {
  private static instance: JourneyRepositoryMock;
  private journeys: Journey[] = [
    Journey.create(
      'journey1',
      'Percurso CEFET-MG',
      [
        JourneyPoint.create('point1', 'Biblioteca', Latitude.create(-19.9227), Longitude.create(-43.9398), false, 'Entrada principal'),
        JourneyPoint.create('point2', 'Cantina', Latitude.create(-19.9230), Longitude.create(-43.9390), false, 'Ponto de encontro'),
        JourneyPoint.create('point3', 'Laboratório de Informática', Latitude.create(-19.9220), Longitude.create(-43.9385), false, 'Sala 201'),
      ],
      0,
      false,
      'Explore os pontos históricos do CEFET-MG'
    ),
    Journey.create(
      'journey2',
      'Percurso Centro Histórico',
      [
        JourneyPoint.create('point4', 'Praça da Liberdade', Latitude.create(-19.9200), Longitude.create(-43.9380), false, 'Marco histórico'),
        JourneyPoint.create('point5', 'Palácio das Artes', Latitude.create(-19.9210), Longitude.create(-43.9370), false, 'Centro cultural'),
      ],
      0,
      false,
      'Descubra a história de BH'
    ),
  ];

  private constructor() {}

  public static getInstance(): JourneyRepositoryMock {
    if (!JourneyRepositoryMock.instance) {
      JourneyRepositoryMock.instance = new JourneyRepositoryMock();
    }
    return JourneyRepositoryMock.instance;
  }

  async getJourney(journeyId: string): Promise<Journey | undefined> {
    return this.journeys.find(j => j.id === journeyId);
  }

  async getAllJourneys(): Promise<Journey[]> {
    return this.journeys;
  }

  async startJourney(journeyId: string): Promise<Journey> {
    const journeyIndex = this.journeys.findIndex(j => j.id === journeyId);
    if (journeyIndex === -1) {
      throw new Error('Journey not found');
    }
    const journey = this.journeys[journeyIndex];
    // Assuming starting a journey means resetting progress
    const updatedJourney = Journey.create(
      journey.id,
      journey.name,
      journey.points.map(p => JourneyPoint.create(p.id, p.name, p.latitude, p.longitude, false, p.description)),
      0,
      false,
      journey.description
    );
    this.journeys[journeyIndex] = updatedJourney;
    return updatedJourney;
  }

  async completeJourneyPoint(journeyId: string, pointId: string): Promise<Journey> {
    const journeyIndex = this.journeys.findIndex(j => j.id === journeyId);
    if (journeyIndex === -1) {
      throw new Error('Journey not found');
    }
    let journey = this.journeys[journeyIndex];

    const pointIndex = journey.points.findIndex(p => p.id === pointId);
    if (pointIndex === -1) {
      throw new Error('Journey point not found');
    }

    const updatedPoints = journey.points.map((point) => {
      if (point.id === pointId) {
        return JourneyPoint.create(point.id, point.name, point.latitude, point.longitude, true, point.description);
      }
      return point;
    });

    let newCurrentPointIndex = journey.currentPointIndex;
    if (pointIndex === journey.currentPointIndex) {
      newCurrentPointIndex++;
    }
    
    const allPointsCompleted = updatedPoints.every(p => p.isCompleted);

    const updatedJourney = Journey.create(
      journey.id,
      journey.name,
      updatedPoints,
      newCurrentPointIndex,
      allPointsCompleted,
      journey.description
    );

    this.journeys[journeyIndex] = updatedJourney;
    return updatedJourney;
  }

  async finishJourney(journeyId: string): Promise<Journey> {
    const journeyIndex = this.journeys.findIndex(j => j.id === journeyId);
    if (journeyIndex === -1) {
      throw new Error('Journey not found');
    }
    const journey = this.journeys[journeyIndex];

    const updatedPoints = journey.points.map(p => JourneyPoint.create(p.id, p.name, p.latitude, p.longitude, true, p.description));
    
    const updatedJourney = Journey.create(
      journey.id,
      journey.name,
      updatedPoints,
      journey.points.length,
      true,
      journey.description
    );

    this.journeys[journeyIndex] = updatedJourney;
    return updatedJourney;
  }
}