import { QRCodeRepository } from '../repositories/QRCodeRepository';

export interface ValidatedQRCode {
  id: string;
  code: string;
  locationName: string;
  description?: string;
  latitude: number;
  longitude: number;
  validatedAt: Date;
  status: 'acertou' | 'errou';
}

export class GetUserValidatedQRCodesUseCase {
  constructor(private qrcodeRepository: QRCodeRepository) {}

  async execute(params: { userId: string }): Promise<ValidatedQRCode[]> {
    const validations = await this.qrcodeRepository.getUserValidations(params.userId);

    if (validations.length > 0) {
      console.log('GetUserValidatedQRCodesUseCase - Primeira validação:', JSON.stringify(validations[0], null, 2));
    }

    return validations.map((validation: any) => {
      const qrCode = {
        id: validation.qrcode_id,
        code: validation.qrcodes.code,
        locationName: validation.qrcodes.location_name,
        description: validation.qrcodes.description,
        latitude: Number(validation.qrcodes.latitude), 
        longitude: Number(validation.qrcodes.longitude),
        validatedAt: new Date(validation.created_at),
        status: validation.status as 'acertou' | 'errou',
      };
      
      console.log('GetUserValidatedQRCodesUseCase - QR Code mapeado:', qrCode);
      return qrCode;
    });
  }
}
