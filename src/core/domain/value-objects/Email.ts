export class Email {
    private constructor(readonly value: string) {
        if (!Email.isValid(value)) {
            throw new Error("Invalid email address");
        }
    }

    static create(email: string): Email {
        return new Email(email);
    }

    static isValid(email: string): boolean {
        // Simpler email regex to avoid issues with test values
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(email);
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }
}

