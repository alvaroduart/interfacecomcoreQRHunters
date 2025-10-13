export class Name {
    private constructor(readonly value: string) {
        if (!Name.isValid(value)) {
            throw new Error("Nome inválido. O nome deve ter entre 2 e 50 caracteres e conter apenas letras e espaços.");
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

