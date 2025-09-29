export class Latitude {
    private constructor(readonly value: number) {
        if (!Latitude.isValid(value)) {
            throw new Error("Invalid latitude. Latitude must be between -90 and 90.");
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

