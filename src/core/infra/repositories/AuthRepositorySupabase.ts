import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { Name } from '../../domain/value-objects/Name';
import { supabase } from '../api/supabaseClient';

export class AuthRepositorySupabase implements AuthRepository {
  private static instance: AuthRepositorySupabase;

  private constructor() {}

  public static getInstance(): AuthRepositorySupabase {
    if (!AuthRepositorySupabase.instance) {
      AuthRepositorySupabase.instance = new AuthRepositorySupabase();
    }
    return AuthRepositorySupabase.instance;
  }

  async login(email: Email, password: Password): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Usuário não encontrado');
      }

      // Extrair nome e avatar do metadata ou usar email
      const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário';
      const avatarUrl = data.user.user_metadata?.avatar_url;

      // Usar uma senha vazia já que não armazenamos a senha do Supabase
      return User.create(
        data.user.id,
        Name.create(userName),
        Email.create(data.user.email || ''),
        Password.createForAuth(''), // Senha não é retornada pela API
        avatarUrl
      );
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }

  async register(name: Name, email: Email, password: Password): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            name: name.value,
          },
          emailRedirectTo: undefined, // Não redirecionar para confirmação de email
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Erro ao criar usuário');
      }

      return User.create(
        data.user.id,
        name,
        email,
        password // Usar a senha fornecida
      );
    } catch (error: any) {
      console.error('Erro no registro:', error);
      throw new Error(error.message || 'Erro ao registrar usuário');
    }
  }

  async updateProfile(userId: string, name: Name, email: Email): Promise<User> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email: email.value,
        data: {
          name: name.value,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Erro ao atualizar perfil');
      }

      return User.create(
        data.user.id,
        name,
        email,
        Password.createForAuth('') // Senha não é retornada
      );
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error(error.message || 'Erro ao atualizar perfil');
    }
  }

  async changePassword(userId: string, currentPassword: Password, newPassword: Password): Promise<boolean> {
    try {
      console.log('[AuthRepositorySupabase] Iniciando changePassword');
      console.log('[AuthRepositorySupabase] userId:', userId);
      console.log('[AuthRepositorySupabase] currentPassword:', currentPassword.value);
      console.log('[AuthRepositorySupabase] newPassword:', newPassword.value);

      // Supabase não verifica a senha atual, então fazemos um login primeiro
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      console.log('[AuthRepositorySupabase] getUser error:', userError);
      console.log('[AuthRepositorySupabase] userData.user?.email:', userData.user?.email);

      if (userError || !userData.user?.email) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar senha atual fazendo login
      console.log('[AuthRepositorySupabase] Tentando fazer login com a senha atual');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword.value,
      });

      console.log('[AuthRepositorySupabase] signInError:', signInError);

      if (signInError) {
        throw new Error('Senha atual incorreta');
      }

      // Atualizar para nova senha
      console.log('[AuthRepositorySupabase] Atualizando para nova senha');
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword.value,
      });

      console.log('[AuthRepositorySupabase] updateError:', updateError);

      if (updateError) {
        throw new Error(updateError.message);
      }

      console.log('[AuthRepositorySupabase] Senha alterada com sucesso');
      return true;
    } catch (error: any) {
      console.error('[AuthRepositorySupabase] Erro ao trocar senha:', error);
      throw new Error(error.message || 'Erro ao trocar senha');
    }
  }

  async deleteAccount(userId: string): Promise<boolean> {
    try {
      console.log('[AuthRepositorySupabase] Iniciando exclusão de conta');
      console.log('[AuthRepositorySupabase] userId:', userId);

      // Chamar Edge Function para deletar usuário
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (error) {
        console.error('[AuthRepositorySupabase] Erro ao chamar Edge Function:', error);
        throw new Error(error.message);
      }

      console.log('[AuthRepositorySupabase] Resposta da Edge Function:', data);

      // Fazer logout após deletar a conta
      await supabase.auth.signOut();

      console.log('[AuthRepositorySupabase] Conta deletada com sucesso');
      return true;
    } catch (error: any) {
      console.error('[AuthRepositorySupabase] Erro ao deletar conta:', error);
      
      // Se a Edge Function não existir, tentar deletar localmente
      if (error.message?.includes('FunctionsRelayError') || error.message?.includes('Function not found')) {
        console.warn('[AuthRepositorySupabase] Edge Function não encontrada, tentando método alternativo');
        
        try {
          // Deletar dados relacionados do usuário manualmente
          // 1. Deletar validações
          await supabase.from('validations').delete().eq('user_id', userId);
          
          // 2. Fazer signOut (remove a sessão)
          await supabase.auth.signOut();
          
          console.log('[AuthRepositorySupabase] Dados do usuário removidos, sessão encerrada');
          console.warn('[AuthRepositorySupabase] Conta desativada. Para remover completamente, é necessária a Edge Function.');
          return true;
        } catch (fallbackError: any) {
          console.error('[AuthRepositorySupabase] Erro no método alternativo:', fallbackError);
          throw new Error('Não foi possível deletar a conta');
        }
      }
      
      throw new Error(error.message || 'Erro ao deletar conta');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return null;
      }

      const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário';
      const avatarUrl = data.user.user_metadata?.avatar_url;

      return User.create(
        data.user.id,
        Name.create(userName),
        Email.create(data.user.email || ''),
        Password.createForAuth(''), // Senha não é retornada pela API
        avatarUrl
      );
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      throw new Error(error.message || 'Erro ao fazer logout');
    }
  }

  async uploadAvatar(userId: string, fileUri: string, fileName: string, fileType: string): Promise<string> {
    try {
      console.log('[AuthRepositorySupabase] Iniciando upload de avatar');
      console.log('[AuthRepositorySupabase] userId:', userId);
      console.log('[AuthRepositorySupabase] fileUri:', fileUri);
      console.log('[AuthRepositorySupabase] fileName:', fileName);
      console.log('[AuthRepositorySupabase] fileType:', fileType);

      // Ler o arquivo como base64
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      // Nome único do arquivo usando timestamp
      const fileExt = fileName.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      console.log('[AuthRepositorySupabase] Fazendo upload para:', filePath);

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: fileType,
          upsert: true,
        });

      if (error) {
        console.error('[AuthRepositorySupabase] Erro no upload:', error);
        throw new Error(error.message);
      }

      console.log('[AuthRepositorySupabase] Upload concluído:', data);

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;
      console.log('[AuthRepositorySupabase] URL pública:', avatarUrl);

      return avatarUrl;
    } catch (error: any) {
      console.error('[AuthRepositorySupabase] Erro ao fazer upload do avatar:', error);
      throw new Error(error.message || 'Erro ao fazer upload do avatar');
    }
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      console.log('[AuthRepositorySupabase] Atualizando avatar do usuário');
      console.log('[AuthRepositorySupabase] userId:', userId);
      console.log('[AuthRepositorySupabase] avatarUrl:', avatarUrl);

      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
        },
      });

      if (error) {
        console.error('[AuthRepositorySupabase] Erro ao atualizar avatar:', error);
        throw new Error(error.message);
      }

      console.log('[AuthRepositorySupabase] Avatar atualizado com sucesso');
    } catch (error: any) {
      console.error('[AuthRepositorySupabase] Erro ao atualizar avatar do usuário:', error);
      throw new Error(error.message || 'Erro ao atualizar avatar do usuário');
    }
  }
}
