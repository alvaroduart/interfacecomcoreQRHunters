import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import theme from '../theme/theme';

const RouteScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const handleFinishRoute = () => {
    // Lógica para finalizar o percurso
    navigation.navigate('Scanner');
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
        <Text style={styles.headerTitle}>Percurso</Text>
        <View style={{width: 40}} /> {/* Espaço para manter o cabeçalho centralizado */}
      </View>
      
      {/* Conteúdo do Mapa */}
      <View style={styles.mapContainer}>
        {/* Aqui usaríamos um componente de mapa real como MapView do react-native-maps */}
        <View style={styles.mockMap}>
          {/* Pontos de controle no percurso */}
          <View style={styles.routePoint} />
          <View style={[styles.routePoint, { top: '20%', left: '25%' }]} />
          <View style={[styles.routePoint, { top: '30%', left: '25%' }]} />
          <View style={[styles.routePoint, { top: '40%', left: '25%' }]} />
          <View style={[styles.routePoint, { top: '50%', left: '25%' }]} />
          <View style={[styles.routePoint, { top: '60%', left: '25%' }]} />
          <View style={[styles.routePoint, { top: '70%', left: '25%' }]} />
          <View style={[styles.routePoint, { top: '80%', left: '25%' }]} />
          
          {/* Ponto de chegada */}
          <View style={[styles.destinationPoint]} />
          
          {/* Linha simulando o caminho */}
          <View style={styles.routeLine} />
        </View>
        
        {/* Informações do percurso */}
        <View style={styles.routeInfoContainer}>
          <Text style={styles.routeInfoText}>Tempo: 42:15</Text>
          <Text style={styles.routeInfoText}>Distância: 3.5 km</Text>
          <Text style={styles.routeInfoText}>Controles: 5/8</Text>
        </View>
        
        {/* Ponto de chegada */}
        <View style={styles.destinationContainer}>
          <Text style={styles.destinationText}>Chegada - CEFET</Text>
        </View>
      </View>
      
      {/* Botão para finalizar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishRoute}
        >
          <Text style={styles.finishButtonText}>Finalizar Percurso</Text>
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
    paddingTop: 50, // Ajuste para status bar
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mockMap: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    position: 'relative',
  },
  routePoint: {
    position: 'absolute',
    width: 15,
    height: 15,
    backgroundColor: '#3366ff',
    borderRadius: 10,
    left: '25%',
    top: '10%',
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  destinationPoint: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#ff3333',
    borderRadius: 10,
    left: '25%',
    top: '5%',
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  routeLine: {
    position: 'absolute',
    left: '25%',
    top: '10%',
    width: 4,
    height: '70%',
    backgroundColor: '#3366ff',
    zIndex: 1,
  },
  routeInfoContainer: {
    position: 'absolute',
    left: 20,
    bottom: '60%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  routeInfoText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  destinationContainer: {
    position: 'absolute',
    left: '30%',
    bottom: '20%',
    zIndex: 3,
  },
  destinationText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#333',
  },
  finishButton: {
    backgroundColor: '#F9A825',
    padding: 20,
    borderRadius: 40,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RouteScreen;
