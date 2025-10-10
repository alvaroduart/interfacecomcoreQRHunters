import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import RewardsScreen from '../../screens/RewardsScreen';
import { AuthProvider } from '../../context/AuthContext';

describe('RewardsScreen Integration', () => {
  it('should render rewards content', async () => {
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <RewardsScreen />
        </NavigationContainer>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByText('Recompensas')).toBeTruthy();
    });
    // Simular interações se necessário
  });
});
