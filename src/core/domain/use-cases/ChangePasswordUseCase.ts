import { AuthRepository } from '../repositories/AuthRepository';
import { Password } from '../value-objects/Password';

export class ChangePasswordUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(userId: string, oldPassword: Password, newPassword: Password): Promise<boolean> {
    return this.authRepository.changePassword(userId, oldPassword, newPassword);
  }
}

