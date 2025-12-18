import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';
import QuestionScreen from '../screens/QuestionScreen';
import TabNavigator from './TabNavigator';
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();

export default function StackNavigator() {
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  // Exibe splash por um curto período ao iniciar
  useEffect(() => {
    if (showSplash && !isLoading) {
      setTimeout(() => setShowSplash(false), 2000);
    }
  }, [showSplash, isLoading]);

  // Mostrar splash enquanto está carregando a sessão
  if (isLoading || showSplash) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainApp" component={TabNavigator} />
          <Stack.Screen name="Question" component={QuestionScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
