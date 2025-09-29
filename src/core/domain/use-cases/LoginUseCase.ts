import { AuthRepository } from '../repositories/AuthRepository';
import { User } from '../entities/User';
import { Name } from '../value-objects/Name';
import { Password } from '../value-objects/Password';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(username: Name, password: Password): Promise<User> {
    return this.authRepository.login(username, password);
  }
}

