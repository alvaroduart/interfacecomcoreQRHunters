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
  const { user } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  // Exibe splash por um curto período ao iniciar
  useEffect(() => {
    if (showSplash) {
      setTimeout(() => setShowSplash(false), 2000);
    }
  }, [showSplash]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showSplash ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : !user ? (
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
