import { makeProgressUseCases } from '../../../factories/ProgressFactory';

describe('Casos de Uso de Progresso', () => {
  it('deve obter o progresso do usuário com sucesso', async () => {
    const { getUserProgressUseCase } = makeProgressUseCases();
    const params = { userId: '1' };
    const progress = await getUserProgressUseCase.execute(params);
    expect(progress).toBeDefined();
    expect(progress.length).toBe(2);
    expect(progress[0].id).toBe('qr1');
  });

  it('deve retornar um array vazio para um usuário sem progresso', async () => {
    const { getUserProgressUseCase } = makeProgressUseCases();
    const params = { userId: 'user-with-no-progress' };
    const progress = await getUserProgressUseCase.execute(params);
    expect(progress).toBeDefined();
    expect(progress.length).toBe(0);
  });
});
