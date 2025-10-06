import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/HomeScreen';
import { JourneyRepositoryMock } from '../../core/infra/repositories/JourneyRepositoryMock';

// Mock reanimated as it's a common dependency for navigation
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
});

// Mocking react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
    GestureHandlerRootView: View,
    createNativeWrapper: jest.fn(() => View),
    default: { install: jest.fn() }
  };
});

// Mock the navigation hook
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

const mockNavigate = jest.fn();
const Stack = createNativeStackNavigator();

// A mock screen to act as the destination for our navigation test
const MockRouteScreen = () => <></>;

describe('HomeScreen Integration', () => {

  beforeEach(() => {
    // Reset mocks if necessary. JourneyRepositoryMock resets itself on getInstance.
    mockNavigate.mockClear();
  });

  it('should display journeys and navigate to the route screen on press', async () => {
    const { findByText, getByText } = render(
      <HomeScreen />
    );

    // 1. Verify that HomeScreen fetches and displays the journeys
    const journey1Title = await findByText('Percurso CEFET-MG');
    const journey2Title = await findByText('Percurso Centro Histórico');

    expect(journey1Title).toBeTruthy();
    expect(journey2Title).toBeTruthy();

    // 2. Simulate pressing the first journey
    fireEvent.press(journey1Title);

    // 3. Verify that navigation was called with correct parameters
    expect(mockNavigate).toHaveBeenCalledWith('MainApp', { 
      screen: 'Route', 
      params: { journeyId: expect.any(String) } 
    });
  });
});