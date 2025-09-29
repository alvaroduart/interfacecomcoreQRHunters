import { QRCodeFactory } from '@factories/QRCodeFactory';
import { Code } from '@domain/value-objects/Code';
import { Location } from '@domain/value-objects/Location';

describe('QRCode Use Cases', () => {
  it('should scan a QR Code successfully', async () => {
    const scanQRCodeUseCase = QRCodeFactory.createScanQRCodeUseCase();
    const code = Code.create('newCode123');
    const location = Location.create('Local Teste');
    const qrCode = await scanQRCodeUseCase.execute(code, location);
    expect(qrCode).toBeDefined();
    expect(qrCode.code.value).toBe('newCode123');
    expect(qrCode.status).toBe('errou'); // Based on mock logic
  });

  it('should get QR Code details successfully', async () => {
    const getQRCodeDetailsUseCase = QRCodeFactory.createGetQRCodeDetailsUseCase();
    const qrCode = await getQRCodeDetailsUseCase.execute('qr1');
    expect(qrCode).toBeDefined();
    expect(qrCode?.code.value).toBe('code123');
    expect(qrCode?.location.value).toBe('Biblioteca do CEFET-MG');
  });

  it('should return undefined for a non-existent QR Code', async () => {
    const getQRCodeDetailsUseCase = QRCodeFactory.createGetQRCodeDetailsUseCase();
    const qrCode = await getQRCodeDetailsUseCase.execute('nonExistentId');
    expect(qrCode).toBeUndefined();
  });
});

