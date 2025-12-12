import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NetworkService } from '../core/infra/services/NetworkService';

export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const networkService = NetworkService.getInstance();

  useEffect(() => {
    const checkConnection = async () => {
      const online = await networkService.checkConnection();
      setIsOnline(online);
    };

    checkConnection();

    // Verifica a cada 5 segundos
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!__DEV__) {
    return null; // Só mostra em desenvolvimento
  }

  return (
    <View style={[styles.container, isOnline ? styles.online : styles.offline]}>
      <Text style={styles.text}>
        {isOnline ? '🟢 Online (Supabase)' : '🔴 Offline (SQLite Cache)'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 9999,
  },
  online: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  offline: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
