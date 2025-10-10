import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';
import DrawerNavigator from './DrawerNavigator';
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();

export default function StackNavigator() {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  useEffect(() => {
    if (showSplash) {
      setTimeout(() => setShowSplash(false), 2000); // tempo do splash
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
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
      )}
    </Stack.Navigator>
  );
}
