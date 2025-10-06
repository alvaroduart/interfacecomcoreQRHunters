import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Journey } from '../core/domain/entities/Journey';
import { makeJourneyUseCases } from '../core/factories';
import { RootStackParamList } from '../navigation/AppNavigator';
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
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleJourneyPress(item.id)}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Jornadas Disponíveis</Text>
      <FlatList
        data={journeys}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    paddingTop: 40, 
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    elevation: 2,
  },
  itemTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
  },
  itemDescription: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
});

export default HomeScreen;