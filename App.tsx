import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/Navigation';
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
        <Navigation />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
