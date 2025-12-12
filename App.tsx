
import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { JourneyProvider } from './src/context/JourneyContext';
import { SQLiteDatabase } from './src/core/infra/database/SQLiteDatabase';
import { NetworkStatusIndicator } from './src/components/NetworkStatusIndicator';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeDatabase() {
      try {
        console.log('[App] Inicializando banco de dados SQLite (cache)...');
        const db = SQLiteDatabase.getInstance();
        await db.init();
        console.log('[App] Banco de dados SQLite inicializado com sucesso');
        setIsDbReady(true);
      } catch (error) {
        console.error('[App] Erro ao inicializar banco de dados:', error);
        setDbError('Erro ao inicializar banco de dados local');
        // Continua mesmo com erro para não bloquear o app
        setIsDbReady(true);
      }
    }

    initializeDatabase();
  }, []);

  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Inicializando cache local...</Text>
      </View>
    );
  }

  if (dbError) {
    console.warn('[App] App iniciou com erro no DB:', dbError);
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <JourneyProvider>
          <AppNavigator />
          <NetworkStatusIndicator />
        </JourneyProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

