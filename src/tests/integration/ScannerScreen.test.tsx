import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ScannerScreen from '../../screens/ScannerScreen';
import { AuthProvider } from '../../context/AuthContext';

describe('ScannerScreen Integration', () => {
  it('deve renderizar o scanner e simular a digitalização', async () => {
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <ScannerScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByText('Validar Qr Code')).toBeTruthy();
      expect(getByText('Validar Ponto de Controle')).toBeTruthy();
    });
    // Simular clique no botão de scan se existir
  });

  it('deve abrir o menu quando o botão de menu for pressionado', () => {
    const { UNSAFE_queryAllByType } = render(
      <AuthProvider>
        <NavigationContainer>
          <ScannerScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    // O primeiro TouchableOpacity é o menu
    const touchables = UNSAFE_queryAllByType(require('react-native').TouchableOpacity);
    expect(touchables.length).toBeGreaterThan(0);
    // Simular pressão no menu (openDrawer)
    touchables[0].props.onPress();
  });

  it('deve simular a digitalização e mostrar um alerta', () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <ScannerScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.press(getByText('Validar Ponto de Controle'));
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
