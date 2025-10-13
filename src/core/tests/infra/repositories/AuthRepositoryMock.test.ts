import { AuthRepositoryMock } from '../../../../core/infra/repositories/AuthRepositoryMock';
import { User } from '../../../../core/domain/entities/User';
import { Name } from '../../../../core/domain/value-objects/Name';
import { Email } from '../../../../core/domain/value-objects/Email';
import { Password } from '../../../../core/domain/value-objects/Password';

describe('AuthRepositoryMock', () => {
  beforeEach(() => {
    AuthRepositoryMock.getInstance().reset();
  });

  it('poderia não lançar erro ao atualizar um usuário inexistente', async () => {
    const userRepository = AuthRepositoryMock.getInstance();
    const user = User.create(
      '1',
      Name.create('John Doe'),
      Email.create('john.doe@example.com'),
    Password.create('Password1!')
    );

    await expect(userRepository.updateProfile(user.id, user.name, user.email)).rejects.toThrow();
  });

  it('poderia registrar e então fazer login de um usuário', async () => {
    const userRepository = AuthRepositoryMock.getInstance();

  const registered = await userRepository.register(Name.create('Jane Doe'), Email.create('jane@example.com'), Password.create('Secret1!'));
    expect(registered).toBeDefined();

  const logged = await userRepository.login(Email.create('jane@example.com'), Password.create('Secret1!'));
    expect(logged).toBeDefined();
    expect(logged.email.equals(Email.create('jane@example.com'))).toBe(true);
  });
});
