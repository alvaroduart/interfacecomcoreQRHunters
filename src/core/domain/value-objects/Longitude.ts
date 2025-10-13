export class Longitude {
    private constructor(readonly value: number) {
        if (!Longitude.isValid(value)) {
            throw new Error("Longitude inválida. A longitude deve estar entre -180 e 180.");
        }
    }

    static create(longitude: number): Longitude {
        return new Longitude(longitude);
    }

    static isValid(longitude: number): boolean {
        return longitude >= -180 && longitude <= 180;
    }

    equals(other: Longitude): boolean {
        return this.value === other.value;
    }
}

