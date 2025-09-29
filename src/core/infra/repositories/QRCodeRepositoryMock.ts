import { QRCodeRepository } from '../../domain/repositories/QRCodeRepository';
import { QRCode } from '../../domain/entities/QRCode';
import { Code } from '../../domain/value-objects/Code';
import { Location } from '../../domain/value-objects/Location';

export class QRCodeRepositoryMock implements QRCodeRepository {

  private static instance: QRCodeRepositoryMock;

  private constructor() {}

  public static getInstance(): QRCodeRepositoryMock {
    if (!QRCodeRepositoryMock.instance) {
      QRCodeRepositoryMock.instance = new QRCodeRepositoryMock();
    }
    return QRCodeRepositoryMock.instance;
  }

  private qrcodes: QRCode[] = [];

  // constructor() {
  //   // Mock data
  //   this.qrcodes.push(
  //     QRCode.create(
  //       'qr1',
  //       Code.create('code123'),
  //       Location.create('Biblioteca do CEFET-MG'),
  //       new Date(),
  //       'acertou',
  //       'Entrada principal'
  //     )
  //   );
  //   this.qrcodes.push(
  //     QRCode.create(
  //       'qr2',
  //       Code.create('code456'),
  //       Location.create('Laboratório de Informática'),
  //       new Date(),
  //       'errou',
  //       'Sala 201'
  //     )
  //   );
  // }

  async scanQRCode(code: Code, location: Location): Promise<QRCode> {
    console.log(`Mock Scan QRCode: ${code.value}, ${location.value}`);
    const newQRCode: QRCode = QRCode.create(
      `qr${this.qrcodes.length + 1}`,
      code,
      location,
      new Date(),
      code.value === 'code123' ? 'acertou' : 'errou' // Mock logic for success/failure
    );
    this.qrcodes.push(newQRCode);
    return newQRCode;
  }

  async getQRCodeDetails(id: string): Promise<QRCode | undefined> {
    console.log(`Mock Get QRCode Details: ${id}`);
    return this.qrcodes.find(qr => qr.id === id);
  }
}

