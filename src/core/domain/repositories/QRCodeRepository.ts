import { QRCode } from '../entities/QRCode';
import { Code } from '../value-objects/Code';
import { Location } from '../value-objects/Location';

export interface QRCodeRepository {
  scanQRCode(code: Code, location: Location): Promise<QRCode>;
  getQRCodeDetails(id: string): Promise<QRCode | undefined>;
  updateQRCode(qrCode: QRCode): Promise<QRCode>;
  getQRCodeByCode(code: string): Promise<QRCode | undefined>;
  getUserValidations(userId: string): Promise<any[]>;
}

