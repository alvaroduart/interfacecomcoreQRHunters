import { ProgressRepository } from '../../domain/repositories/ProgressRepository';
import { QRCode } from '../../domain/entities/QRCode';
import { Code } from '../../domain/value-objects/Code';
import { Location } from '../../domain/value-objects/Location';

export class ProgressRepositoryMock implements ProgressRepository {

  private static instance: ProgressRepositoryMock;

  private constructor() {}

  public static getInstance(): ProgressRepositoryMock {
    if (!ProgressRepositoryMock.instance) {
      ProgressRepositoryMock.instance = new ProgressRepositoryMock();
    }
    return ProgressRepositoryMock.instance;
  }

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
    QRCode.create(
      'qr3',
      Code.create('code789'),
      Location.create('Cantina Central'),
      new Date(),
      'acertou',
      'Ponto de encontro'
    ),
  ];

  async getUserProgress(userId: string): Promise<QRCode[]> {
    console.log(`Mock Get User Progress for userId: ${userId}`);
    // Retorna todos os QR Codes mockados para simplificar
    return Promise.resolve(this.qrcodes);
  }
}

