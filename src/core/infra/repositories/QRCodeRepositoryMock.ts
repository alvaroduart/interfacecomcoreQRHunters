import { QRCodeRepository } from '../../domain/repositories/QRCodeRepository';
import { QRCode } from '../../domain/entities/QRCode';
import { Code } from '../../domain/value-objects/Code';
import { Location } from '../../domain/value-objects/Location';
import { Coordinates } from '../../domain/value-objects/Coordinates';
import { Question } from '../../domain/entities/Question';

export class QRCodeRepositoryMock implements QRCodeRepository {
  private static instance: QRCodeRepositoryMock;
  // -21.547429
  // -45.439200
  private qrcodes: QRCode[] = [
    QRCode.create(
      'qr1',
      Code.create('CHECKPOINT001'),
      Location.create('Biblioteca do CEFET-MG'),
      //Coordinates.create(-19.9327, -43.9943), // Coordenadas aproximadas do CEFET-MG
      Coordinates.create(-21.547429, -45.439200), // Coordenadas da minha casa pra testes
      Question.create(
        'q1',
        'Qual é o principal recurso disponível neste local?',
        [
          { id: 'a1', text: 'Livros e materiais de estudo', isCorrect: true },
          { id: 'a2', text: 'Equipamentos esportivos', isCorrect: false },
          { id: 'a3', text: 'Refeitório', isCorrect: false },
          { id: 'a4', text: 'Laboratório químico', isCorrect: false }
        ]
      ),
      undefined,
      undefined,
      'Entrada principal da biblioteca'
    ),
    QRCode.create(
      'qr2',
      Code.create('CHECKPOINT002'),
      Location.create('Laboratório de Informática'),
      Coordinates.create(-19.9325, -43.9940),
      Question.create(
        'q2',
        'Quantos computadores estão disponíveis neste laboratório?',
        [
          { id: 'b1', text: '10 computadores', isCorrect: false },
          { id: 'b2', text: '20 computadores', isCorrect: false },
          { id: 'b3', text: '30 computadores', isCorrect: true },
          { id: 'b4', text: '40 computadores', isCorrect: false }
        ]
      ),
      undefined,
      undefined,
      'Sala 201 - Laboratório'
    ),
    QRCode.create(
      'qr3',
      Code.create('CHECKPOINT003'),
      Location.create('Quadra de Esportes'),
      Coordinates.create(-19.9330, -43.9945),
      Question.create(
        'q3',
        'Qual esporte NÃO pode ser praticado nesta quadra?',
        [
          { id: 'c1', text: 'Basquete', isCorrect: false },
          { id: 'c2', text: 'Vôlei', isCorrect: false },
          { id: 'c3', text: 'Futsal', isCorrect: false },
          { id: 'c4', text: 'Natação', isCorrect: true }
        ]
      ),
      undefined,
      undefined,
      'Quadra poliesportiva coberta'
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
      return existingQRCode;
    }

    // QR Code não encontrado - cria um novo com dados padrão
    const newQRCode = QRCode.create(
      `qr${this.qrcodes.length + 1}`,
      code,
      location,
      Coordinates.create(0, 0),
      Question.create(
        'default',
        'Este é um QR Code desconhecido',
        [
          { id: 'd1', text: 'Opção 1', isCorrect: true },
          { id: 'd2', text: 'Opção 2', isCorrect: false },
          { id: 'd3', text: 'Opção 3', isCorrect: false },
          { id: 'd4', text: 'Opção 4', isCorrect: false }
        ]
      ),
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

  async getQRCodeByCode(code: string): Promise<QRCode | undefined> {
    return this.qrcodes.find(qr => qr.code.value === code);
  }

  async updateQRCode(qrCode: QRCode): Promise<QRCode> {
    const index = this.qrcodes.findIndex(qr => qr.id === qrCode.id);
    if (index !== -1) {
      this.qrcodes[index] = qrCode;
    }
    return qrCode;
  }

  async getUserValidations(userId: string): Promise<any[]> {
    // Retorna QR codes validados (com status definido)
    return this.qrcodes
      .filter(qr => qr.status !== undefined)
      .map(qr => ({
        qrcode_id: qr.id,
        user_id: userId,
        latitude: qr.coordinates.latitude.value,
        longitude: qr.coordinates.longitude.value,
        created_at: qr.scannedAt?.toISOString() || new Date().toISOString(),
        qrcodes: {
          code: qr.code.value,
          location_name: qr.location.value,
          description: qr.description
        }
      }));
  }
}