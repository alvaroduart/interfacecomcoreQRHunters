import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  const handleSplashFinish = () => {
    setIsLoading(false);
  };
  
  return (
    <GestureHandlerRootView style={styles.container}>
      {isLoading ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <AppNavigator />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
