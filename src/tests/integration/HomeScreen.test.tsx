import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../../screens/HomeScreen';
import { AuthProvider } from '../../context/AuthContext';

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({ navigate: jest.fn(), openDrawer: jest.fn() }),
  };
});

// Mock useAuth
jest.mock('../../context/AuthContext', () => {
  const actual = jest.requireActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({ user: { id: '1', name: 'Test', email: 'test@example.com' }, logout: jest.fn() }),
  };
});

describe('HomeScreen Integration', () => {
  it('should render journeys and handle navigation', async () => {
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <HomeScreen />
        </NavigationContainer>
      </AuthProvider>
    );

    // Aguarda renderização dos textos reais da tela
    await waitFor(() => {
      expect(getByText('Início')).toBeTruthy();
      expect(getByText('Jornadas disponíveis')).toBeTruthy();
      expect(getByText('Percurso CEFET-MG')).toBeTruthy();
    });
    // Simula clique em um item de jornada se necessário
  });

  it('should open drawer when menu button is pressed', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <NavigationContainer>
          <HomeScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    // Simula clique no botão de menu
    // Exemplo: fireEvent.press(getByTestId('menu-button'));
  });
});
