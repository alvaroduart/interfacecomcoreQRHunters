import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HistoryScreen from '../../screens/HistoryScreen';
import { AuthProvider } from '../../context/AuthContext';

describe('HistoryScreen Integration', () => {
  it('should render history content', async () => {
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <HistoryScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByText('Histórico')).toBeTruthy();
    });
    // Simular interações se necessário
  });
});
