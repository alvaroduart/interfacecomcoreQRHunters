import { QRCodeRepository } from '../repositories/QRCodeRepository';
import { QRCode } from '../entities/QRCode';
import { Coordinates } from '../value-objects/Coordinates';

export interface ValidateQRCodeParams {
    qrCodeId: string;
    userId: string;
    userCoordinates: {
        latitude: number;
        longitude: number;
    };
    answerId: string;
    proximityRadiusInMeters?: number; // Padrão: 50 metros
}

export interface ValidateQRCodeResult {
    success: boolean;
    qrCode: QRCode;
    message: string;
    errors?: {
        locationMismatch?: boolean;
        wrongAnswer?: boolean;
        distance?: number;
    };
}

export class ValidateQRCodeUseCase {
    constructor(
        private readonly qrCodeRepository: QRCodeRepository,
        private readonly defaultProximityRadius: number = 50 // 50 metros por padrão
    ) {}

    async execute(params: ValidateQRCodeParams): Promise<ValidateQRCodeResult> {
        const { qrCodeId, userId, userCoordinates, answerId, proximityRadiusInMeters } = params;
        const proximityRadius = proximityRadiusInMeters ?? this.defaultProximityRadius;

        console.log('ValidateQRCodeUseCase.execute - qrCodeId recebido:', qrCodeId);

        // 1. Buscar o QRCode pelo ID
        const qrCode = await this.qrCodeRepository.getQRCodeDetails(qrCodeId);
        
        if (!qrCode) {
            throw new Error('QR Code não encontrado');
        }

        // 2. Criar coordenadas do usuário
        const userCoords = Coordinates.create(
            userCoordinates.latitude,
            userCoordinates.longitude
        );

        // 3. Validar localização (coordenadas)
        const isWithinRadius = qrCode.coordinates.isWithinRadius(userCoords, proximityRadius);
        const distance = qrCode.coordinates.distanceTo(userCoords);

        if (!isWithinRadius) {
            const validatedQRCode = qrCode.withValidation('errou');
            
            // Salvar validação no banco
            if ('saveValidation' in this.qrCodeRepository) {
                await (this.qrCodeRepository as any).saveValidation(
                    userId,
                    qrCodeId,
                    answerId,
                    userCoordinates.latitude,
                    userCoordinates.longitude,
                    distance,
                    'errou'
                );
            }

            return {
                success: false,
                qrCode: validatedQRCode,
                message: `Você está muito longe do ponto de controle. Distância: ${Math.round(distance)}m`,
                errors: {
                    locationMismatch: true,
                    distance
                }
            };
        }

        // 4. Validar resposta da pergunta
        const isCorrectAnswer = qrCode.question.isCorrectAnswer(answerId);

        if (!isCorrectAnswer) {
            const validatedQRCode = qrCode.withValidation('errou');
            
            // Salvar validação no banco
            if ('saveValidation' in this.qrCodeRepository) {
                await (this.qrCodeRepository as any).saveValidation(
                    userId,
                    qrCodeId,
                    answerId,
                    userCoordinates.latitude,
                    userCoordinates.longitude,
                    distance,
                    'errou'
                );
            }

            return {
                success: false,
                qrCode: validatedQRCode,
                message: 'Resposta incorreta. Tente novamente!',
                errors: {
                    wrongAnswer: true
                }
            };
        }

        // 5. Sucesso - localização e resposta corretas
        const validatedQRCode = qrCode.withValidation('acertou');
        
        // Salvar validação no banco
        if ('saveValidation' in this.qrCodeRepository) {
            await (this.qrCodeRepository as any).saveValidation(
                userId,
                qrCodeId,
                answerId,
                userCoordinates.latitude,
                userCoordinates.longitude,
                distance,
                'acertou'
            );
        }

        return {
            success: true,
            qrCode: validatedQRCode,
            message: 'Ponto de controle validado com sucesso!'
        };
    }
}
