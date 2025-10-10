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
  };
});

// Mocking reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock navigation hooks
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

// Mock Alert
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Alert.alert = jest.fn();
  return rn;
});

const Stack = createNativeStackNavigator();

// A mock screen to navigate to after login
const MockHomeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text testID="welcome-message">Welcome to the app!</Text>
  </View>
);

// Mock Register screen
const MockRegisterScreen = () => (
  <View>
    <Text>Register Screen</Text>
  </View>
);

describe('LoginScreen Integration Tests', () => {
  beforeEach(() => {
    // Reset the mock repository before each test
    AuthRepositoryMock.getInstance().reset();
    
    // Reset navigation mocks
    mockNavigate.mockReset();
    mockReset.mockReset();
    
    // Reset Alert mock
    jest.mocked(Alert.alert).mockReset();
  });

  // Helper function to create a test user
  const createTestUser = async () => {
    return await AuthRepositoryMock.getInstance().register(
      Name.create('TestUser'), 
      Email.create('test@example.com'), 
      Password.create('Password123!')
    );
  };

    // Test case 1: Successful login
  it('should login successfully with valid credentials', async () => {
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

    // Fill in login form
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Senha'), 'Password123!');
    
    // Click login button
      fireEvent.press(getByText('Entrar'));
    
    // Check if the user was authenticated successfully
    const repo = AuthRepositoryMock.getInstance();
    const authenticatedUser = await repo.findByEmail(Email.create('test@example.com'));
    expect(authenticatedUser).not.toBeNull();
    expect(authenticatedUser?.email.value).toBe('test@example.com');
  });

  // Test case 2: Login with empty fields
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

    // Click login button without filling the form
      fireEvent.press(getByText('Entrar'));
    
    // Check that the alert was shown
    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Por favor, preencha todos os campos');
  });

  // Test case 3: Login with invalid credentials
  it('should show an error alert with invalid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    // Fill in login form with credentials that don't match any user
      fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@example.com');
      fireEvent.changeText(getByPlaceholderText('Senha'), 'WrongPassword123!');
    
    // Click login button
      fireEvent.press(getByText('Entrar'));
    
    // Wait for the alert to be called
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  // Test case 4: Navigate to register screen
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

    // Click on register link
      fireEvent.press(getByText('Cadastre-se'));
    
    // Check that navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  // Test case 5: Test with invalid email format
  it('should show an error when email format is invalid', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    // Fill in login form with invalid email format
      fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
      fireEvent.changeText(getByPlaceholderText('Senha'), 'Password123!');
    
    // Click login button
      fireEvent.press(getByText('Entrar'));
    
    // Wait for the alert to be called with email validation error
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  // Test case 6: Test with invalid password format
  it('should show an error when password format is invalid', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );

    // Fill in login form with valid email but invalid password
      fireEvent.changeText(getByPlaceholderText('Email'), 'valid@example.com');
      fireEvent.changeText(getByPlaceholderText('Senha'), '123'); // Too short password
    
    // Click login button
      fireEvent.press(getByText('Entrar'));
    
    // Wait for the alert to be called with password validation error
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
