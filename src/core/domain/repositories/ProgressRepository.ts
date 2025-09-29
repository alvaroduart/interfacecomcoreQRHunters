import { QRCode } from '../entities/QRCode';

export interface ProgressRepository {
  getUserProgress(userId: string): Promise<QRCode[]>;
}

