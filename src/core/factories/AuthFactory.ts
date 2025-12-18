import { AuthRepository } from '../domain/repositories/AuthRepository';
import { ChangePasswordUseCase } from '../domain/use-cases/ChangePasswordUseCase';
import { DeleteAccountUseCase } from '../domain/use-cases/DeleteAccountUseCase';
import { LoginUseCase } from '../domain/use-cases/LoginUseCase';
import { RegisterUseCase } from '../domain/use-cases/RegisterUseCase';
import { UpdateProfileUseCase } from '../domain/use-cases/UpdateProfileUseCase';
import { UploadAvatarUseCase } from '../domain/use-cases/UploadAvatarUseCase';
import { AuthRepositoryMock } from '../infra/repositories/AuthRepositoryMock';
import { AuthRepositoryHybrid } from '../infra/repositories/AuthRepositoryHybrid';
import { config } from '../config';

export function makeAuthUseCases() {
  const authRepository: AuthRepository = config.repository === 'supabase'
    ? AuthRepositoryHybrid.getInstance()
    : AuthRepositoryMock.getInstance();

  const changePasswordUseCase = new ChangePasswordUseCase(authRepository);
  const deleteAccountUseCase = new DeleteAccountUseCase(authRepository);
  const loginUseCase = new LoginUseCase(authRepository);
  const registerUseCase = new RegisterUseCase(authRepository);
  const updateProfileUseCase = new UpdateProfileUseCase(authRepository);
  const uploadAvatarUseCase = new UploadAvatarUseCase(authRepository);

  return {
    changePasswordUseCase,
    deleteAccountUseCase,
    loginUseCase,
    registerUseCase,
    updateProfileUseCase,
    uploadAvatarUseCase,
  };
}