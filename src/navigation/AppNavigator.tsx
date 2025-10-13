import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import StackNavigator from './StackNavigator';
import { navigationRef } from './RootNavigation';

// Componente principal de navegação. O StackNavigator escolhe entre telas de
// autenticação e o aplicativo principal conforme o estado de auth.
const AppNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <StackNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
