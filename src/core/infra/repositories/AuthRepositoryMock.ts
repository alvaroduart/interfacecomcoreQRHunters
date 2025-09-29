import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Name } from '../../domain/value-objects/Name';
import { Password } from '../../domain/value-objects/Password';

export class AuthRepositoryMock implements AuthRepository {

  private static instance: AuthRepositoryMock;

  private constructor() {}

  public static getInstance(): AuthRepositoryMock {
    if (!AuthRepositoryMock.instance) {
      AuthRepositoryMock.instance = new AuthRepositoryMock();
    }
    return AuthRepositoryMock.instance;
  }

  async login(username: Name, password: Password): Promise<User> {
    console.log(`Mock Login: ${username.value}, ${password.value}`);
    if (username.value === 'test' && password.value === 'Password123!') {
      return User.create('1', Name.create('test'), Email.create('test@example.com'), Password.create('Password123!'));
    }
    throw new Error('Invalid credentials');
  }

  async register(username: Name, email: Email, password: Password): Promise<User> {
    console.log(`Mock Register: ${username.value}, ${email.value}, ${password.value}`);
    return User.create('2', username, email, password);
  }

  async updateProfile(userId: string, username: Name, email: Email): Promise<User> {
    console.log(`Mock Update Profile: ${userId}, ${username.value}, ${email.value}`);
    return User.create(userId, username, email, Password.create('Password123!')); // Password mockada
  }

  async changePassword(userId: string, oldPassword: Password, newPassword: Password): Promise<boolean> {
    console.log(`Mock Change Password: ${userId}, ${oldPassword.value}, ${newPassword.value}`);
    if (oldPassword.value === 'Password123!') {
      return true;
    }
    throw new Error('Invalid old password');
  }

  async deleteAccount(userId: string): Promise<boolean> {
    console.log(`Mock Delete Account: ${userId}`);
    return true;
  }
}

