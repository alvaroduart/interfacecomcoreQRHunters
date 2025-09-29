import { QRCodeRepositoryMock } from '../infra/repositories/QRCodeRepositoryMock';
import { ScanQRCodeUseCase } from '../domain/use-cases/ScanQRCodeUseCase';
import { GetQRCodeDetailsUseCase } from '../domain/use-cases/GetQRCodeDetailsUseCase';

export class QRCodeFactory {
  private static qrCodeRepository = QRCodeRepositoryMock.getInstance();

  static createScanQRCodeUseCase(): ScanQRCodeUseCase {
    return new ScanQRCodeUseCase(QRCodeFactory.qrCodeRepository);
  }

  static createGetQRCodeDetailsUseCase(): GetQRCodeDetailsUseCase {
    return new GetQRCodeDetailsUseCase(QRCodeFactory.qrCodeRepository);
  }
}

