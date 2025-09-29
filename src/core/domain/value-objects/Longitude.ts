export class Longitude {
    private constructor(readonly value: number) {
        if (!Longitude.isValid(value)) {
            throw new Error("Invalid longitude. Longitude must be between -180 and 180.");
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

