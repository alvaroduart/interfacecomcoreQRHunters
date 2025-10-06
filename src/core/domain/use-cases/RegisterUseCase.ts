import { AuthRepository } from '../repositories/AuthRepository';
import { User } from '../entities/User';
import { Name } from '../value-objects/Name';
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(name: Name, email: Email, password: Password): Promise<User> {
    return this.authRepository.register(name, email, password);
  }
}
