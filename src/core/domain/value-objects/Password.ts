export class Password {
    private constructor(readonly value: string, skipValidation: boolean = false) {
        if (!skipValidation && !Password.isValid(value)) {
            throw new Error("Senha inválida. A senha deve ter pelo menos 8 caracteres, conter uma letra maiúscula, uma letra minúscula, um número e um caractere especial.");
        }
    }

    static create(password: string): Password {
        return new Password(password, false);
    }

    // Usado para login - não valida o formato, apenas encapsula o valor
    static createForAuth(password: string): Password {
        return new Password(password, true);
    }

    static isValid(password: string): boolean {
        //com 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"|,.<>\/?]).{8,}$/;
        return passwordRegex.test(password);
    }

    equals(other: Password): boolean {
        return this.value === other.value;
    }
}

