import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const DrawerContent = (props: any) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLogout = () => {
    // Implementar lógica de logout aqui
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {/* Divisor no topo */}
      <View style={styles.topSpacer} />

      {/* Links de navegação personalizados */}
      <View style={styles.drawerItems}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            props.navigation.navigate('MainApp', { screen: 'Scanner' });
          }}
        >
          <Text>
            <Ionicons name="qr-code-outline" size={22} color={theme.colors.text.primary} />
          </Text>
          <Text style={styles.menuItemText}>Scanner</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            props.navigation.navigate('MainApp', { screen: 'Progress' });
          }}
        >
          <Text>
            <Ionicons name="list-outline" size={22} color={theme.colors.text.primary} />
          </Text>
          <Text style={styles.menuItemText}>Progresso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            props.navigation.navigate('MainApp', { screen: 'Route' });
          }}
        >
          <Text>
            <Ionicons name="map-outline" size={22} color={theme.colors.text.primary} />
          </Text>
          <Text style={styles.menuItemText}>Percurso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            props.navigation.navigate('Profile');
          }}
        >
          <Text>
            <Ionicons name="person-outline" size={22} color={theme.colors.text.primary} />
          </Text>
          <Text style={styles.menuItemText}>Perfil</Text>
        </TouchableOpacity>
      </View>
      
      {/* Divisor */}
      <View style={styles.divider} />

      {/* Botão de logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </Text>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  topSpacer: {
    height: 20,
  },
  divider: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    marginVertical: theme.spacing.sm,
  },
  drawerItems: {
    flex: 1,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginVertical: 4,
  },
  menuItemText: {
    fontSize: theme.fontSizes.regular,
    marginLeft: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.md,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.small,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    marginLeft: theme.spacing.sm,
    fontWeight: theme.fontWeights.bold,
    fontSize: theme.fontSizes.regular,
  },
});

export default DrawerContent;
