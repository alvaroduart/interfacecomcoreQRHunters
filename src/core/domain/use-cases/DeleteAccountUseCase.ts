import { AuthRepository } from '../repositories/AuthRepository';

export class DeleteAccountUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(params: { userId: string }): Promise<boolean> {
    const { userId } = params;
    return this.authRepository.deleteAccount(userId);
  }
}