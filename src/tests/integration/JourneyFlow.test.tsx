import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/HomeScreen';
import { JourneyRepositoryMock } from '../../core/infra/repositories/JourneyRepositoryMock';

// Mock do reanimated — dependência comum para a navegação
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
});

// Mock do react-native-gesture-handler
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
  /* Botões */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
  /* Outros */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
    GestureHandlerRootView: View,
    createNativeWrapper: jest.fn(() => View),
    default: { install: jest.fn() }
  };
});

// Mock do hook de navegação
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

// Tela mock que atua como destino para o teste de navegação
const MockRouteScreen = () => <></>;

describe('HomeScreen Integration', () => {

  beforeEach(() => {
  // Resetar mocks se necessário. JourneyRepositoryMock reseta-se no getInstance.
    mockNavigate.mockClear();
  });

  it('deve exibir as jornadas e navegar para a tela de rota ao pressionar', async () => {
    const { findByText, getByText } = render(
      <HomeScreen />
    );

    // 1. Verifica se a HomeScreen busca e exibe as jornadas
    const journey1Title = await findByText('Percurso CEFET-MG');
    const journey2Title = await findByText('Percurso Centro Histórico');

    expect(journey1Title).toBeTruthy();
    expect(journey2Title).toBeTruthy();

    // 2. Simular pressionar a primeira jornada
    fireEvent.press(journey1Title);

    // 3. Verificar se a navegação foi chamada com os parâmetros corretos
    expect(mockNavigate).toHaveBeenCalledWith('MainApp', { 
      screen: 'Route', 
      params: { journeyId: expect.any(String) } 
    });
  });
});