import { AuthFactory } from '@factories/AuthFactory';
import { Name } from '@domain/value-objects/Name';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';

describe('Auth Use Cases', () => {
  it('should login a user successfully', async () => {
    const loginUseCase = AuthFactory.createLoginUseCase();
    const username = Name.create('test');
    const password = Password.create('Password123!');
    const user = await loginUseCase.execute(username, password);
    expect(user).toBeDefined();
    expect(user.name.value).toBe('test');
  });

  it('should register a user successfully', async () => {
    const registerUseCase = AuthFactory.createRegisterUseCase();
    const username = Name.create('newUser');
    const email = Email.create('new@example.com');
    const password = Password.create('NewPassword123!');
    const user = await registerUseCase.execute(username, email, password);
    expect(user).toBeDefined();
    expect(user.name.value).toBe('newUser');
    expect(user.email.value).toBe('new@example.com');
  });

  it('should update a user profile successfully', async () => {
    const updateProfileUseCase = AuthFactory.createUpdateProfileUseCase();
    const updatedUsername = Name.create('updatedUser');
    const updatedEmail = Email.create('updated@example.com');
    const user = await updateProfileUseCase.execute('1', updatedUsername, updatedEmail);
    expect(user).toBeDefined();
    expect(user.name.value).toBe('updatedUser');
    expect(user.email.value).toBe('updated@example.com');
  });

  it('should change user password successfully', async () => {
    const changePasswordUseCase = AuthFactory.createChangePasswordUseCase();
    const oldPassword = Password.create('Password123!');
    const newPassword = Password.create('NewStrongPassword123!');
    const success = await changePasswordUseCase.execute('1', oldPassword, newPassword);
    expect(success).toBe(true);
  });

  it('should delete a user account successfully', async () => {
    const deleteAccountUseCase = AuthFactory.createDeleteAccountUseCase();
    const success = await deleteAccountUseCase.execute('1');
    expect(success).toBe(true);
  });

  it('should throw error for invalid login credentials', async () => {
    const loginUseCase = AuthFactory.createLoginUseCase();
    const username = Name.create('wrong');
    const password = Password.create('WrongPassword123!');
    await expect(loginUseCase.execute(username, password)).rejects.toThrow('Invalid credentials');
  });

  it('should throw error for invalid old password during password change', async () => {
    const changePasswordUseCase = AuthFactory.createChangePasswordUseCase();
    const oldPassword = Password.create('WrongPassword123!');
    const newPassword = Password.create('NewStrongPassword123!');
    await expect(changePasswordUseCase.execute('1', oldPassword, newPassword)).rejects.toThrow('Invalid old password');
  });
});

