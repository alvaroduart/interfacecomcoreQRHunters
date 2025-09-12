import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import BaseScreen from '../components/BaseScreen';
import theme from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  // Simulação de dados de QR Codes escaneados
  const recentScans = [
    { id: 1, name: 'QR Code Promocional', points: 50, date: '15/05/2023' },
    { id: 2, name: 'QR Code Especial', points: 100, date: '10/05/2023' },
    { id: 3, name: 'QR Code Evento', points: 75, date: '05/05/2023' },
  ];

  return (
    <BaseScreen
      showCurvedBackground={true}
      curvedBackgroundProps={{
        color: theme.colors.primary,
        height: '30%',
        position: 'top',
        borderRadius: theme.borderRadius.extraLarge
      }}
    >
      <StatusBar style="light" />
      
      {/* Área do Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.welcomeText}>Olá, Usuário!</Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => {
              Alert.alert(
                "Sair",
                "Deseja realmente sair?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Sim", onPress: () => navigation.navigate('Login') }
                ]
              );
            }}
          >
            <Ionicons name="person-circle" size={36} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.pointsText}>1.250 pontos</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>26</Text>
            <Text style={styles.statLabel}>Escaneados</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Ranking</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Prêmios</Text>
          </View>
        </View>
      </View>
      
      {/* Área de Conteúdo */}
      <ScrollView style={styles.content}>
        {/* Botão de Escanear */}
        <TouchableOpacity style={styles.scanButton}>
          <MaterialCommunityIcons name="qrcode-scan" size={32} color="#FFF" />
          <Text style={styles.scanButtonText}>Escanear QR Code</Text>
        </TouchableOpacity>
        
        {/* Lista de Recentes */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Escaneados Recentemente</Text>
          
          {recentScans.map((scan) => (
            <View key={scan.id} style={styles.scanItem}>
              <View style={styles.scanItemLeft}>
                <MaterialCommunityIcons name="qrcode" size={24} color={theme.colors.primary} />
                <View style={styles.scanItemInfo}>
                  <Text style={styles.scanItemName}>{scan.name}</Text>
                  <Text style={styles.scanItemDate}>{scan.date}</Text>
                </View>
              </View>
              <Text style={styles.scanItemPoints}>+{scan.points} pts</Text>
            </View>
          ))}
        </View>
        
        {/* Área de ações rápidas */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="trophy" size={24} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Prêmios</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="map" size={24} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Mapa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people" size={24} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Amigos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings" size={24} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    marginBottom: 20,
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileButton: {
    padding: 4,
  },
  welcomeText: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.medium,
    color: 'white',
    marginBottom: 8,
  },
  pointsText: {
    fontSize: theme.fontSizes.extraLarge,
    fontWeight: theme.fontWeights.bold,
    color: 'white',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: 'white',
  },
  statLabel: {
    fontSize: theme.fontSizes.small,
    color: 'white',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    marginTop: 60,
  },
  scanButton: {
    backgroundColor: theme.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.xl,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: theme.fontWeights.bold,
    fontSize: theme.fontSizes.medium,
    marginLeft: theme.spacing.sm,
  },
  recentSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  scanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.md,
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Sombra para Android
    elevation: 3,
  },
  scanItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanItemInfo: {
    marginLeft: theme.spacing.md,
  },
  scanItemName: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.primary,
  },
  scanItemDate: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.text.secondary,
  },
  scanItemPoints: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
  },
  quickActions: {
    marginBottom: theme.spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'white',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Sombra para Android
    elevation: 3,
  },
  actionButtonText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.primary,
  },
});

export default HomeScreen;
