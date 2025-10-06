import { QRCode } from '../../../domain/entities/QRCode';
import { Code } from '../../../domain/value-objects/Code';
import { Location } from '../../../domain/value-objects/Location';

describe('Entidade: QRCode', () => {
  it('deve criar um QRCode válido', () => {
    const code = Code.create('test-code');
    const location = Location.create('Test Location');
    const scannedAt = new Date();
    const qrCode = QRCode.create('1', code, location, scannedAt, 'acertou', 'Test Description');

    expect(qrCode).toBeInstanceOf(QRCode);
    expect(qrCode.id).toBe('1');
    expect(qrCode.code.value).toBe('test-code');
    expect(qrCode.location.value).toBe('Test Location');
    expect(qrCode.scannedAt).toBe(scannedAt);
    expect(qrCode.status).toBe('acertou');
    expect(qrCode.description).toBe('Test Description');
  });
});