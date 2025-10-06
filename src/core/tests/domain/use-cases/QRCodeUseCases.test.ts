import { makeQRCodeUseCases } from '../../../factories/QRCodeFactory';

describe('Casos de Uso de QRCode', () => {
  it('deve escanear um QRCode conhecido com sucesso', async () => {
    const { scanQRCodeUseCase } = makeQRCodeUseCases();
    const params = {
      code: 'code123',
      location: 'Local Teste',
    };
    const qrCode = await scanQRCodeUseCase.execute(params);
    expect(qrCode).toBeDefined();
    expect(qrCode.code.value).toBe('code123');
    expect(qrCode.status).toBe('acertou');
  });

  it('deve escanear um QRCode desconhecido e retornar status de erro', async () => {
    const { scanQRCodeUseCase } = makeQRCodeUseCases();
    const params = {
      code: 'newCode123',
      location: 'Local Teste',
    };
    const qrCode = await scanQRCodeUseCase.execute(params);
    expect(qrCode).toBeDefined();
    expect(qrCode.code.value).toBe('newCode123');
    expect(qrCode.status).toBe('errou');
  });

  it('deve obter os detalhes do QRCode com sucesso', async () => {
    const { getQRCodeDetailsUseCase } = makeQRCodeUseCases();
    const params = { id: 'qr1' };
    const qrCode = await getQRCodeDetailsUseCase.execute(params);
    expect(qrCode).toBeDefined();
    expect(qrCode?.code.value).toBe('code123');
    expect(qrCode?.location.value).toBe('Biblioteca do CEFET-MG');
  });

  it('deve retornar indefinido para um QRCode inexistente', async () => {
    const { getQRCodeDetailsUseCase } = makeQRCodeUseCases();
    const params = { id: 'nonExistentId' };
    const qrCode = await getQRCodeDetailsUseCase.execute(params);
    expect(qrCode).toBeUndefined();
  });
});
