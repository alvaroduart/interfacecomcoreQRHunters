import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { makeJourneyUseCases } from '../core/factories';
import { useJourney } from '../context/JourneyContext';
import theme from '../theme/theme';
import { Journey } from '../core/domain/entities/Journey';

const JourneysScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { activeJourney, setActiveJourney } = useJourney();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        console.log('[JourneysScreen] Buscando jornadas...');
        const { getAllJourneysUseCase } = makeJourneyUseCases();
        const result = await getAllJourneysUseCase.execute();
        console.log('[JourneysScreen] Jornadas encontradas:', result.length);
        setJourneys(result);
      } catch (error) {
        console.error('[JourneysScreen] Erro ao buscar jornadas:', error);
        Alert.alert('Erro', 'Não foi possível carregar as jornadas');
      } finally {
        setLoading(false);
      }
    };
    fetchJourneys();
  }, []);

  const handleStartJourney = async (journey: Journey) => {
    try {
      console.log('[JourneysScreen] Iniciando/Retomando jornada:', journey.id);
      const { startJourneyUseCase } = makeJourneyUseCases();
      const startedJourney = await startJourneyUseCase.execute({ journeyId: journey.id });
      
      setActiveJourney(startedJourney);
      
      const completedPoints = journey.points.filter(p => p.isCompleted).length;
      const isResuming = completedPoints > 0;
      
      Alert.alert(
        isResuming ? 'Jornada Retomada! 🔄' : 'Jornada Iniciada! 🎯',
        isResuming 
          ? `Você retomou a jornada "${journey.name}".\nProgresso: ${completedPoints}/${journey.points.length} pontos completados.`
          : `Você iniciou a jornada "${journey.name}". Escaneie os QR codes para completá-la!`,
        [
          {
            text: 'Ir para Scanner',
            onPress: () => navigation.navigate('MainApp', { screen: 'Scanner' })
          },
          {
            text: 'Ver no Mapa',
            onPress: () => navigation.navigate('MainApp', { screen: 'Percurso' })
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('[JourneysScreen] Erro ao iniciar/retomar jornada:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a jornada. Tente novamente.');
    }
  };

  const handleViewDetails = (journey: Journey) => {
    const completedPoints = journey.points.filter(p => p.isCompleted).length;
    const totalPoints = journey.points.length;
    const progressPercentage = totalPoints > 0 ? ((completedPoints / totalPoints) * 100).toFixed(0) : 0;
    
    let detailsText = `${journey.description || 'Sem descrição'}\n\n`;
    detailsText += `📍 Total de pontos: ${totalPoints}\n`;
    detailsText += `✓ Completados: ${completedPoints}\n`;
    detailsText += `📊 Progresso: ${progressPercentage}%\n\n`;
    
    if (journey.isCompleted) {
      detailsText += '🎉 Jornada completada!';
    } else if (completedPoints > 0) {
      detailsText += `Próximo ponto: ${journey.points[journey.currentPointIndex]?.name || 'N/A'}`;
    } else {
      detailsText += 'Jornada não iniciada';
    }

    Alert.alert(
      journey.name,
      detailsText,
      [
        { text: 'Fechar', style: 'cancel' },
        ...(journey.isCompleted ? [] : [
          {
            text: completedPoints > 0 ? 'Continuar' : 'Iniciar',
            onPress: () => handleStartJourney(journey)
          }
        ])
      ]
    );
  };

  // Drawer intentionalmente não disponível nesta tela (drawer apenas no Profile)

  const renderItem = ({ item }: { item: Journey }) => {
    const completedPoints = item.points.filter(p => p.isCompleted).length;
    const totalPoints = item.points.length;
    const progressPercentage = totalPoints > 0 ? ((completedPoints / totalPoints) * 100).toFixed(0) : 0;
    const isActive = activeJourney?.id === item.id;

    return (
      <View style={[styles.card, isActive && styles.activeCard]}>
        {isActive && (
          <View style={styles.activeBadge}>
            <Ionicons name="flash" size={16} color="#fff" />
            <Text style={styles.activeBadgeText}>ATIVA</Text>
          </View>
        )}
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, isActive && styles.activeIconCircle]}>
            <Ionicons 
              name={item.isCompleted ? "checkmark-circle" : "walk"} 
              size={28} 
              color={item.isCompleted ? "#4caf50" : (isActive ? "#fff" : theme.colors.primary)} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, isActive && styles.activeCardTitle]}>{item.name}</Text>
            {item.isCompleted && (
              <Text style={styles.completedBadge}>✓ Completada</Text>
            )}
          </View>
        </View>
        
        <Text style={[styles.cardDescription, isActive && styles.activeCardDescription]}>{item.description}</Text>
        
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, isActive && styles.activeProgressText]}>
            {completedPoints} de {totalPoints} pontos • {progressPercentage}%
          </Text>
          <View style={[styles.progressBar, isActive && styles.activeProgressBar]}>
            <View style={[styles.progressFill, isActive && styles.activeProgressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.detailsButton, isActive && styles.activeDetailsButton]} 
            onPress={() => handleViewDetails(item)}
          >
            <Text style={styles.detailsButtonText}>Ver detalhes</Text>
            <Ionicons name="information-circle-outline" size={18} color="#fff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {item.isCompleted ? (
            <TouchableOpacity 
              style={[styles.reactivateButton, isActive && styles.activeActionButton]} 
              onPress={() => handleStartJourney(item)}
            >
              <Text style={[styles.reactivateButtonText, isActive && styles.activeActionButtonText]}>Reativar</Text>
              <Ionicons name="refresh" size={18} color={isActive ? theme.colors.primary : "#fff"} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : (
            <>
              {completedPoints > 0 && activeJourney?.id !== item.id ? (
                <TouchableOpacity 
                  style={styles.reactivateButton} 
                  onPress={() => handleStartJourney(item)}
                >
                  <Text style={styles.reactivateButtonText}>Retomar</Text>
                  <Ionicons name="play-circle" size={18} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.startButton, isActive && styles.activeActionButton]} 
                  onPress={() => handleStartJourney(item)}
                >
                  <Text style={[styles.startButtonText, isActive && styles.activeActionButtonText]}>
                    {completedPoints > 0 ? 'Continuar' : 'Iniciar'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={isActive ? theme.colors.primary : "#fff"} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {            
            try {
              navigation.goBack();
              return;
            } catch (e) {              
            }
            
            try {
              const parent = (navigation as any).getParent?.();
              if (parent && typeof parent.navigate === 'function') {
                parent.navigate('Perfil');
                return;
              }
            } catch (e) {              
            }

            
            try {
              (navigation as any).navigate('Perfil');
            } catch (e) {
              
            }
          }}
          style={styles.menuButton}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jornadas</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando jornadas...</Text>
        </View>
      ) : journeys.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color={theme.colors.text.secondary} />
          <Text style={styles.emptyText}>Nenhuma jornada disponível</Text>
          <Text style={styles.emptySubtext}>As jornadas aparecerão aqui quando forem criadas</Text>
        </View>
      ) : (
        <FlatList
          data={journeys}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

export default JourneysScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
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
    marginBottom: 12,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  activeCard: {
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  activeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eaf0fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  activeCardTitle: {
    color: '#fff',
  },
  completedBadge: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  activeCardDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  activeProgressText: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  activeProgressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  activeProgressFill: {
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary || '#666',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  activeDetailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeActionButton: {
    backgroundColor: '#fff',
  },
  activeActionButtonText: {
    color: theme.colors.primary,
  },
  reactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f97316',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  reactivateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});


