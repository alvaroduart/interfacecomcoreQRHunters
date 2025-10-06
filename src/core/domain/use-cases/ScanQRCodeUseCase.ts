import { QRCodeRepository } from '../repositories/QRCodeRepository';
import { QRCode } from '../entities/QRCode';
import { Code } from '../value-objects/Code';
import { Location } from '../value-objects/Location';

export class ScanQRCodeUseCase {
  constructor(private readonly qrCodeRepository: QRCodeRepository) {}

  async execute(params: {
    code: string;
    location: string;
  }): Promise<QRCode> {
    const { code, location } = params;

    const codeVO = Code.create(code);
    const locationVO = Location.create(location);

    return this.qrCodeRepository.scanQRCode(codeVO, locationVO);
  }
}