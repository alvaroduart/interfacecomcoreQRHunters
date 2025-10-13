// Mock do react-native-gesture-handler
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

// Mock do react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock dos ícones do expo para evitar carregamento assíncrono de fontes que geram warnings nos testes
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: (props: any) => React.createElement('Text', props, props.children || ''),
  };
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DrawerContent from '../../components/DrawerContent';
import { AuthProvider } from '../../context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Mock de navegação e logout
const mockNavigate = jest.fn();
const mockCloseDrawer = jest.fn();
const mockReset = jest.fn();
const mockLogout = jest.fn();

const makeNav = (overrides: any = {}) => ({
  navigate: mockNavigate,
  closeDrawer: mockCloseDrawer,
  reset: mockReset,
  dispatch: jest.fn(),
  addListener: jest.fn().mockImplementation(() => () => {}),
  ...overrides,
});

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
      dispatch: jest.fn(),
      addListener: jest.fn().mockImplementation(() => {
        return () => {};
      }),
    }),
    useNavigationState: (cb: any) => cb({ routes: [{ name: 'MainApp', state: { index: 0 } }] }),
  };
});

describe('DrawerContent Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o conteúdo do drawer e lidar com ações', () => {
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
  // Verifica se renderiza alguns textos esperados do drawer
  expect(getByText('Sair')).toBeTruthy();
  expect(getByText('Perfil')).toBeTruthy();
  expect(getByText('Jornadas')).toBeTruthy();
  });

  it('deve navegar para Perfil quando pressionado', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DrawerContentTest" component={() => (
            <AuthProvider>
              <DrawerContent navigation={makeNav()} />
            </AuthProvider>
          )} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  fireEvent.press(getByText('Perfil'));
  // DrawerContent agora navega para a aba 'Perfil' (ProfileDrawerNavigator)
  expect(mockNavigate).toHaveBeenCalledWith('Perfil');
  expect(mockCloseDrawer).toHaveBeenCalled();
  });

  it('deve navegar para Jornadas quando pressionado', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DrawerContentTest" component={() => (
            <AuthProvider>
              <DrawerContent navigation={makeNav()} />
            </AuthProvider>
          )} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  fireEvent.press(getByText('Jornadas'));
  // Jornadas é aberto dentro do drawer do Perfil então a aba do Perfil permanece ativa
  expect(mockNavigate).toHaveBeenCalledWith('Perfil', { screen: 'Jornadas' });
  expect(mockCloseDrawer).toHaveBeenCalled();
  });
  

  it('poderia chamar logout e reset navigation quando Sair é pressionado', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DrawerContentTest" component={() => (
            <AuthProvider>
              <DrawerContent navigation={makeNav({ reset: mockReset })} />
            </AuthProvider>
          )} />
        </Stack.Navigator>
      </NavigationContainer>
    );
    fireEvent.press(getByText('Sair'));
    // logout() é chamado e o drawer é fechado; reset não é mais despachado a partir do drawer
    expect(mockLogout).toHaveBeenCalled();
    expect(mockCloseDrawer).toHaveBeenCalled();
  });
});
