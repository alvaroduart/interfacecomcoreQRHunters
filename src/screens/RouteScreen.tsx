import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import theme from '../theme/theme';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { makeQRCodeUseCases, makeJourneyUseCases } from '../core/factories';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { useState, useEffect } from 'react';
import { ValidatedQRCode } from '../core/domain/use-cases/GetUserValidatedQRCodesUseCase';
// NOVO: Importação do ícone
import { Ionicons } from '@expo/vector-icons';

const RouteScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { activeJourney, setActiveJourney } = useJourney();
  const [validatedQRCodes, setValidatedQRCodes] = useState<ValidatedQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: -21.547429,
    longitude: -45.439200,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // ... (useEffect e handleFinishRoute permanecem os mesmos) ...
  useEffect(() => {
    const fetchValidatedQRCodes = async () => {
      if (!user) {
        console.log('RouteScreen - Usuário não autenticado');
        return;
      }

      console.log('RouteScreen - Buscando validações para usuário:', user.id);
      console.log('RouteScreen - Jornada ativa:', activeJourney?.id, activeJourney?.name);

      try {
        const { getUserValidatedQRCodesUseCase } = makeQRCodeUseCases();
        const validated = await getUserValidatedQRCodesUseCase.execute({ 
          userId: user.id 
        });
        
        console.log('RouteScreen - QR Codes validados recebidos (total):', validated.length);
        
        // Filtrar apenas QR codes que pertencem à jornada ativa
        let filteredValidated = validated;
        if (activeJourney && activeJourney.points.length > 0) {
          const journeyQRCodeIds = activeJourney.points.map(p => p.id);
          console.log('RouteScreen - IDs dos QR codes da jornada:', journeyQRCodeIds);
          console.log('RouteScreen - IDs dos QR codes validados:', validated.map(v => v.id));
          filteredValidated = validated.filter(v => journeyQRCodeIds.includes(v.id));
          console.log('RouteScreen - QR Codes filtrados pela jornada ativa:', filteredValidated.length);
        } else if (activeJourney && activeJourney.points.length === 0) {
          // Se a jornada ativa não tem pontos, não mostrar nenhum QR code
          filteredValidated = [];
          console.log('RouteScreen - Jornada ativa sem pontos, lista vazia');
        }
        
        console.log('RouteScreen - Dados finais:', JSON.stringify(filteredValidated, null, 2));
        
        setValidatedQRCodes(filteredValidated);

        // Se houver QR codes validados, ajusta a região do mapa para o primeiro
        if (filteredValidated.length > 0) {
          console.log('RouteScreen - Ajustando região do mapa para:', filteredValidated[0].latitude, filteredValidated[0].longitude);
          setRegion({
            latitude: filteredValidated[0].latitude,
            longitude: filteredValidated[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else {
          console.log('RouteScreen - Nenhum QR code validado encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar QR codes validados:', error);
        Alert.alert('Erro', 'Não foi possível carregar os pontos validados');
      } finally {
        setLoading(false);
      }
    };

    fetchValidatedQRCodes();
  }, [user, activeJourney]);  const handleFinishRoute = async () => {
    if (validatedQRCodes.length === 0) {
      Alert.alert('Atenção', 'Você ainda não validou nenhum ponto!');
      return;
    }

    // Se houver uma jornada ativa, perguntar se quer finalizá-la
    if (activeJourney) {
      Alert.alert(
        'Finalizar Jornada',
        `Você validou ${validatedQRCodes.length} ponto(s) da jornada "${activeJourney.name}". Deseja finalizar esta jornada?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Finalizar', 
            onPress: async () => {
              try {
                console.log('[RouteScreen] Finalizando jornada:', activeJourney.id);
                const { finishJourneyUseCase } = makeJourneyUseCases();
                await finishJourneyUseCase.execute({ journeyId: activeJourney.id });
                
                Alert.alert(
                  'Parabéns! 🎉',
                  `Você completou a jornada "${activeJourney.name}"!`,
                  [
                    {
                      text: 'Ver Progresso',
                      onPress: () => {
                        setActiveJourney(null); // Limpar jornada ativa
                        navigation.navigate('MainApp', { screen: 'Progresso' });
                      }
                    }
                  ]
                );
              } catch (error) {
                console.error('[RouteScreen] Erro ao finalizar jornada:', error);
                Alert.alert('Erro', 'Não foi possível finalizar a jornada. Tente novamente.');
              }
            }
          }
        ]
      );
    } else {
      // Sem jornada ativa, apenas mostrar progresso
      Alert.alert(
        'Finalizar Percurso',
        `Você validou ${validatedQRCodes.length} ponto(s). Deseja ver seu progresso?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ver Progresso', 
            onPress: () => navigation.navigate('MainApp', { screen: 'Progresso' })
          }
        ]
      );
    }
  };  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        {/* MODIFICADO: Botão de voltar com ícone e lógica da JourneysScreen */}
        <TouchableOpacity
          style={styles.backButton} // O estilo 'backButton' (padding: 8) é igual ao 'menuButton'
          onPress={() => { 
            try {
              navigation.goBack();
              return;
            } catch (e) { 
            }
            
            try {
              const parent = (navigation as any).getParent?.();
              if (parent && typeof parent.navigate === 'function') {
                parent.navigate('Perfil'); // Fallback para 'Perfil' (como no exemplo)
                return;
              }
            } catch (e) { 
            }
            
            try {
              (navigation as any).navigate('Perfil'); // Fallback final
            } catch (e) {
              
            }
          }}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mapa do Percurso</Text>

        {/* MODIFICADO: Ajuste de largura para centralizar o título */}
        <View style={{ width: 40 }} />
      </View>
      
      {/* Mapa */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            {validatedQRCodes.map((qrCode, index) => {
              console.log(`RouteScreen - Marcador ${index + 1}:`, qrCode.latitude, qrCode.longitude, qrCode.locationName);
              return (
                <Marker
                  key={qrCode.id}
                  coordinate={{
                    latitude: qrCode.latitude,
                    longitude: qrCode.longitude,
                  }}
                  title={qrCode.locationName}
                  description={qrCode.description || 'Ponto validado com sucesso'}
                >
                  <View style={styles.markerContainer}>
                    <View style={styles.marker}>
                      <Text style={styles.markerText}>{index + 1}</Text>
                    </View>
                  </View>
                </Marker>
              );
            })}
          </MapView>
          
          {/* Informações do percurso */}
          <View style={styles.routeInfoContainer}>
            <Text style={styles.routeInfoTitle}>📍 Seu Progresso</Text>
            <Text style={styles.routeInfoText}>
              Pontos validados com sucesso: {validatedQRCodes.length}
            </Text>
            {validatedQRCodes.length === 0 && (
              <Text style={styles.emptyText}>
                Escaneie QR codes e acerte as perguntas para ver os pontos no mapa!
              </Text>
            )}
          </View>
        </View>
      )}
      
      {/* Botões */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.scanButtonText}>📷 Escanear QR Code</Text>
        </TouchableOpacity>
        
        {validatedQRCodes.length > 0 && (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinishRoute}
          >
            <Text style={styles.finishButtonText}>✓ Finalizar Percurso</Text>
          </TouchableOpacity>
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
  backButton: {
    padding: 8,
  },
  // REMOVIDO: backButtonText não é mais necessário
  // backButtonText: {
  //   color: '#fff',
  //   fontSize: 16,
  //   fontWeight: '600',
  // },
  headerTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeInfoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  routeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  routeInfoText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  routeInfoSuccess: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  routeInfoError: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RouteScreen;