export class Latitude {
    private constructor(readonly value: number) {
        if (!Latitude.isValid(value)) {
            throw new Error("Latitude inválida. A latitude deve estar entre -90 e 90.");
        }
    }

    static create(latitude: number): Latitude {
        return new Latitude(latitude);
    }

    static isValid(latitude: number): boolean {
        return latitude >= -90 && latitude <= 90;
    }

    equals(other: Latitude): boolean {
        return this.value === other.value;
    }
}

