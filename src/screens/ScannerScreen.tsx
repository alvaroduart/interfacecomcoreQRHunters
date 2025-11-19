import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import theme from '../theme/theme';
import { CameraView, Camera, BarcodeScanningResult } from 'expo-camera';
import * as Location from 'expo-location';
import { makeQRCodeUseCases } from '../core/factories/QRCodeFactory';
import { useJourney } from '../context/JourneyContext';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.65;

const ScannerScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { activeJourney } = useJourney();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isActive, setIsActive] = useState(true);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // 📸 Pedir permissões iniciais
  useEffect(() => {
    requestPermissions();
  }, []);

  // ⏯ Controlar câmera conforme navegação
  useEffect(() => {
    const focusSub = navigation.addListener('focus', () => {
      setIsActive(true);
      setScanned(false);
    });
    const blurSub = navigation.addListener('blur', () => {
      setIsActive(false);
      setScanned(false);
    });

    return () => {
      focusSub();
      blurSub();
    };
  }, [navigation]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(cameraStatus === 'granted');

    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    setHasLocationPermission(locationStatus === 'granted');

    if (locationStatus === 'granted') {
      try {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Erro ao obter localização:', error);
        Alert.alert('Erro', 'Não foi possível obter sua localização.');
      }
    } else {
      Alert.alert(
        'Atenção',
        'Permissão de localização não concedida. O app funcionará com recursos limitados.'
      );
    }
  };

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned || !isActive) return;

    // debounce entre leituras
    if (debounceTimeout.current) return;
    debounceTimeout.current = setTimeout(() => {
      debounceTimeout.current = null;
    }, 1200);

    setScanned(true);
    setIsActive(false);

    try {
      const { data } = result;

      if (!data) {
        Alert.alert('QR Code inválido', 'O código lido está vazio.', [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              setIsActive(true);
            },
          },
        ]);
        return;
      }

      // Buscar QR Code
      const { repository: qrCodeRepository } = makeQRCodeUseCases();
      const qrCode = await qrCodeRepository.getQRCodeByCode(data);

      if (!qrCode) {
        Alert.alert(
          'QR Code Inválido',
          'Este QR Code não pertence a nenhum ponto de controle.',
          [
            {
              text: 'OK',
              onPress: () =>
                setTimeout(() => {
                  setScanned(false);
                  setIsActive(true);
                }, 300),
            },
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
              onPress: () =>
                setTimeout(() => {
                  setScanned(false);
                  setIsActive(true);
                }, 300),
            },
          ]
        );
        return;
      }

      // 🔗 Navegação segura
      navigation.navigate('Question', {
        qrCodeId: qrCode.id,
        userLatitude: currentLocation.latitude,
        userLongitude: currentLocation.longitude,
      });
    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o QR Code.', [
        {
          text: 'OK',
          onPress: () => {
            setScanned(false);
            setIsActive(true);
          },
        },
      ]);
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

  // 🚫 Bloquear se não houver jornada ativa
  if (!activeJourney) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scanner</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionContainer}>
          <Ionicons name="map-outline" size={64} color={theme.colors.text.secondary} />
          <Text style={styles.permissionTitle}>Nenhuma Jornada Ativa</Text>
          <Text style={styles.permissionText}>
            Você precisa iniciar uma jornada antes de escanear QR codes.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={() => navigation.navigate('Jornadas')}
          >
            <Text style={styles.permissionButtonText}>Ver Jornadas</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Validar QR Code</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.cameraContainer}>
        {isActive && (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
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
        )}

        <Text style={styles.guideText}>Posicione o QR dentro do quadrado</Text>
      </View>

      <View style={styles.infoArea}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            {currentLocation ? 'Câmera e localização ativas' : 'Obtendo localização...'}
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

// 🎨 Estilos
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
  },
  backButton: {
    padding: 8,
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
  },
  scanSquare: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderColor: 'transparent',
  },
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