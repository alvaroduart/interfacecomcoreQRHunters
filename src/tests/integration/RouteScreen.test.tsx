// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const createHandler = (name = 'Handler') =>
    React.forwardRef((props: any, ref: any) => React.createElement('View', { ...props, ref }, props.children));
  return {
    Swipeable: createHandler('Swipeable'),
    DrawerLayout: createHandler('DrawerLayout'),
    State: {},
    ScrollView: createHandler('ScrollView'),
    Slider: createHandler('Slider'),
    Switch: createHandler('Switch'),
    TextInput: createHandler('TextInput'),
    ToolbarAndroid: createHandler('ToolbarAndroid'),
    DrawerLayoutAndroid: createHandler('DrawerLayoutAndroid'),
    WebView: createHandler('WebView'),
    NativeViewGestureHandler: createHandler('NativeViewGestureHandler'),
    TapGestureHandler: createHandler('TapGestureHandler'),
    FlingGestureHandler: createHandler('FlingGestureHandler'),
    ForceTouchGestureHandler: createHandler('ForceTouchGestureHandler'),
    LongPressGestureHandler: createHandler('LongPressGestureHandler'),
    PanGestureHandler: createHandler('PanGestureHandler'),
    PinchGestureHandler: createHandler('PinchGestureHandler'),
    RotationGestureHandler: createHandler('RotationGestureHandler'),
    RawButton: createHandler('RawButton'),
    BaseButton: createHandler('BaseButton'),
    RectButton: createHandler('RectButton'),
    BorderlessButton: createHandler('BorderlessButton'),
    FlatList: createHandler('FlatList'),
    gestureHandlerRootHOC: jest.fn((x) => x),
    Directions: {},
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RouteScreen from '../../screens/RouteScreen';
import { AuthProvider } from '../../context/AuthContext';

const Stack = createStackNavigator();
describe('RouteScreen Integration', () => {
  it('deve renderizar os detalhes da rota', async () => {
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="RouteScreen" component={RouteScreen} initialParams={{ journeyId: '1' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByText('Percurso')).toBeTruthy();
    });
    // Simular interações se necessário
  });
});
