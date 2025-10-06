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
        const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegex.test(email);
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }
}

