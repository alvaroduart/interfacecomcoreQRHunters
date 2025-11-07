import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../core/domain/entities/User';
import { makeAuthUseCases } from '../core/factories';
import { Name } from '../core/domain/value-objects/Name';
import { Email } from '../core/domain/value-objects/Email';
import { Password } from '../core/domain/value-objects/Password';

interface AuthContextData {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{children: ReactNode, initialUser?: User | null}> = ({ children, initialUser = null }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const { loginUseCase, registerUseCase } = makeAuthUseCases();

  const login = async (email: string, password: string) => {
    const loggedUser = await loginUseCase.execute({ email, password });
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser = await registerUseCase.execute({ name, email, password });
    return newUser;
  };

  const logout = () => {
    // Apenas limpar o usuário; a navegação baseada em estado (StackNavigator)
    // vai automaticamente exibir a tela de Login quando `user` for null.
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
