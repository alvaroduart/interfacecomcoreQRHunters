import { makeAuthUseCases } from '../../factories/AuthFactory';
import { makeQRCodeUseCases } from '../../factories/QRCodeFactory';
import { makeJourneyUseCases } from '../../factories/JourneyFactory';
import { makeProgressUseCases } from '../../factories/ProgressFactory';

describe('makeAuthUseCases', () => {
  it(' poderia criar e retornar todos os casos de uso do usuário', () => {
    const useCases = makeAuthUseCases();

    expect(useCases.registerUseCase).toBeDefined();
    expect(useCases.loginUseCase).toBeDefined();
    expect(useCases.changePasswordUseCase).toBeDefined();
    expect(useCases.deleteAccountUseCase).toBeDefined();
    expect(useCases.updateProfileUseCase).toBeDefined();
  });
});

describe('makeQRCodeUseCases', () => {
  it('poderia criar e retornar todos os casos de uso de QR code', () => {
    const useCases = makeQRCodeUseCases();

    expect(useCases.scanQRCodeUseCase).toBeDefined();
    expect(useCases.getQRCodeDetailsUseCase).toBeDefined();
  });
});

describe('makeJourneyUseCases', () => {
  it('poderia criar e retornar todos os casos de uso de jornada', () => {
    const useCases = makeJourneyUseCases();

    expect(useCases.getAllJourneysUseCase).toBeDefined();
    expect(useCases.getJourneyUseCase).toBeDefined();
    expect(useCases.startJourneyUseCase).toBeDefined();
    expect(useCases.completeJourneyPointUseCase).toBeDefined();
    expect(useCases.finishJourneyUseCase).toBeDefined();
  });
});

describe('makeProgressUseCases', () => {
  it('poderia criar e retornar todos os casos de uso de progresso', () => {
    const useCases = makeProgressUseCases();

    expect(useCases.getUserProgressUseCase).toBeDefined();
  });
});
