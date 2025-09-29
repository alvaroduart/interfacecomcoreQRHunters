import { ProgressFactory } from '@factories/ProgressFactory';

describe('Progress Use Cases', () => {
  it('should get user progress successfully', async () => {
    const getUserProgressUseCase = ProgressFactory.createGetUserProgressUseCase();
    const progress = await getUserProgressUseCase.execute('user123');
    expect(progress).toBeDefined();
    expect(progress.length).toBeGreaterThan(0);
    expect(progress[0].id).toBe('qr1');
  });
});

