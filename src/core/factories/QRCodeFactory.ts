import { QRCodeRepository } from '../domain/repositories/QRCodeRepository';
import { GetQRCodeDetailsUseCase } from '../domain/use-cases/GetQRCodeDetailsUseCase';
import { ScanQRCodeUseCase } from '../domain/use-cases/ScanQRCodeUseCase';
import { QRCodeRepositoryMock } from '../infra/repositories/QRCodeRepositoryMock';

export function makeQRCodeUseCases() {
  const qrCodeRepository: QRCodeRepository = QRCodeRepositoryMock.getInstance();

  const getQRCodeDetailsUseCase = new GetQRCodeDetailsUseCase(qrCodeRepository);
  const scanQRCodeUseCase = new ScanQRCodeUseCase(qrCodeRepository);

  return {
    getQRCodeDetailsUseCase,
    scanQRCodeUseCase,
  };
}