import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RouteScreen from '../screens/RouteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileDrawerNavigator from './ProfileDrawerNavigator';
import JourneysScreen from '../screens/JourneysScreen';

const Stack = createStackNavigator();

export default function RouteStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Route" component={RouteScreen} />
  <Stack.Screen name="Perfil" component={ProfileDrawerNavigator} />
  <Stack.Screen name="Jornadas" component={JourneysScreen} />
    </Stack.Navigator>
  );
}
