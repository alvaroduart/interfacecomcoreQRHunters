import { AuthRepository } from '../repositories/AuthRepository';

export interface UploadAvatarParams {
  userId: string;
  fileUri: string;
  fileName: string;
  fileType: string;
}

export class UploadAvatarUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(params: UploadAvatarParams): Promise<string> {
    const { userId, fileUri, fileName, fileType } = params;
    
    // Upload da imagem para o storage e retorna a URL pública
    const avatarUrl = await this.authRepository.uploadAvatar(
      userId,
      fileUri,
      fileName,
      fileType
    );

    // Atualiza o perfil do usuário com a nova URL do avatar
    await this.authRepository.updateUserAvatar(userId, avatarUrl);

    return avatarUrl;
  }
}
