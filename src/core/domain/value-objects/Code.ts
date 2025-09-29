export class Code {
    private constructor(readonly value: string) {
        if (!Code.isValid(value)) {
            throw new Error("Invalid code. Code must be a non-empty string.");
        }
    }

    static create(code: string): Code {
        return new Code(code);
    }

    static isValid(code: string): boolean {
        return code.trim().length > 0;
    }

    equals(other: Code): boolean {
        return this.value === other.value;
    }
}

