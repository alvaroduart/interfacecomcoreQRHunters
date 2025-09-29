import { JourneyPoint } from './JourneyPoint';

export class Journey {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | undefined,
    readonly points: JourneyPoint[],
    readonly currentPointIndex: number,
    readonly isCompleted: boolean
  ) { }

  static create(
    id: string,
    name: string,
    points: JourneyPoint[],
    currentPointIndex: number,
    isCompleted: boolean,
    description?: string
  ): Journey {
    return new Journey(id, name, description, points, currentPointIndex, isCompleted);
  }

  updateCurrentPointIndex(newIndex: number): Journey {
    return new Journey(this.id, this.name, this.description, this.points, newIndex, this.isCompleted);
  }

  markAsCompleted(): Journey {
    return new Journey(this.id, this.name, this.description, this.points, this.currentPointIndex, true);
  }

  updatePoints(updatedPoints: JourneyPoint[]): Journey {
    return new Journey(this.id, this.name, this.description, updatedPoints, this.currentPointIndex, this.isCompleted);
  }
}

