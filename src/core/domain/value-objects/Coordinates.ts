import { Latitude } from "./Latitude";
import { Longitude } from "./Longitude";

export class Coordinates {
    private constructor(
        readonly latitude: Latitude,
        readonly longitude: Longitude
    ) {}

    static create(latitude: number, longitude: number): Coordinates {
        const lat = Latitude.create(latitude);
        const lng = Longitude.create(longitude);
        return new Coordinates(lat, lng);
    }

    equals(other: Coordinates): boolean {
        return this.latitude.equals(other.latitude) && 
               this.longitude.equals(other.longitude);
    }

    // Calcula a distância em metros entre duas coordenadas usando a fórmula de Haversine
    distanceTo(other: Coordinates): number {
        const R = 6371e3; // Raio da Terra em metros
        const φ1 = this.latitude.value * Math.PI / 180;
        const φ2 = other.latitude.value * Math.PI / 180;
        const Δφ = (other.latitude.value - this.latitude.value) * Math.PI / 180;
        const Δλ = (other.longitude.value - this.longitude.value) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distância em metros
    }

    // Verifica se está dentro de um raio específico (em metros)
    isWithinRadius(other: Coordinates, radiusInMeters: number): boolean {
        return this.distanceTo(other) <= radiusInMeters;
    }
}
