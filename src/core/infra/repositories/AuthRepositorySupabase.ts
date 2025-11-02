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

      // Extrair nome do metadata ou usar email
      const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário';

      // Usar uma senha vazia já que não armazenamos a senha do Supabase
      return User.create(
        data.user.id,
        Name.create(userName),
        Email.create(data.user.email || ''),
        Password.createForAuth('') // Senha não é retornada pela API
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
      // Nota: A exclusão de conta requer privilégios de admin no Supabase
      // Por enquanto, apenas fazemos logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }

      // Para deletar de verdade, você precisaria chamar uma Edge Function
      // ou usar a API de Admin do Supabase
      console.warn('Exclusão de conta requer implementação de Edge Function');
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
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

      return User.create(
        data.user.id,
        Name.create(userName),
        Email.create(data.user.email || ''),
        Password.createForAuth('') // Senha não é retornada pela API
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
}
