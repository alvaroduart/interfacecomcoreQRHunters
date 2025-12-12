import { QRCodeRepository } from '../domain/repositories/QRCodeRepository';
import { GetQRCodeDetailsUseCase } from '../domain/use-cases/GetQRCodeDetailsUseCase';
import { ScanQRCodeUseCase } from '../domain/use-cases/ScanQRCodeUseCase';
import { ValidateQRCodeUseCase } from '../domain/use-cases/ValidateQRCodeUseCase';
import { GetUserValidatedQRCodesUseCase } from '../domain/use-cases/GetUserValidatedQRCodesUseCase';
import { QRCodeRepositoryMock } from '../infra/repositories/QRCodeRepositoryMock';
import { QRCodeRepositoryHybrid } from '../infra/repositories/QRCodeRepositoryHybrid';
import { config } from '../config';

export function makeQRCodeUseCases() {
  // Usa repositório híbrido que escolhe automaticamente entre Supabase e SQLite
  const qrCodeRepository: QRCodeRepository = 
    config.repository === 'supabase' 
      ? QRCodeRepositoryHybrid.getInstance()
      : QRCodeRepositoryMock.getInstance();

  const getQRCodeDetailsUseCase = new GetQRCodeDetailsUseCase(qrCodeRepository);
  const scanQRCodeUseCase = new ScanQRCodeUseCase(qrCodeRepository);
  const validateQRCodeUseCase = new ValidateQRCodeUseCase(
    qrCodeRepository, 
    config.proximityRadiusMeters
  );
  const getUserValidatedQRCodesUseCase = new GetUserValidatedQRCodesUseCase(qrCodeRepository);

  return {
    getQRCodeDetailsUseCase,
    scanQRCodeUseCase,
    validateQRCodeUseCase,
    getUserValidatedQRCodesUseCase,
    repository: qrCodeRepository,
  };
}