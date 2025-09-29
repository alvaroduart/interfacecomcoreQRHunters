export class Password {
    private constructor(readonly value: string) {
        if (!Password.isValid(value)) {
            throw new Error("Invalid password. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        }
    }

    static create(password: string): Password {
        return new Password(password);
    }

    static isValid(password: string): boolean {
        // At least 8 characters, one uppercase, one lowercase, one number, one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"|,.<>\/?]).{8,}$/;
        return passwordRegex.test(password);
    }

    equals(other: Password): boolean {
        return this.value === other.value;
    }
}

