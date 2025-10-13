import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import JourneysScreen from '../screens/JourneysScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';
import ScannerScreen from '../screens/ScannerScreen';
import RouteScreen from '../screens/RouteScreen';
import ProgressScreen from '../screens/ProgressScreen';
import DrawerContent from '../components/DrawerContent';
import TabNavigator from './TabNavigator';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />} screenOptions={{ headerShown: false }}>
  <Drawer.Screen name="MainApp" component={TabNavigator} />
  <Drawer.Screen name="Login" component={LoginScreen} />
  <Drawer.Screen name="Cadastro" component={RegisterScreen} />
  <Drawer.Screen name="Splash" component={SplashScreen} />
    </Drawer.Navigator>
  );
}
