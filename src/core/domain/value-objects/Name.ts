export class Name {
    private constructor(readonly value: string) {
        if (!Name.isValid(value)) {
            throw new Error("Invalid name. Name must be between 2 and 50 characters and contain only letters and spaces.");
        }
    }

    static create(name: string): Name {
        return new Name(name);
    }

    static isValid(name: string): boolean {
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        return nameRegex.test(name);
    }

    equals(other: Name): boolean {
        return this.value === other.value;
    }
}

