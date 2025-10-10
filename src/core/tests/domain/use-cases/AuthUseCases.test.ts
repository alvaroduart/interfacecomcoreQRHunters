import { makeAuthUseCases } from '../../../factories/AuthFactory';
import { AuthRepositoryMock } from '../../../infra/repositories/AuthRepositoryMock';

describe('Casos de Uso de Autenticação', () => {
  beforeEach(() => {
    AuthRepositoryMock.getInstance().reset();
  });
  it('deve registrar um usuário com sucesso', async () => {
    const { registerUseCase } = makeAuthUseCases();
    const params = {
      name: 'newUser',
      email: 'new@example.com',
      password: 'NewPassword123!',
    };
    const user = await registerUseCase.execute(params);
    expect(user).toBeDefined();
    expect(user.name.value).toBe('newUser');
    expect(user.email.value).toBe('new@example.com');
  });

  it('deve lançar um erro ao registrar um usuário que já existe', async () => {
    const { registerUseCase } = makeAuthUseCases();
    const params = {
      name: 'newUser',
      email: 'new@example.com',
      password: 'NewPassword123!',
    };
    await registerUseCase.execute(params);
    await expect(registerUseCase.execute(params)).rejects.toThrow('User already exists');
  });

  it('deve logar um usuário com sucesso após o registro', async () => {
    const { registerUseCase, loginUseCase } = makeAuthUseCases();
    const registerParams = {
      name: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
    };
    await registerUseCase.execute(registerParams);

    const loginParams = {
      email: 'test@example.com',
      password: 'Password123!',
    };
    const user = await loginUseCase.execute(loginParams);
    expect(user).toBeDefined();
    expect(user.email.value).toBe('test@example.com');
  });

  it('deve atualizar o perfil de um usuário com sucesso', async () => {
    const { registerUseCase, updateProfileUseCase } = makeAuthUseCases();
    const registerParams = {
      name: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
    };
    const user = await registerUseCase.execute(registerParams);

    const updateParams = {
      userId: user.id,
      name: 'updatedUser',
      email: 'updated@example.com',
    };
    const updatedUser = await updateProfileUseCase.execute(updateParams);
    expect(updatedUser).toBeDefined();
    expect(updatedUser.name.value).toBe('updatedUser');
    expect(updatedUser.email.value).toBe('updated@example.com');
  });

  it('deve alterar a senha do usuário com sucesso', async () => {
    const { registerUseCase, changePasswordUseCase } = makeAuthUseCases();
    const registerParams = {
      name: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
    };
    const user = await registerUseCase.execute(registerParams);

    const changePasswordParams = {
      userId: user.id,
      oldPassword: 'Password123!',
      newPassword: 'NewStrongPassword123!',
    };
    const success = await changePasswordUseCase.execute(changePasswordParams);
    expect(success).toBe(true);
  });

  it('deve deletar a conta de um usuário com sucesso', async () => {
    const { registerUseCase, deleteAccountUseCase, loginUseCase } = makeAuthUseCases();
    const registerParams = {
      name: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
    };
    const user = await registerUseCase.execute(registerParams);

    const deleteParams = { userId: user.id };
    const success = await deleteAccountUseCase.execute(deleteParams);
    expect(success).toBe(true);

    const loginParams = {
      email: 'test@example.com',
      password: 'Password123!',
    };
    await expect(loginUseCase.execute(loginParams)).rejects.toThrow('Invalid credentials');
  });
});
