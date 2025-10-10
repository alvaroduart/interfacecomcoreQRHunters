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
import { render, fireEvent } from '@testing-library/react-native';
import DrawerContent from '../../components/DrawerContent';
import { AuthProvider } from '../../context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Mock navigation and logout
const mockNavigate = jest.fn();
const mockCloseDrawer = jest.fn();
const mockReset = jest.fn();
const mockLogout = jest.fn();

jest.mock('../../context/AuthContext', () => {
  const actual = jest.requireActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({ logout: mockLogout }),
  };
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      reset: mockReset,
    }),
    useNavigationState: (cb: any) => cb({ routes: [{ name: 'MainApp', state: { index: 0 } }] }),
  };
});

describe('DrawerContent Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render drawer content and handle actions', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DrawerContentTest" component={() => (
            <AuthProvider>
              <DrawerContent navigation={{
                navigate: mockNavigate,
                closeDrawer: mockCloseDrawer,
              }} />
            </AuthProvider>
          )} />
        </Stack.Navigator>
      </NavigationContainer>
    );
    // Verifica se renderiza algum texto esperado do drawer
    expect(getByText('Sair')).toBeTruthy();
    expect(getByText('Perfil')).toBeTruthy();
    expect(getByText('Jornadas')).toBeTruthy();
    expect(getByText('Histórico')).toBeTruthy();
    expect(getByText('Recompensas')).toBeTruthy();
  });

  it('should navigate to Perfil when pressed', () => {
    const { getByText } = render(
      <AuthProvider>
        <DrawerContent navigation={{
          navigate: mockNavigate,
          closeDrawer: mockCloseDrawer,
        }} />
      </AuthProvider>
    );
    fireEvent.press(getByText('Perfil'));
    expect(mockNavigate).toHaveBeenCalledWith('MainApp', expect.objectContaining({ screen: expect.any(String), params: { screen: 'Perfil' } }));
    expect(mockCloseDrawer).toHaveBeenCalled();
  });

  it('should navigate to Jornadas when pressed', () => {
    const { getByText } = render(
      <AuthProvider>
        <DrawerContent navigation={{
          navigate: mockNavigate,
          closeDrawer: mockCloseDrawer,
        }} />
      </AuthProvider>
    );
    fireEvent.press(getByText('Jornadas'));
    expect(mockNavigate).toHaveBeenCalledWith('MainApp', expect.objectContaining({ screen: expect.any(String), params: { screen: 'Jornadas' } }));
    expect(mockCloseDrawer).toHaveBeenCalled();
  });

  it('should navigate to Histórico when pressed', () => {
    const { getByText } = render(
      <AuthProvider>
        <DrawerContent navigation={{
          navigate: mockNavigate,
          closeDrawer: mockCloseDrawer,
        }} />
      </AuthProvider>
    );
    fireEvent.press(getByText('Histórico'));
    expect(mockNavigate).toHaveBeenCalledWith('MainApp', expect.objectContaining({ screen: expect.any(String), params: { screen: 'Histórico' } }));
    expect(mockCloseDrawer).toHaveBeenCalled();
  });

  it('should navigate to Recompensas when pressed', () => {
    const { getByText } = render(
      <AuthProvider>
        <DrawerContent navigation={{
          navigate: mockNavigate,
          closeDrawer: mockCloseDrawer,
        }} />
      </AuthProvider>
    );
    fireEvent.press(getByText('Recompensas'));
    expect(mockNavigate).toHaveBeenCalledWith('MainApp', expect.objectContaining({ screen: expect.any(String), params: { screen: 'Recompensas' } }));
    expect(mockCloseDrawer).toHaveBeenCalled();
  });

  it('should call logout and reset navigation when Sair is pressed', () => {
    const { getByText } = render(
      <AuthProvider>
        <DrawerContent navigation={{
          navigate: mockNavigate,
          closeDrawer: mockCloseDrawer,
          reset: mockReset,
        }} />
      </AuthProvider>
    );
    fireEvent.press(getByText('Sair'));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
  });
});
