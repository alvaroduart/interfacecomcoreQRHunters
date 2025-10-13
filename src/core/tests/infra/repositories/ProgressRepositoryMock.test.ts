import { ProgressRepositoryMock } from '../../../../core/infra/repositories/ProgressRepositoryMock';

describe('ProgressRepositoryMock', () => {
  it('poderia retornar o progresso do usuário como uma lista de entidades QRCode', async () => {
    const repo = ProgressRepositoryMock.getInstance();
    const progress = await repo.getUserProgress('1');
    expect(Array.isArray(progress)).toBe(true);
    expect(progress.length).toBeGreaterThanOrEqual(1);
  });
});
