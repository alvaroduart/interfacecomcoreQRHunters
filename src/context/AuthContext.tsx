import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../core/domain/entities/User';
import { makeAuthUseCases } from '../core/factories';
import { Name } from '../core/domain/value-objects/Name';
import { Email } from '../core/domain/value-objects/Email';
import { Password } from '../core/domain/value-objects/Password';
import { supabase } from '../core/infra/api/supabaseClient';
import { AuthRepositoryHybrid } from '../core/infra/repositories/AuthRepositoryHybrid';

interface AuthContextData {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode, initialUser?: User | null }> = ({ children, initialUser = null }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(true);
  const { loginUseCase, registerUseCase } = makeAuthUseCases();

  // Restaurar sessão ao iniciar o app
  useEffect(() => {
    const restoreSession = async () => {
      try {
        console.log('[AuthContext] Restaurando sessão...');

        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log('[AuthContext] Sessão encontrada, recuperando usuário...');
          const authRepo = AuthRepositoryHybrid.getInstance();
          const currentUser = await authRepo.getCurrentUser();

          if (currentUser) {
            setUser(currentUser);
            console.log('[AuthContext] Usuário restaurado:', currentUser.email.value);
          }
        } else {
          console.log('[AuthContext] Nenhuma sessão encontrada');
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao restaurar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Escutar mudanças de autenticação
  useEffect(() => {
    console.log('[AuthContext] Configurando listener de autenticação...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state changed:', event);

        if (event === 'SIGNED_IN' && session) {
          const authRepo = AuthRepositoryHybrid.getInstance();
          const currentUser = await authRepo.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            console.log('[AuthContext] Usuário logado:', currentUser.email.value);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          console.log('[AuthContext] Usuário deslogado');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[AuthContext] Token atualizado');
        } else if (event === 'USER_UPDATED') {
          const authRepo = AuthRepositoryHybrid.getInstance();
          const currentUser = await authRepo.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            console.log('[AuthContext] Dados do usuário atualizados');
          }
        }
      }
    );

    return () => {
      console.log('[AuthContext] Removendo listener de autenticação');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const loggedUser = await loginUseCase.execute({ email, password });
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser = await registerUseCase.execute({ name, email, password });
    return newUser;
  };

  const logout = async () => {
    try {
      const authRepo = AuthRepositoryHybrid.getInstance();
      await authRepo.logout();
      setUser(null);
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error);
      // Mesmo com erro, limpar o estado local
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
