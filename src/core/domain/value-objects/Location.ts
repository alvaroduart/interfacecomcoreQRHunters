export class Location {
    private constructor(readonly value: string) {
        if (!Location.isValid(value)) {
            throw new Error("Invalid location. Location must be a non-empty string.");
        }
    }

    static create(location: string): Location {
        return new Location(location);
    }

    static isValid(location: string): boolean {
        return location.trim().length > 0;
    }

    equals(other: Location): boolean {
        return this.value === other.value;
    }
}

