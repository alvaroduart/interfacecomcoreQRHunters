import { JourneyRepository } from '../../domain/repositories/JourneyRepository';
import { Journey } from '../../domain/entities/Journey';
import { JourneyPoint } from '../../domain/entities/JourneyPoint';
import { Latitude } from '../../domain/value-objects/Latitude';
import { Longitude } from '../../domain/value-objects/Longitude';

export class JourneyRepositoryMock implements JourneyRepository {

  private static instance: JourneyRepositoryMock;

  private constructor() {}

  public static getInstance(): JourneyRepositoryMock {
    if (!JourneyRepositoryMock.instance) {
      JourneyRepositoryMock.instance = new JourneyRepositoryMock();
    }
    return JourneyRepositoryMock.instance;
  }

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

  async getJourney(journeyId: string): Promise<Journey | undefined> {
    console.log(`Mock Get Journey: ${journeyId}`);
    return this.journeys.find(j => j.id === journeyId);
  }

  async startJourney(journeyId: string): Promise<Journey> {
    console.log(`Mock Start Journey: ${journeyId}`);
    const journey = this.journeys.find(j => j.id === journeyId);
    if (!journey) throw new Error('Journey not found');
    const updatedJourney = journey.updateCurrentPointIndex(0);
    return updatedJourney;
  }

  async completeJourneyPoint(journeyId: string, pointId: string): Promise<Journey> {
    console.log(`Mock Complete Journey Point: ${journeyId}, ${pointId}`);
    let journey = this.journeys.find(j => j.id === journeyId);
    if (!journey) throw new Error('Journey not found');

    const pointIndex = journey.points.findIndex(p => p.id === pointId);
    if (pointIndex === -1) throw new Error('Journey point not found');

    const updatedPoints = [...journey.points];
    updatedPoints[pointIndex] = JourneyPoint.create(
      updatedPoints[pointIndex].id,
      updatedPoints[pointIndex].name,
      updatedPoints[pointIndex].latitude,
      updatedPoints[pointIndex].longitude,
      true,
      updatedPoints[pointIndex].description
    );

    let newCurrentPointIndex = journey.currentPointIndex;
    if (pointIndex === journey.currentPointIndex) {
      newCurrentPointIndex++;
    }

    let isCompleted = journey.isCompleted;
    if (newCurrentPointIndex >= updatedPoints.length) {
      isCompleted = true;
    }

    journey = Journey.create(
      journey.id,
      journey.name,
      updatedPoints,
      newCurrentPointIndex,
      isCompleted,
      journey.description
    );

    // Atualizar a jornada na lista de jornadas mockadas
    const journeyIndex = this.journeys.findIndex(j => j.id === journeyId);
    if (journeyIndex !== -1) {
      this.journeys[journeyIndex] = journey;
    }

    return journey;
  }

  async finishJourney(journeyId: string): Promise<Journey> {
    console.log(`Mock Finish Journey: ${journeyId}`);
    let journey = this.journeys.find(j => j.id === journeyId);
    if (!journey) throw new Error('Journey not found');

    const updatedPoints = journey.points.map(p => JourneyPoint.create(p.id, p.name, p.latitude, p.longitude, true, p.description));
    journey = Journey.create(
      journey.id,
      journey.name,
      updatedPoints,
      updatedPoints.length,
      true,
      journey.description
    );

    // Atualizar a jornada na lista de jornadas mockadas
    const journeyIndex = this.journeys.findIndex(j => j.id === journeyId);
    if (journeyIndex !== -1) {
      this.journeys[journeyIndex] = journey;
    }

    return journey;
  }

  async getAllJourneys(): Promise<Journey[]> {
    console.log('Mock Get All Journeys');
    return this.journeys;
  }
}

