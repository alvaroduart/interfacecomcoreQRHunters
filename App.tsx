import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  const handleSplashFinish = () => {
    setIsLoading(false);
  };
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        {isLoading ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <AppNavigator />
        )}
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
