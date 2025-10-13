import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import theme from '../theme/theme';
import { makeProgressUseCases } from '../core/factories';
import { QRCode } from '../core/domain/entities/QRCode';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProgressScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [checkpoints, setCheckpoints] = useState<QRCode[]>([]);

  useEffect(() => {
    const fetchProgress = async () => {
      const { getUserProgressUseCase } = makeProgressUseCases();
      const progress = await getUserProgressUseCase.execute({ userId: '1' });
      setCheckpoints(progress);
    };

    fetchProgress();
  }, []);

  // Drawer intentionalmente não disponível nesta tela (drawer apenas no Profile)

  const renderCheckpointItem = (item: QRCode) => {
    return (
      <View key={item.id} style={styles.checkpointItem}>
        <View style={styles.checkpointInfo}>
          <Text style={styles.checkpointName}>{item.location.value}</Text>
          <Text style={styles.checkpointDescription}>{item.description}</Text>
          
          <Text 
            style={[
              styles.checkpointStatus, 
              item.status === 'acertou' ? styles.successText : styles.errorText
            ]}
          >
            {item.status === 'acertou' ? 'Validado' : 'Inválido'}
          </Text>
        </View>
        
        <View style={styles.checkpointDetails}>
          <Text style={styles.locationText}>{item.location.value}</Text>
          {item.scannedAt && <Text style={styles.timeText}>{item.scannedAt.toLocaleTimeString()}</Text>}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Progresso</Text>
        <View style={{width: 40}} />
      </View>
      
      <ScrollView style={styles.content}>
        {checkpoints.map(item => renderCheckpointItem(item))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingTop: 10, 
    paddingBottom: 16,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  checkpointItem: {
    backgroundColor: '#333',
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  checkpointInfo: {
    marginBottom: theme.spacing.md,
  },
  checkpointName: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
    marginBottom: 4,
  },
  checkpointDescription: {
    fontSize: theme.fontSizes.regular,
    color: '#ccc',
    marginBottom: theme.spacing.sm,
  },
  checkpointStatus: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    marginTop: theme.spacing.sm,
  },
  successText: {
    color: '#4caf50', // Verde
  },
  errorText: {
    color: '#f44336', // Vermelho
  },
  checkpointDetails: {
    alignItems: 'flex-end',
  },
  locationText: {
    fontSize: theme.fontSizes.small,
    color: '#ccc',
    marginBottom: 4,
  },
  timeText: {
    fontSize: theme.fontSizes.small,
    color: '#ccc',
    fontWeight: theme.fontWeights.medium,
  },
});

export default ProgressScreen;
