import { JourneyRepositoryMock } from '../../../../core/infra/repositories/JourneyRepositoryMock';

describe('JourneyRepositoryMock', () => {
  it('poderia retornar uma jornada pelo id', async () => {
    const repo = JourneyRepositoryMock.getInstance();
    const journey = await repo.getJourney('journey1');
    expect(journey).toBeDefined();
    expect(journey?.id).toBe('journey1');
  });

  it('poderia iniciar uma jornada e reiniciar o progresso', async () => {
    const repo = JourneyRepositoryMock.getInstance();
    const started = await repo.startJourney('journey1');
    expect(started).toBeDefined();
    expect(started.currentPointIndex).toBe(0);
  });
});
