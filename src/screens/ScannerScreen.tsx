import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import theme from '../theme/theme';
import { CameraView, Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { makeQRCodeUseCases } from '../core/factories/QRCodeFactory';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.65;

const ScannerScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    requestPermissions();
  }, []);

  // Pausar a câmera quando o componente não estiver focado
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsActive(true);
      setScanned(false);
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      setIsActive(false);
      setScanned(false);
    });

    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);

  const requestPermissions = async () => {
    // Solicitar permissão da câmera
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(cameraStatus === 'granted');

    // Solicitar permissão de localização
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    setHasLocationPermission(locationStatus === 'granted');

    // Obter localização atual
    if (locationStatus === 'granted') {
      try {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (error) {
        console.error('Erro ao obter localização:', error);
        Alert.alert('Erro', 'Não foi possível obter sua localização');
      }
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || !isActive) return;
    
    setScanned(true);
    setIsActive(false); // Desativa o scanner imediatamente

    try {
      // Buscar o QR Code pelo código escaneado
      const { repository: qrCodeRepository } = makeQRCodeUseCases();
      
      // Remover espaços e quebras de linha do código escaneado
      const cleanCode = data.trim();
      console.log('Código escaneado:', cleanCode);
      const qrCode = await qrCodeRepository.getQRCodeByCode(cleanCode);
      console.log('QR Code encontrado:', qrCode ? { id: qrCode.id, code: qrCode.code.value } : null);

      if (!qrCode) {
        Alert.alert(
          'QR Code Inválido',
          'Este QR Code não pertence a nenhum ponto de controle.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                setScanned(false);
                setIsActive(true);
              }
            }
          ]
        );
        return;
      }

      if (!currentLocation) {
        Alert.alert(
          'Localização não disponível',
          'Não foi possível obter sua localização. Verifique as permissões.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                setScanned(false);
                setIsActive(true);
              }
            }
          ]
        );
        return;
      }

      // Navegar para a tela de pergunta
      navigation.navigate('Question', {
        qrCodeId: qrCode.id,
        userLatitude: currentLocation.latitude,
        userLongitude: currentLocation.longitude
      });

    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao processar o QR Code',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setScanned(false);
              setIsActive(true);
            }
          }
        ]
      );
    }
  };

  if (hasPermission === null || hasLocationPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Solicitando permissões...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={theme.colors.text.secondary} />
          <Text style={styles.permissionTitle}>Permissão de Câmera Necessária</Text>
          <Text style={styles.permissionText}>
            Para escanear QR Codes, precisamos de acesso à câmera do seu dispositivo.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (hasLocationPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="location-outline" size={64} color={theme.colors.text.secondary} />
          <Text style={styles.permissionTitle}>Permissão de Localização Necessária</Text>
          <Text style={styles.permissionText}>
            Para validar sua presença no ponto de controle, precisamos de acesso à sua localização.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Validar Qr Code</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Área da câmera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned || !isActive ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.scanArea}>
            <View style={styles.scanSquare}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
          </View>
        </CameraView>

        {/* Guia para o usuário */}
        <Text style={styles.guideText}>
          Posicione o QR do ponto de controle dentro do quadrado
        </Text>
      </View>

      {/* Área de informações */}
      <View style={styles.infoArea}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            {currentLocation 
              ? 'Câmera e localização ativas'
              : 'Obtendo localização...'}
          </Text>
        </View>
        
        {scanned && (
          <View style={styles.processingCard}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.processingText}>Processando QR Code...</Text>
          </View>
        )}
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
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
  },
  cameraContainer: {
    height: 350,
    position: 'relative',
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
    alignSelf: 'center',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  infoArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    marginLeft: 12,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text.primary,
  },
  processingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    marginTop: 12,
    justifyContent: 'center',
  },
  processingText: {
    marginLeft: 12,
    fontSize: theme.fontSizes.medium,
    color: '#fff',
    fontWeight: theme.fontWeights.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text.secondary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: theme.borderRadius.medium,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
  },
});

export default ScannerScreen;
