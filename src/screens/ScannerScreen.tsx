import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import theme from '../theme/theme';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.65;

const ScannerScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const simulateScan = () => {
    // Simular que um QR code de um ponto de controle foi escaneado
    const mockQRData = "orienteering:checkpoint-123456";
    setLastScannedData(mockQRData);
    
    Alert.alert(
      'Ponto de Controle Validado!', 
      'Sua passagem foi registrada com sucesso.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Text>
            <Ionicons name="menu" size={28} color="#fff" />
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Validar Qr Code</Text>
        <View style={{width: 40}} /> {/* Espaço para manter o cabeçalho centralizado */}
      </View>

      {/* Área da câmera */}
      <View style={styles.cameraContainer}>
        <View style={styles.mockCamera}>
          <View style={styles.scanArea}>
            <View style={styles.scanSquare}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
          </View>
          <Text>
            <Ionicons 
              name="qr-code" 
              size={150} 
              color="rgba(255,255,255,0.2)" 
            />
          </Text>
        </View>

        {/* Guia para o usuário */}
        <Text style={styles.guideText}>
          Posicione o QR do ponto de controle dentro do quadrado
        </Text>
      </View>

      {/* Área de informações */}
      <View style={styles.infoArea}>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={simulateScan}
        >
          <Text style={styles.scanButtonText}>
            Validar Ponto de Controle
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 16,
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
  cameraContainer: {
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    position: 'relative',
  },
  mockCamera: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  scanArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  scanSquare: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  // Cantos do quadrado de scanner
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: theme.colors.secondary,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: theme.colors.secondary,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: theme.colors.secondary,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: theme.colors.secondary,
    borderBottomRightRadius: 10,
  },
  guideText: {
    position: 'absolute',
    bottom: 20,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
    zIndex: 3,
  },
  infoArea: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
    marginBottom: 10,
  },
  infoDescription: {
    textAlign: 'center',
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text.secondary,
    marginBottom: 24,
  },
  lastScannedContainer: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  lastScannedTitle: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  lastScannedText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.medium,
  },
  scanButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: theme.borderRadius.medium,
    marginTop: 10,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
  }
});

export default ScannerScreen;
