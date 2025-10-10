import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ProgressScreen from '../../screens/ProgressScreen';
import { AuthProvider } from '../../context/AuthContext';

describe('ProgressScreen Integration', () => {
  it('should render progress checkpoints', async () => {
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <ProgressScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByText('Progresso')).toBeTruthy();
    });
    // Simular interações se necessário
  });
});
