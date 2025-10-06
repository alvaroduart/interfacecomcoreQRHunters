import { AuthRepository } from '../repositories/AuthRepository';
import { User } from '../entities/User';
import { Name } from '../value-objects/Name';
import { Password } from '../value-objects/Password';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(params: {
    name: string;
    password: string;
  }): Promise<User> {
    const { name, password } = params;

    const nameVO = Name.create(name);
    const passwordVO = Password.create(password);

    return this.authRepository.login(nameVO, passwordVO);
  }
}