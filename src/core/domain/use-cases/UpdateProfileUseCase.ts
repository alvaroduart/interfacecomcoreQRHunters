import { AuthRepository } from '../repositories/AuthRepository';
import { User } from '../entities/User';
import { Name } from '../value-objects/Name';
import { Email } from '../value-objects/Email';

export class UpdateProfileUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(params: {
    userId: string;
    name: string;
    email: string;
  }): Promise<User> {
    const { userId, name, email } = params;

    const nameVO = Name.create(name);
    const emailVO = Email.create(email);

    return this.authRepository.updateProfile(userId, nameVO, emailVO);
  }
}