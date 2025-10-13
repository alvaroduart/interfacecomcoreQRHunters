import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileDrawerNavigator from './ProfileDrawerNavigator';
import JourneysScreen from '../screens/JourneysScreen';

const Stack = createStackNavigator();

export default function ProgressStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Progress" component={ProgressScreen} />
  <Stack.Screen name="Perfil" component={ProfileDrawerNavigator} />
  <Stack.Screen name="Jornadas" component={JourneysScreen} />
    </Stack.Navigator>
  );
}
