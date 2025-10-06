import { ProgressRepository } from '../repositories/ProgressRepository';
import { QRCode } from '../entities/QRCode';

export class GetUserProgressUseCase {
  constructor(private readonly progressRepository: ProgressRepository) {}

  async execute(params: { userId: string }): Promise<QRCode[]> {
    const { userId } = params;
    return this.progressRepository.getUserProgress(userId);
  }
}