import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScannerScreen from '../screens/ScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileDrawerNavigator from './ProfileDrawerNavigator';
import JourneysScreen from '../screens/JourneysScreen';

const Stack = createStackNavigator();

export default function ScannerStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="ScannerHome" component={ScannerScreen} />
  <Stack.Screen name="Perfil" component={ProfileDrawerNavigator} />
  <Stack.Screen name="Jornadas" component={JourneysScreen} />
    </Stack.Navigator>
  );
}
