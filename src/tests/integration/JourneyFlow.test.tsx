import React from 'react';
import { render, fireEvent, findByText } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../../screens/HomeScreen';
import { JourneyRepositoryMock } from '../../core/infra/repositories/JourneyRepositoryMock';

// Mock reanimated as it's a common dependency for navigation
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
});

const Stack = createStackNavigator();

// A mock screen to act as the destination for our navigation test
const MockRouteScreen = () => <></>;

describe('HomeScreen Integration', () => {

  beforeEach(() => {
    // Reset mocks if necessary. JourneyRepositoryMock resets itself on getInstance.
  });

  it('should display journeys and navigate to the route screen on press', async () => {
    const { findByText, getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Route" component={MockRouteScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );

    // 1. Verify that HomeScreen fetches and displays the journeys
    const journey1Title = await findByText('Percurso CEFET-MG');
    const journey2Title = await findByText('Percurso Centro Histórico');

    expect(journey1Title).toBeTruthy();
    expect(journey2Title).toBeTruthy();

    // 2. Simulate pressing the first journey
    fireEvent.press(journey1Title);

    // 3. Verify that the navigation occurred.
    // We can't easily check the current screen name with Testing Library.
    // Instead, we'll check that the title of the new screen is rendered in the header.
    // React Navigation uses the screen name as a fallback for the header title.
    const routeHeaderTitle = await findByText('Route');
    expect(routeHeaderTitle).toBeTruthy();
  });
});