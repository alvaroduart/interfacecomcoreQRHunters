import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JourneysScreen from '../screens/JourneysScreen';
import HistoryScreen from '../screens/HistoryScreen';
import RewardsScreen from '../screens/RewardsScreen';

const Stack = createStackNavigator();

export default function ProgressStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Perfil" component={ProfileScreen} />
      <Stack.Screen name="Jornadas" component={JourneysScreen} />
      <Stack.Screen name="Histórico" component={HistoryScreen} />
      <Stack.Screen name="Recompensas" component={RewardsScreen} />
    </Stack.Navigator>
  );
}
