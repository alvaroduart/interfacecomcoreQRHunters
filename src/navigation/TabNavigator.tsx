import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ScannerStackNavigator from './ScannerStackNavigator';
import ProgressStackNavigator from './ProgressStackNavigator';
import RouteStackNavigator from './RouteStackNavigator';
import ProfileDrawerNavigator from './ProfileDrawerNavigator';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4169e1',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 13, fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Scanner"
        component={ScannerStackNavigator}
        options={{
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progresso"
        component={ProgressStackNavigator}
        options={{
          tabBarLabel: 'Progresso',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Percurso"
        component={RouteStackNavigator}
        options={{
          tabBarLabel: 'Percurso',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileDrawerNavigator}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
