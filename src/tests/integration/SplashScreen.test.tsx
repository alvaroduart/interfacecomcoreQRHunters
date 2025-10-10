import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../../screens/SplashScreen';

describe('SplashScreen Integration', () => {
  it('should render splash screen', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <SplashScreen navigation={{ navigate: jest.fn() }} />
      </NavigationContainer>
    );
    await waitFor(() => {
      expect(getByText('QrHunters')).toBeTruthy();
    });
  });
});
