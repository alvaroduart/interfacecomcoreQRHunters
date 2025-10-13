import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Journey } from '../core/domain/entities/Journey';
import { makeJourneyUseCases } from '../core/factories';
import { RootStackParamList } from '../navigation/types';
import theme from '../theme/theme';

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [journeys, setJourneys] = useState<Journey[]>([]);

  useEffect(() => {
    const fetchJourneys = async () => {
      const { getAllJourneysUseCase } = makeJourneyUseCases();
      const result = await getAllJourneysUseCase.execute();
      setJourneys(result);
    };

    fetchJourneys();
  }, []);

  const handleJourneyPress = (journeyId: string) => {
    navigation.navigate('MainApp', { screen: 'Route', params: { journeyId } });
  };

  const renderItem = ({ item }: { item: Journey }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleJourneyPress(item.id)} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <Ionicons name="map" size={28} color={theme.colors.primary} style={{ marginRight: 10 }} />
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardAction}>Ver percurso</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  );

  // Drawer intentionalmente não disponível nesta tela (drawer apenas no Profile)

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho igual ao ProgressScreen */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Início</Text>
        <View style={{ width: 40 }} />
      </View>
      <Text style={styles.pageTitle}>Jornadas disponíveis</Text>
      <FlatList
        data={journeys}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => navigation.navigate('Scanner')}>
        <Ionicons name="qr-code" size={32} color={theme.colors.button.text} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

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
  listContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 18,
    marginLeft: 16,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
  },
  cardDescription: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cardAction: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginRight: 4,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: theme.colors.secondary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default HomeScreen;