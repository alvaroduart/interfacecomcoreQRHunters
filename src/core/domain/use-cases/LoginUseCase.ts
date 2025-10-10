import { AuthRepository } from '../repositories/AuthRepository';
import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(params: {
    email: string;
    password: string;
  }): Promise<User> {
    const { email, password } = params;

    const emailVO = Email.create(email);
    const passwordVO = Password.create(password);

    return this.authRepository.login(emailVO, passwordVO);
  }
}