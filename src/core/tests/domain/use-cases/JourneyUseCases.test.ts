import { makeJourneyUseCases } from '../../../factories/JourneyFactory';

describe('Casos de Uso de Jornada', () => {
  it('deve obter uma jornada com sucesso', async () => {
    const { getJourneyUseCase } = makeJourneyUseCases();
    const params = { journeyId: 'journey1' };
    const journey = await getJourneyUseCase.execute(params);
    expect(journey).toBeDefined();
    expect(journey?.name).toBe('Percurso CEFET-MG');
  });

  it('deve iniciar uma jornada com sucesso', async () => {
    const { startJourneyUseCase } = makeJourneyUseCases();
    const params = { journeyId: 'journey1' };
    const journey = await startJourneyUseCase.execute(params);
    expect(journey).toBeDefined();
    expect(journey.currentPointIndex).toBe(0);
    expect(journey.isCompleted).toBe(false);
  });

  it('deve completar um ponto da jornada com sucesso', async () => {
    const { startJourneyUseCase, completeJourneyPointUseCase } = makeJourneyUseCases();
    const startParams = { journeyId: 'journey1' };
    const journey = await startJourneyUseCase.execute(startParams);

    const completeParams = {
      journeyId: journey.id,
      pointId: journey.points[0].id,
    };
    const updatedJourney = await completeJourneyPointUseCase.execute(completeParams);
    expect(updatedJourney).toBeDefined();
    expect(updatedJourney.points[0].isCompleted).toBe(true);
    expect(updatedJourney.currentPointIndex).toBe(1);
  });

  it('deve finalizar uma jornada com sucesso', async () => {
    const { finishJourneyUseCase } = makeJourneyUseCases();
    const params = { journeyId: 'journey1' };
    const journey = await finishJourneyUseCase.execute(params);
    expect(journey).toBeDefined();
    expect(journey.isCompleted).toBe(true);
    expect(journey.points.every(p => p.isCompleted)).toBe(true);
  });

  it('deve obter todas as jornadas com sucesso', async () => {
    const { getAllJourneysUseCase } = makeJourneyUseCases();
    const journeys = await getAllJourneysUseCase.execute();
    expect(journeys).toBeDefined();
    expect(journeys.length).toBeGreaterThan(0);
  });
});
