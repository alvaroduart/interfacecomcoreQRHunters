import { QRCodeRepository } from '../../domain/repositories/QRCodeRepository';
import { QRCode } from '../../domain/entities/QRCode';
import { Code } from '../../domain/value-objects/Code';
import { Location } from '../../domain/value-objects/Location';

export class QRCodeRepositoryMock implements QRCodeRepository {
  private static instance: QRCodeRepositoryMock;
  private qrcodes: QRCode[] = [
    QRCode.create(
      'qr1',
      Code.create('code123'),
      Location.create('Biblioteca do CEFET-MG'),
      new Date(),
      'acertou',
      'Entrada principal'
    ),
    QRCode.create(
      'qr2',
      Code.create('code456'),
      Location.create('Laboratório de Informática'),
      new Date(),
      'errou',
      'Sala 201'
    ),
  ];

  private constructor() {}

  public static getInstance(): QRCodeRepositoryMock {
    if (!QRCodeRepositoryMock.instance) {
      QRCodeRepositoryMock.instance = new QRCodeRepositoryMock();
    }
    return QRCodeRepositoryMock.instance;
  }

  async scanQRCode(code: Code, location: Location): Promise<QRCode> {
    const existingQRCode = this.qrcodes.find(qr => qr.code.equals(code));

    if (existingQRCode) {
      const updatedQRCode = QRCode.create(
        existingQRCode.id,
        existingQRCode.code,
        existingQRCode.location,
        new Date(),
        'acertou',
        existingQRCode.description
      );
      return updatedQRCode;
    }

    const newQRCode = QRCode.create(
      `qr${this.qrcodes.length + 1}`,
      code,
      location,
      new Date(),
      'errou',
      'QR Code desconhecido'
    );
    this.qrcodes.push(newQRCode);
    return newQRCode;
  }

  async getQRCodeDetails(id: string): Promise<QRCode | undefined> {
    return this.qrcodes.find(qr => qr.id === id);
  }
}