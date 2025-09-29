import { ProgressRepository } from '../repositories/ProgressRepository';
import { QRCode } from '../entities/QRCode';

export class GetUserProgressUseCase {
  constructor(private progressRepository: ProgressRepository) {}

  async execute(userId: string): Promise<QRCode[]> {
    return this.progressRepository.getUserProgress(userId);
  }
}

