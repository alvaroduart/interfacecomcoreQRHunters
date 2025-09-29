import { QRCodeRepository } from '../repositories/QRCodeRepository';
import { QRCode } from '../entities/QRCode';
import { Code } from '../value-objects/Code';
import { Location } from '../value-objects/Location';

export class ScanQRCodeUseCase {
  constructor(private qrCodeRepository: QRCodeRepository) {}

  async execute(code: Code, location: Location): Promise<QRCode> {
    return this.qrCodeRepository.scanQRCode(code, location);
  }
}

