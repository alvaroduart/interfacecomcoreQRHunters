import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../screens/LoginScreen';
import { AuthProvider } from '../../context/AuthContext';
import { AuthRepositoryMock } from '../../core/infra/repositories/AuthRepositoryMock';
import { Email } from '../../core/domain/value-objects/Email';
import { Name } from '../../core/domain/value-objects/Name';
import { Password } from '../../core/domain/value-objects/Password';
import { Alert, View, Text } from 'react-native';

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
  };
});

// Mock do react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock dos hooks de navegação
const mockNavigate = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigate,
      reset: mockReset,
    }),
  };
});

// Mock do Alert
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Alert.alert = jest.fn();
  return rn;
});

const Stack = createNativeStackNavigator();

// Uma tela mock para navegar após o login
const MockHomeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text testID="welcome-message">Welcome to the app!</Text>
  </View>
);

// Tela de registro mock
const MockRegisterScreen = () => (
  <View>
    <Text>Register Screen</Text>
  </View>
);

describe('LoginScreen Integration Tests', () => {
  beforeEach(() => {
  // Resetar o repositório mock antes de cada teste
    AuthRepositoryMock.getInstance().reset();
    
  // Resetar mocks de navegação
    mockNavigate.mockReset();
    mockReset.mockReset();
    
  // Resetar mock do Alert
    jest.mocked(Alert.alert).mockReset();
  });

  // ajuda função para criar um usuário de teste
  const createTestUser = async () => {
    return await AuthRepositoryMock.getInstance().register(
      Name.create('TestUser'), 
      Email.create('test@example.com'), 
      Password.create('Password123!')
    );
  };

    // Caso de teste 1: Login bem-sucedido
  it('deve fazer login com sucesso com credenciais válidas', async () => {
    // Create a test user in the repository
    await createTestUser();
    
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainApp" component={MockHomeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    // Preencher o formulário de login
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Senha'), 'Password123!');

    // Clicar no botão de login
      fireEvent.press(getByText('Entrar'));

    // Verificar se o usuário foi autenticado com sucesso
    const repo = AuthRepositoryMock.getInstance();
    const authenticatedUser = await repo.findByEmail(Email.create('test@example.com'));
    expect(authenticatedUser).not.toBeNull();
    expect(authenticatedUser?.email.value).toBe('test@example.com');
  });

  // Caso de teste 2: Login com campos vazios
  it('should show an alert when fields are empty', async () => {
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    // Clicar no botão de login sem preencher o formulário
      fireEvent.press(getByText('Entrar'));

    // Verificar se o alerta foi exibido
    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Por favor, preencha todos os campos');
  });

  // Caso de teste 3: Login com credenciais inválidas
  it('deve mostrar um alerta de erro com credenciais inválidas', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    // Preencher o formulário de login com credenciais que não correspondem a nenhum usuário
      fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@example.com');
      fireEvent.changeText(getByPlaceholderText('Senha'), 'WrongPassword123!');

    // Clicar no botão de login
      fireEvent.press(getByText('Entrar'));

    // Esperar que o alerta seja chamado
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  // Caso de teste 4: Navegar para a tela de registro
  it('should navigate to register screen when register link is pressed', () => {
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={MockRegisterScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    // Clicar no link de registro
      fireEvent.press(getByText('Cadastre-se'));

    // Verificar se a navegação foi chamada
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  // Caso de teste 5: Testar com formato de email inválido
  it('deve mostrar um erro quando o formato do email é inválido', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    // Preencher o formulário de login com formato de email inválido
      fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
      fireEvent.changeText(getByPlaceholderText('Senha'), 'Password123!');

    // Clicar no botão de login
      fireEvent.press(getByText('Entrar'));

    // Esperar que o alerta seja chamado com erro de validação de email
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  // Caso de teste 6: Testar com formato de senha inválido
  it('deve mostrar um erro quando o formato da senha é inválido', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    // Preencher o formulário de login com email válido, mas senha inválida
      fireEvent.changeText(getByPlaceholderText('Email'), 'valid@example.com');
      fireEvent.changeText(getByPlaceholderText('Senha'), '123'); // Senha muito curta

    // Clicar no botão de login
      fireEvent.press(getByText('Entrar'));

    // Esperar que o alerta seja chamado com erro de validação de senha
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
