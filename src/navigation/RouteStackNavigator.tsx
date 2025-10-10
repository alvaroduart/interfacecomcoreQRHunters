import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RouteScreen from '../screens/RouteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JourneysScreen from '../screens/JourneysScreen';
import HistoryScreen from '../screens/HistoryScreen';
import RewardsScreen from '../screens/RewardsScreen';

const Stack = createStackNavigator();

export default function RouteStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Route" component={RouteScreen} />
      <Stack.Screen name="Perfil" component={ProfileScreen} />
      <Stack.Screen name="Jornadas" component={JourneysScreen} />
      <Stack.Screen name="Histórico" component={HistoryScreen} />
      <Stack.Screen name="Recompensas" component={RewardsScreen} />
    </Stack.Navigator>
  );
}
