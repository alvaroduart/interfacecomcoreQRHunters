export class Email {
    private constructor(readonly value: string) {
        if (!Email.isValid(value)) {
            throw new Error("Endereço de e-mail inválido");
        }
    }

    static create(email: string): Email {
        return new Email(email);
    }

    static isValid(email: string): boolean {
        // regex simples para validação de e-mail
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(email);
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }
}

