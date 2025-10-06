import { AuthRepository } from '../repositories/AuthRepository';
import { Password } from '../value-objects/Password';

export class ChangePasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(params: {
    userId: string;
    oldPassword: string;
    newPassword: string;
  }): Promise<boolean> {
    const { userId, oldPassword, newPassword } = params;

    const oldPasswordVO = Password.create(oldPassword);
    const newPasswordVO = Password.create(newPassword);

    return this.authRepository.changePassword(
      userId,
      oldPasswordVO,
      newPasswordVO
    );
  }
}