export class Password {
    private constructor(readonly value: string) {
        if (!Password.isValid(value)) {
            throw new Error("Senha inválida. A senha deve ter pelo menos 8 caracteres, conter uma letra maiúscula, uma letra minúscula, um número e um caractere especial.");
        }
    }

    static create(password: string): Password {
        return new Password(password);
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

