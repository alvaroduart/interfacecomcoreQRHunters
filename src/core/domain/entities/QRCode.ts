import { Code } from "../value-objects/Code";
import { Location } from "../value-objects/Location";
import { Coordinates } from "../value-objects/Coordinates";
import { Question } from "./Question";

export class QRCode {
  private constructor(
    readonly id: string,
    readonly code: Code,
    readonly location: Location,
    readonly coordinates: Coordinates,
    readonly question: Question,
    readonly scannedAt?: Date,
    readonly status?: 'acertou' | 'errou',
    readonly description?: string
  ) { }

  static create(
    id: string,
    code: Code,
    location: Location,
    coordinates: Coordinates,
    question: Question,
    scannedAt?: Date,
    status?: 'acertou' | 'errou',
    description?: string
  ): QRCode {
    return new QRCode(id, code, location, coordinates, question, scannedAt, status, description);
  }

  // Método para criar uma cópia com status atualizado
  withValidation(status: 'acertou' | 'errou'): QRCode {
    return new QRCode(
      this.id,
      this.code,
      this.location,
      this.coordinates,
      this.question,
      new Date(),
      status,
      this.description
    );
  }
}

