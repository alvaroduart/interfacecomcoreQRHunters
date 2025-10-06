import { User } from '../../../domain/entities/User';
import { Name } from '../../../domain/value-objects/Name';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';

describe('Entidade: User', () => {
  it('deve criar um usuário válido', () => {
    const name = Name.create('Test User');
    const email = Email.create('test@example.com');
    const password = Password.create('Password123!');
    const user = User.create('1', name, email, password);

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe('1');
    expect(user.name.value).toBe('Test User');
    expect(user.email.value).toBe('test@example.com');
    expect(user.password.value).toBe('Password123!');
  });

  it('deve atualizar o nome do usuário', () => {
    const name = Name.create('Test User');
    const email = Email.create('test@example.com');
    const password = Password.create('Password123!');
    const user = User.create('1', name, email, password);

    const newName = Name.create('New Name');
    const updatedUser = user.updateName(newName);

    expect(updatedUser.name.value).toBe('New Name');
    expect(updatedUser.email.value).toBe('test@example.com');
  });

  it('deve atualizar o email do usuário', () => {
    const name = Name.create('Test User');
    const email = Email.create('test@example.com');
    const password = Password.create('Password123!');
    const user = User.create('1', name, email, password);

    const newEmail = Email.create('new@example.com');
    const updatedUser = user.updateEmail(newEmail);

    expect(updatedUser.email.value).toBe('new@example.com');
    expect(updatedUser.name.value).toBe('Test User');
  });

  it('deve atualizar a senha do usuário', () => {
    const name = Name.create('Test User');
    const email = Email.create('test@example.com');
    const password = Password.create('Password123!');
    const user = User.create('1', name, email, password);

    const newPassword = Password.create('NewPassword123!');
    const updatedUser = user.updatePassword(newPassword);

    expect(updatedUser.password.value).toBe('NewPassword123!');
  });
});