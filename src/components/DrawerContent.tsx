import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme/theme';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const DrawerContent = (props: any) => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  // Detecta a tab ativa
  const tabIndex = useNavigationState(state => {
    const mainApp = state.routes.find(r => r.name === 'MainApp');
    if (!mainApp || !mainApp.state) return 0;
    // Compatível com navegação aninhada
    if (mainApp.state.index !== undefined) return mainApp.state.index;
    if (mainApp.state.routes && mainApp.state.routes.length > 0) {
      return mainApp.state.routes.findIndex((r: any) => r.state && r.state.isActive);
    }
    return 0;
  });
  const tabNames = ['Scanner', 'Progress', 'Route'];
  const activeTab = tabNames[tabIndex] || 'Scanner';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {/* Divisor no topo */}
      <View style={styles.topSpacer} />

      {/* Links de navegação personalizados */}
      <View style={styles.drawerItems}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            props.navigation.navigate('MainApp', {
              screen: activeTab,
              params: { screen: 'Perfil' }
            });
            props.navigation.closeDrawer && props.navigation.closeDrawer();
          }}
        >
          <Ionicons name="person-outline" size={22} color={theme.colors.text.primary} />
          <Text style={styles.menuItemText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            props.navigation.navigate('MainApp', {
              screen: activeTab,
              params: { screen: 'Jornadas' }
            });
            props.navigation.closeDrawer && props.navigation.closeDrawer();
          }}
        >
          <Ionicons name="walk-outline" size={22} color={theme.colors.text.primary} />
          <Text style={styles.menuItemText}>Jornadas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            props.navigation.navigate('MainApp', {
              screen: activeTab,
              params: { screen: 'Histórico' }
            });
            props.navigation.closeDrawer && props.navigation.closeDrawer();
          }}
        >
          <Ionicons name="time-outline" size={22} color={theme.colors.text.primary} />
          <Text style={styles.menuItemText}>Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            props.navigation.navigate('MainApp', {
              screen: activeTab,
              params: { screen: 'Recompensas' }
            });
            props.navigation.closeDrawer && props.navigation.closeDrawer();
          }}
        >
          <Ionicons name="gift-outline" size={22} color={theme.colors.text.primary} />
          <Text style={styles.menuItemText}>Recompensas</Text>
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
