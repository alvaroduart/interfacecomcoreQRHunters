import { ProgressRepository } from '../../domain/repositories/ProgressRepository';
import { QRCode } from '../../domain/entities/QRCode';
import { Code } from '../../domain/value-objects/Code';
import { Location } from '../../domain/value-objects/Location';

interface UserProgress {
  userId: string;
  qrCodeId: string;
}

export class ProgressRepositoryMock implements ProgressRepository {
  private static instance: ProgressRepositoryMock;
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

  private userProgress: UserProgress[] = [
    { userId: '1', qrCodeId: 'qr1' },
    { userId: '1', qrCodeId: 'qr2' },
    { userId: '2', qrCodeId: 'qr3' },
  ];

  private constructor() {}

  public static getInstance(): ProgressRepositoryMock {
    if (!ProgressRepositoryMock.instance) {
      ProgressRepositoryMock.instance = new ProgressRepositoryMock();
    }
    return ProgressRepositoryMock.instance;
  }

  async getUserProgress(userId: string): Promise<QRCode[]> {
    const userScannedIds = this.userProgress
      .filter(up => up.userId === userId)
      .map(up => up.qrCodeId);

    return this.qrcodes.filter(qr => userScannedIds.includes(qr.id));
  }
}