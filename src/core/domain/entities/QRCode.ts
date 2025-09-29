import { Code } from "../value-objects/Code";
import { Location } from "../value-objects/Location";

export class QRCode {
  private constructor(
    readonly id: string,
    readonly code: Code,
    readonly location: Location,
    readonly scannedAt: Date,
    readonly status: 'acertou' | 'errou',
    readonly description?: string
  ) { }

  static create(
    id: string,
    code: Code,
    location: Location,
    scannedAt: Date,
    status: 'acertou' | 'errou',
    description?: string
  ): QRCode {
    return new QRCode(id, code, location, scannedAt, status, description);
  }
}

