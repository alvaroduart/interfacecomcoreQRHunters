import { AuthRepository } from '../repositories/AuthRepository';
import { User } from '../entities/User';
import { Name } from '../value-objects/Name';
import { Email } from '../value-objects/Email';

export class UpdateProfileUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(userId: string, username: Name, email: Email): Promise<User> {
    return this.authRepository.updateProfile(userId, username, email);
  }
}

