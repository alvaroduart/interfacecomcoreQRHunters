import { QRCodeRepository } from '../repositories/QRCodeRepository';
import { QRCode } from '../entities/QRCode';

export class GetQRCodeDetailsUseCase {
  constructor(private qrCodeRepository: QRCodeRepository) {}

  async execute(id: string): Promise<QRCode | undefined> {
    return this.qrCodeRepository.getQRCodeDetails(id);
  }
}

