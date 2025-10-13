import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { makeJourneyUseCases } from '../core/factories';
import theme from '../theme/theme';
import { Journey } from '../core/domain/entities/Journey';

const JourneysScreen = () => {
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

  // Drawer intentionalmente não disponível nesta tela (drawer apenas no Profile)

  const renderItem = ({ item }: { item: Journey }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name="walk" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <TouchableOpacity style={styles.detailsButton} onPress={() => {}}>
        <Text style={styles.detailsButtonText}>Ver detalhes</Text>
        <Ionicons name="chevron-forward" size={18} color="#fff" style={{ marginLeft: 2 }} />
      </TouchableOpacity>
    </View>
  );

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
      <FlatList
        data={journeys}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
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
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
  },
  cardDescription: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginTop: 2,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 2,
  },
});


