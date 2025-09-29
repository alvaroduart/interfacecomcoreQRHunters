import { Email } from "../value-objects/Email";
import { Name } from "../value-objects/Name";
import { Password } from "../value-objects/Password";

export class User {
    private constructor(
        readonly id: string,
        readonly name: Name,
        readonly email: Email,
        readonly password: Password
    ) { }

    static create(
        id: string,
        name: Name,
        email: Email,
        password: Password
    ): User {
        return new User(id, name, email, password);
    }

    // Método para atualizar o nome do usuário
    updateName(newName: Name): User {
        return new User(this.id, newName, this.email, this.password);
    }

    // Método para atualizar o email do usuário
    updateEmail(newEmail: Email): User {
        return new User(this.id, this.name, newEmail, this.password);
    }

    // Método para atualizar a senha do usuário
    updatePassword(newPassword: Password): User {
        return new User(this.id, this.name, this.email, newPassword);
    }
}

