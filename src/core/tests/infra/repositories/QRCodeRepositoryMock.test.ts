import { QRCodeRepositoryMock } from '../../../../core/infra/repositories/QRCodeRepositoryMock';
import { Code } from '../../../../core/domain/value-objects/Code';
import { Location } from '../../../../core/domain/value-objects/Location';

describe('QRCodeRepositoryMock', () => {
  it('poderia escanear um QR code existente e retornar um QRCode', async () => {
    const repo = QRCodeRepositoryMock.getInstance();
    const code = Code.create('code123');
    const location = Location.create('Test Location');

    const result = await repo.scanQRCode(code, location);
    expect(result).toBeDefined();
    expect(result.code.equals(code)).toBe(true);
  });

  it('poderia criar um novo QR code quando o código é desconhecido', async () => {
    const repo = QRCodeRepositoryMock.getInstance();
    const code = Code.create('newcode999');
    const location = Location.create('Another Location');

    const result = await repo.scanQRCode(code, location);
    expect(result).toBeDefined();
    expect(result.code.equals(code)).toBe(true);
  });
});
