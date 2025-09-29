import { AuthRepositoryMock } from '../infra/repositories/AuthRepositoryMock';
import { LoginUseCase } from '../domain/use-cases/LoginUseCase';
import { RegisterUseCase } from '../domain/use-cases/RegisterUseCase';
import { UpdateProfileUseCase } from '../domain/use-cases/UpdateProfileUseCase';
import { ChangePasswordUseCase } from '../domain/use-cases/ChangePasswordUseCase';
import { DeleteAccountUseCase } from '../domain/use-cases/DeleteAccountUseCase';

export class AuthFactory {
  private static authRepository = AuthRepositoryMock.getInstance();

  static createLoginUseCase(): LoginUseCase {
    return new LoginUseCase(AuthFactory.authRepository);
  }

  static createRegisterUseCase(): RegisterUseCase {
    return new RegisterUseCase(AuthFactory.authRepository);
  }

  static createUpdateProfileUseCase(): UpdateProfileUseCase {
    return new UpdateProfileUseCase(AuthFactory.authRepository);
  }

  static createChangePasswordUseCase(): ChangePasswordUseCase {
    return new ChangePasswordUseCase(AuthFactory.authRepository);
  }

  static createDeleteAccountUseCase(): DeleteAccountUseCase {
    return new DeleteAccountUseCase(AuthFactory.authRepository);
  }
}



