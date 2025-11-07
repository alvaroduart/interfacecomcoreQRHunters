import { Email } from "../value-objects/Email";
import { Name } from "../value-objects/Name";
import { Password } from "../value-objects/Password";

export class User {
    private constructor(
        readonly id: string,
        readonly name: Name,
        readonly email: Email,
        readonly password: Password,
        readonly avatarUrl?: string
    ) { }

    static create(
        id: string,
        name: Name,
        email: Email,
        password: Password,
        avatarUrl?: string
    ): User {
        return new User(id, name, email, password, avatarUrl);
    }

    // Método para atualizar o nome do usuário
    updateName(newName: Name): User {
        return new User(this.id, newName, this.email, this.password, this.avatarUrl);
    }

    // Método para atualizar o email do usuário
    updateEmail(newEmail: Email): User {
        return new User(this.id, this.name, newEmail, this.password, this.avatarUrl);
    }

    // Método para atualizar a senha do usuário
    updatePassword(newPassword: Password): User {
        return new User(this.id, this.name, this.email, newPassword, this.avatarUrl);
    }

    // Método para atualizar o avatar do usuário
    updateAvatar(newAvatarUrl: string): User {
        return new User(this.id, this.name, this.email, this.password, newAvatarUrl);
    }
}

