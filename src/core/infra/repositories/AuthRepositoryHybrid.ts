import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { Name } from '../../domain/value-objects/Name';
import { supabase } from '../api/supabaseClient';
import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { NetworkService } from '../services/NetworkService';
import { CacheSyncService } from '../services/CacheSyncService';

/**
 * Repositório híbrido que usa Supabase quando online e SQLite quando offline
 */
export class AuthRepositoryHybrid implements AuthRepository {
    private static instance: AuthRepositoryHybrid;
    private db: SQLiteDatabase;
    private network: NetworkService;
    private cacheSync: CacheSyncService;

    private constructor() {
        this.db = SQLiteDatabase.getInstance();
        this.network = NetworkService.getInstance();
        this.cacheSync = CacheSyncService.getInstance();
    }

    public static getInstance(): AuthRepositoryHybrid {
        if (!AuthRepositoryHybrid.instance) {
            AuthRepositoryHybrid.instance = new AuthRepositoryHybrid();
        }
        return AuthRepositoryHybrid.instance;
    }

    async login(email: Email, password: Password): Promise<User> {
        try {
            console.log('[AuthRepositoryHybrid] Tentando login...');

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

            const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário';
            const avatarUrl = data.user.user_metadata?.avatar_url;

            const user = User.create(
                data.user.id,
                Name.create(userName),
                Email.create(data.user.email || ''),
                Password.createForAuth(''),
                avatarUrl
            );

            // Sincronizar usuário para cache
            await this.syncUserToCache(user);

            console.log('[AuthRepositoryHybrid] Login bem-sucedido');
            return user;
        } catch (error: any) {
            console.error('[AuthRepositoryHybrid] Erro no login:', error);
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
                    emailRedirectTo: undefined,
                },
            });

            if (error) {
                throw new Error(error.message);
            }

            if (!data.user) {
                throw new Error('Erro ao criar usuário');
            }

            const user = User.create(
                data.user.id,
                name,
                email,
                password
            );

            // Sincronizar usuário para cache
            await this.syncUserToCache(user);

            return user;
        } catch (error: any) {
            console.error('[AuthRepositoryHybrid] Erro no registro:', error);
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

            const avatarUrl = data.user.user_metadata?.avatar_url;

            const user = User.create(
                data.user.id,
                name,
                email,
                Password.createForAuth(''),
                avatarUrl
            );

            // Sincronizar usuário atualizado para cache
            await this.syncUserToCache(user);

            return user;
        } catch (error: any) {
            console.error('[AuthRepositoryHybrid] Erro ao atualizar perfil:', error);
            throw new Error(error.message || 'Erro ao atualizar perfil');
        }
    }

    async changePassword(userId: string, currentPassword: Password, newPassword: Password): Promise<boolean> {
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError || !userData.user?.email) {
                throw new Error('Usuário não autenticado');
            }

            // Verificar senha atual
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: userData.user.email,
                password: currentPassword.value,
            });

            if (signInError) {
                throw new Error('Senha atual incorreta');
            }

            // Atualizar senha
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword.value,
            });

            if (updateError) {
                throw new Error(updateError.message);
            }

            return true;
        } catch (error: any) {
            console.error('[AuthRepositoryHybrid] Erro ao trocar senha:', error);
            throw new Error(error.message || 'Erro ao trocar senha');
        }
    }

    async deleteAccount(userId: string): Promise<boolean> {
        try {
            // Chamar Edge Function para deletar usuário
            const { data, error } = await supabase.functions.invoke('delete-user', {
                body: { userId },
            });

            if (error) {
                console.error('[AuthRepositoryHybrid] Erro ao chamar Edge Function:', error);
                throw new Error(error.message);
            }

            // Fazer logout após deletar a conta
            await supabase.auth.signOut();

            // Limpar cache local do usuário
            await this.clearUserFromCache(userId);

            return true;
        } catch (error: any) {
            console.error('[AuthRepositoryHybrid] Erro ao deletar conta:', error);

            // Fallback se Edge Function não existir
            if (error.message?.includes('FunctionsRelayError') || error.message?.includes('Function not found')) {
                try {
                    await supabase.from('validations').delete().eq('user_id', userId);
                    await supabase.auth.signOut();
                    await this.clearUserFromCache(userId);
                    return true;
                } catch (fallbackError: any) {
                    throw new Error('Não foi possível deletar a conta');
                }
            }

            throw new Error(error.message || 'Erro ao deletar conta');
        }
    }

    async getCurrentUser(): Promise<User | null> {
        const isOnline = await this.network.checkConnection();

        if (isOnline) {
            try {
                return await this.getCurrentUserFromSupabase();
            } catch (error) {
                console.log('[AuthRepositoryHybrid] Falha no Supabase, tentando cache...');
                return await this.getCurrentUserFromCache();
            }
        } else {
            return await this.getCurrentUserFromCache();
        }
    }

    private async getCurrentUserFromSupabase(): Promise<User | null> {
        try {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data.user) {
                return null;
            }

            const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário';
            const avatarUrl = data.user.user_metadata?.avatar_url;

            const user = User.create(
                data.user.id,
                Name.create(userName),
                Email.create(data.user.email || ''),
                Password.createForAuth(''),
                avatarUrl
            );

            // Sincronizar para cache
            await this.syncUserToCache(user);

            return user;
        } catch (error) {
            console.error('[AuthRepositoryHybrid] Erro ao obter usuário do Supabase:', error);
            return null;
        }
    }

    private async getCurrentUserFromCache(): Promise<User | null> {
        try {
            console.log('[AuthRepositoryHybrid] Buscando usuário no cache');

            const database = this.db.getDatabase();

            // Buscar o usuário mais recente do cache (assumindo que só há um usuário logado por vez)
            const userData = await database.getFirstAsync<any>(`
        SELECT * FROM users ORDER BY updated_at DESC LIMIT 1
      `);

            if (!userData) {
                console.log('[AuthRepositoryHybrid] Nenhum usuário encontrado no cache');
                return null;
            }

            const user = User.create(
                userData.id,
                Name.create(userData.name),
                Email.create(userData.email),
                Password.createForAuth(''),
                userData.avatar_url
            );

            console.log('[AuthRepositoryHybrid] Usuário recuperado do cache:', userData.email);
            return user;
        } catch (error) {
            console.error('[AuthRepositoryHybrid] Erro ao buscar usuário no cache:', error);
            return null;
        }
    }

    async logout(): Promise<void> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw new Error(error.message);
            }

            // Limpar cache local (opcional - pode manter para acesso offline)
            // await this.clearAllUsersFromCache();

            console.log('[AuthRepositoryHybrid] Logout realizado com sucesso');
        } catch (error: any) {
            console.error('[AuthRepositoryHybrid] Erro ao fazer logout:', error);
            throw new Error(error.message || 'Erro ao fazer logout');
        }
    }

    async uploadAvatar(userId: string, fileUri: string, fileName: string, fileType: string): Promise<string> {
        try {
            const response = await fetch(fileUri);
            const blob = await response.blob();
            const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as ArrayBuffer);
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
            });

            const fileExt = fileName.split('.').pop();
            const filePath = `${userId}/${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(filePath, arrayBuffer, {
                    contentType: fileType,
                    upsert: true,
                });

            if (error) {
                throw new Error(error.message);
            }

            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;
        } catch (error: any) {
            console.error('[AuthRepositoryHybrid] Erro ao fazer upload do avatar:', error);
            throw new Error(error.message || 'Erro ao fazer upload do avatar');
        }
    }

    async updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    avatar_url: avatarUrl,
                },
            });

            if (error) {
                throw new Error(error.message);
            }

            // Atualizar avatar no cache
            const database = this.db.getDatabase();
            await database.runAsync(
                `UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?`,
                [avatarUrl, new Date().toISOString(), userId]
            );

            console.log('[AuthRepositoryHybrid] Avatar atualizado com sucesso');
        } catch (error: any) {
            console.error('[AuthRepositoryHybrid] Erro ao atualizar avatar:', error);
            throw new Error(error.message || 'Erro ao atualizar avatar do usuário');
        }
    }

    /**
     * Sincroniza dados do usuário para o cache local
     */
    private async syncUserToCache(user: User): Promise<void> {
        try {
            await this.cacheSync.syncUser({
                id: user.id,
                name: user.name.value,
                email: user.email.value,
                avatar_url: user.avatarUrl,
            });
        } catch (error) {
            console.error('[AuthRepositoryHybrid] Erro ao sincronizar usuário para cache:', error);
            // Não lançar erro - sincronização de cache é secundária
        }
    }

    /**
     * Remove usuário específico do cache
     */
    private async clearUserFromCache(userId: string): Promise<void> {
        try {
            const database = this.db.getDatabase();
            await database.runAsync(`DELETE FROM users WHERE id = ?`, [userId]);
            console.log('[AuthRepositoryHybrid] Usuário removido do cache');
        } catch (error) {
            console.error('[AuthRepositoryHybrid] Erro ao limpar usuário do cache:', error);
        }
    }

    /**
     * Remove todos os usuários do cache
     */
    private async clearAllUsersFromCache(): Promise<void> {
        try {
            const database = this.db.getDatabase();
            await database.runAsync(`DELETE FROM users`);
            console.log('[AuthRepositoryHybrid] Todos os usuários removidos do cache');
        } catch (error) {
            console.error('[AuthRepositoryHybrid] Erro ao limpar cache de usuários:', error);
        }
    }
}
