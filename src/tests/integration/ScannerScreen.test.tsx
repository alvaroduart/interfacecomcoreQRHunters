import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ScannerScreen from '../../screens/ScannerScreen';
import { AuthProvider } from '../../context/AuthContext';

describe('ScannerScreen Integration', () => {
  it('should render scanner and simulate scan', async () => {
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

  it('should open drawer when menu button is pressed', () => {
    const { UNSAFE_queryAllByType } = render(
      <AuthProvider>
        <NavigationContainer>
          <ScannerScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    // The first TouchableOpacity is the menu
    const touchables = UNSAFE_queryAllByType(require('react-native').TouchableOpacity);
    expect(touchables.length).toBeGreaterThan(0);
    // Simulate menu press (openDrawer)
    touchables[0].props.onPress();
  });

  it('should simulate scan and show alert', () => {
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
