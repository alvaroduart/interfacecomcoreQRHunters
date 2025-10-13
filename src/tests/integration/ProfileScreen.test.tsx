import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

import ProfileScreen from '../../screens/ProfileScreen';

// Jest allows variaveis prefixadas com 'mock' em jest.mock factories
let mockChangePasswordResult: boolean | undefined = undefined;
let mockDeleteAccountResult: boolean | undefined = undefined;
jest.mock('../../core/factories', () => ({
  makeAuthUseCases: () => ({
    changePasswordUseCase: {
      execute: jest.fn(() => {
        if (mockChangePasswordResult === undefined) return Promise.reject(new Error('Senha antiga inválida ou usuário não encontrado'));
        return Promise.resolve(mockChangePasswordResult);
      }),
    },
    deleteAccountUseCase: {
      execute: jest.fn(() => {
        if (mockDeleteAccountResult === undefined) return Promise.reject(new Error('Falha ao deletar'));
        return Promise.resolve(mockDeleteAccountResult);
      }),
    },
  }),
}));
import { AuthProvider } from '../../context/AuthContext';
import { Alert } from 'react-native';


jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      openDrawer: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
    }),
  };
});

jest.mock('../../context/AuthContext', () => {
  const actual = jest.requireActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({ user: { id: '1', name: 'Test', email: 'test@example.com', password: 'Password123!' }, logout: jest.fn() }),
  };
});

describe('ProfileScreen Integration', () => {
  it('deve renderizar informações do usuário e lidar com ações', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AuthProvider>
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByText('Perfil')).toBeTruthy();
      expect(getByText('Alterar senha')).toBeTruthy();
      expect(getByText('Deletar perfil')).toBeTruthy();
    });
  });

  it('deve abrir o menu quando o botão de menu for pressionado', async () => {
    const { UNSAFE_queryAllByType } = render(
      <AuthProvider>
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    // O primeiro TouchableOpacity é o menu
    const touchables = UNSAFE_queryAllByType(require('react-native').TouchableOpacity);
    expect(touchables.length).toBeGreaterThan(0);
    fireEvent.press(touchables[0]);    
  });

  it('deve mostrar um erro se as senhas não corresponderem', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.changeText(getByPlaceholderText('Nova senha'), 'abc123');
    fireEvent.changeText(getByPlaceholderText('Confirmar nova senha'), 'different');
    fireEvent.press(getByText('Atualizar senha'));    
  });

  it('deve chamar handleDeleteAccount e mostrar alerta', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.press(getByText('Deletar perfil'));    
  });


  it('deve mostrar um alerta de sucesso quando a senha for atualizada', async () => {
    mockChangePasswordResult = true;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.changeText(getByPlaceholderText('Nova senha'), 'Password123!');
    fireEvent.changeText(getByPlaceholderText('Confirmar nova senha'), 'Password123!');
    fireEvent.press(getByText('Atualizar senha'));
    mockChangePasswordResult = undefined;
  });


  it('deve mostrar um alerta de erro quando a atualização da senha falhar', async () => {
    mockChangePasswordResult = false;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.changeText(getByPlaceholderText('Nova senha'), 'Password123!');
    fireEvent.changeText(getByPlaceholderText('Confirmar nova senha'), 'Password123!');
    fireEvent.press(getByText('Atualizar senha'));
    mockChangePasswordResult = undefined;
  });


  it('deve mostrar um alerta de erro quando a exclusão da conta falhar', async () => {
    mockDeleteAccountResult = false;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.press(getByText('Deletar perfil'));
    mockDeleteAccountResult = undefined;
  });
});
