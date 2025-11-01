import { QRCodeRepository } from '../domain/repositories/QRCodeRepository';
import { GetQRCodeDetailsUseCase } from '../domain/use-cases/GetQRCodeDetailsUseCase';
import { ScanQRCodeUseCase } from '../domain/use-cases/ScanQRCodeUseCase';
import { ValidateQRCodeUseCase } from '../domain/use-cases/ValidateQRCodeUseCase';
import { QRCodeRepositoryMock } from '../infra/repositories/QRCodeRepositoryMock';
import { QRCodeRepositorySupabase } from '../infra/repositories/QRCodeRepositorySupabase';
import { config } from '../config';

export function makeQRCodeUseCases() {
  // Escolhe o repositório baseado na configuração
  const qrCodeRepository: QRCodeRepository = 
    config.repository === 'supabase' 
      ? QRCodeRepositorySupabase.getInstance()
      : QRCodeRepositoryMock.getInstance();

  const getQRCodeDetailsUseCase = new GetQRCodeDetailsUseCase(qrCodeRepository);
  const scanQRCodeUseCase = new ScanQRCodeUseCase(qrCodeRepository);
  const validateQRCodeUseCase = new ValidateQRCodeUseCase(
    qrCodeRepository, 
    config.proximityRadiusMeters
  );

  return {
    getQRCodeDetailsUseCase,
    scanQRCodeUseCase,
    validateQRCodeUseCase,
    repository: qrCodeRepository,
  };
}