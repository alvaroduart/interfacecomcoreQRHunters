import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { Name } from '../value-objects/Name';
import { Password } from '../value-objects/Password';

export interface AuthRepository {
  login(username: Name, password: Password): Promise<User>;
  register(username: Name, email: Email, password: Password): Promise<User>;
  updateProfile(userId: string, username: Name, email: Email): Promise<User>;
  changePassword(userId: string, oldPassword: Password, newPassword: Password): Promise<boolean>;
  deleteAccount(userId: string): Promise<boolean>;
}

