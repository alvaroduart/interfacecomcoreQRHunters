import { AuthRepository } from '../repositories/AuthRepository';

export class DeleteAccountUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(userId: string): Promise<boolean> {
    return this.authRepository.deleteAccount(userId);
  }
}

