import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Telas
import LoginScreen from './screens/LoginScreen';

// Definição dos tipos de parâmetros para as rotas
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ 
          headerShown: false 
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Adicionar outras telas posteriormente */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
