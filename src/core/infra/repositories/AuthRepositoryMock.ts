import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Name } from '../../domain/value-objects/Name';
import { Password } from '../../domain/value-objects/Password';

export class AuthRepositoryMock implements AuthRepository {
  private static instance: AuthRepositoryMock;
  public users: User[] = [];

  private constructor() {}

  public static getInstance(): AuthRepositoryMock {
    if (!AuthRepositoryMock.instance) {
      AuthRepositoryMock.instance = new AuthRepositoryMock();
    }
    return AuthRepositoryMock.instance;
  }

  async login(username: Name, password: Password): Promise<User> {
    const user = this.users.find(u => u.name.equals(username) && u.password.equals(password));
    if (user) {
      return user;
    }
    throw new Error('Invalid credentials');
  }

  async register(username: Name, email: Email, password: Password): Promise<User> {
    const userExists = this.users.some(u => u.email.equals(email));
    if (userExists) {
      throw new Error('User already exists');
    }
    const newUser = User.create(String(this.users.length + 1), username, email, password);
    this.users.push(newUser);
    return newUser;
  }

  async updateProfile(userId: string, username: Name, email: Email): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const oldUser = this.users[userIndex];
      const updatedUser = User.create(userId, username, email, oldUser.password);
      this.users[userIndex] = updatedUser;
      return updatedUser;
    }
    throw new Error('User not found');
  }

  async changePassword(userId: string, oldPassword: Password, newPassword: Password): Promise<boolean> {
    const user = this.users.find(u => u.id === userId);
    if (user && user.password.equals(oldPassword)) {
      const userIndex = this.users.findIndex(u => u.id === userId);
      const updatedUser = User.create(userId, user.name, user.email, newPassword);
      this.users[userIndex] = updatedUser;
      return true;
    }
    throw new Error('Invalid old password or user not found');
  }

  async deleteAccount(userId: string): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
      return true;
    }
    return false;
  }

  public findByEmail(email: Email): Promise<User | undefined> {
    return Promise.resolve(this.users.find(u => u.email.equals(email)));
  }

  public reset(): void {
    this.users = [];
  }
}