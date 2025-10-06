import { QRCodeRepository } from '../repositories/QRCodeRepository';
import { QRCode } from '../entities/QRCode';

export class GetQRCodeDetailsUseCase {
  constructor(private readonly qrCodeRepository: QRCodeRepository) {}

  async execute(params: { id: string }): Promise<QRCode | undefined> {
    const { id } = params;
    return this.qrCodeRepository.getQRCodeDetails(id);
  }
}