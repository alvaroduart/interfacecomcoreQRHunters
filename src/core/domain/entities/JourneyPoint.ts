import { Latitude } from "../value-objects/Latitude";
import { Longitude } from "../value-objects/Longitude";

export class JourneyPoint {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly latitude: Latitude,
    readonly longitude: Longitude,
    readonly isCompleted: boolean,
    readonly description?: string
  ) { }

  static create(
    id: string,
    name: string,
    latitude: Latitude,
    longitude: Longitude,
    isCompleted: boolean,
    description?: string
  ): JourneyPoint {
    return new JourneyPoint(id, name, latitude, longitude, isCompleted, description);
  }
}

