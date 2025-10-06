import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ProgressScreen from '../screens/ProgressScreen';
import RouteScreen from '../screens/RouteScreen';

// Components
import DrawerContent from '../components/DrawerContent';

import theme from '../theme/theme';

// Tipagem de parâmetros para as rotas
export type RootStackParamList = {
  SplashScreen: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  MainApp: { screen?: string, params?: { journeyId?: string } };
  Home: undefined;
  Scanner: undefined;
  Profile: undefined;
  History: undefined;
  Progress: undefined;
  Route: { journeyId: string };
};

const Stack = createStackNavigator<RootStackParamList>();
const Auth = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootStackParamList>();

const AuthStack = () => (
  <Auth.Navigator screenOptions={{ headerShown: false }}>
    <Auth.Screen name="Login" component={LoginScreen} />
    <Auth.Screen name="Register" component={RegisterScreen} />
  </Auth.Navigator>
);

// Tab Navigator para as abas na parte inferior
const TabNavigator = ({ route }: any) => {
  // Obter a tela inicial a partir dos parâmetros de rota, se disponível
  const initialScreen = route.params?.screen || "Scanner";
  
  return (
    <Tab.Navigator
      initialRouteName={initialScreen}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          elevation: 10,
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: -3 },
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Scanner') {
            return <MaterialCommunityIcons name="qrcode-scan" size={size + 8} color={color} />;
          } else if (route.name === 'Progress') {
            iconName = focused ? 'list' : 'list-outline';
            return <Ionicons name={iconName as any} size={size} color={color} />;
          } else if (route.name === 'Route') {
            iconName = focused ? 'map' : 'map-outline';
            return <Ionicons name={iconName as any} size={size} color={color} />;
          }
          
          return null;
        },
      })}
    >
      <Tab.Screen name="Scanner" component={ScannerScreen} options={{ tabBarLabel: 'Scanner' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: 'Progresso' }} />
      <Tab.Screen name="Route" component={RouteScreen} options={{ tabBarLabel: 'Percurso' }} />
    </Tab.Navigator>
  );
};

// Drawer Navigator para o menu lateral
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="MainApp" component={TabNavigator} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
};

// Autenticação e raíz da navegação
const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainApp" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
