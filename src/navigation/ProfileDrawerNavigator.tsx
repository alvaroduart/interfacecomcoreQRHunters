import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileScreen from '../screens/ProfileScreen';
import DrawerContent from '../components/DrawerContent';
import JourneysScreen from '../screens/JourneysScreen';

const Drawer = createDrawerNavigator();

export default function ProfileDrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="ProfileOnly" component={ProfileScreen} />
      {/* Tornar Jornadas acessível dentro da aba Perfil para manter o tab ativo ao abrir Jornadas */}
      <Drawer.Screen name="Jornadas" component={JourneysScreen} />
    </Drawer.Navigator>
  );
}
