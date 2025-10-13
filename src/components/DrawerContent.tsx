import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme/theme';
import { useNavigation, useNavigationState, CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const DrawerContent = (props: any) => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Chama logout (o StackNavigator principal reage e mostra a tela de login)
    logout();
    props.navigation.closeDrawer && props.navigation.closeDrawer();
  };

  // Determina a aba ativa no Tab Navigator pai; se falhar, usa 'Scanner' por padrão.
  const parent = (props.navigation as any).getParent?.();
  let activeTab = 'Scanner';
  try {
    if (parent && parent.getState) {
      const pstate = parent.getState();
      const idx = typeof pstate.index === 'number' ? pstate.index : 0;
      const names = pstate.routeNames || (pstate.routes || []).map((r: any) => r.name);
      activeTab = names && names[idx] ? names[idx] : 'Perfil';
    }
  } catch (e) {
    activeTab = 'Scanner';
  }

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {/* Divisor no topo */}
      <View style={styles.topSpacer} />

      {/* Links de navegação personalizados */}
      <View style={styles.drawerItems}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            const navParent = (props.navigation as any).getParent?.() || props.navigation;
            // Navega explicitamente para a aba 'Perfil' (ativa a aba Perfil)
            // Se possível, abre a rota padrão do drawer (ProfileOnly)
            try {
              navParent.navigate('Perfil');
            } catch (e) {
              // Fallback para tentar usar o activeTab calculado
              navParent.navigate(activeTab, { screen: 'Perfil' });
            }
            props.navigation.closeDrawer && props.navigation.closeDrawer();
          }}
        >
          <Ionicons name="person-outline" size={22} color={theme.colors.text.primary} />
          <Text style={styles.menuItemText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            const navParent = (props.navigation as any).getParent?.() || props.navigation;
            // Navega explicitamente para a aba 'Perfil' e abre a tela 'Jornadas'
              let navigated = false;
            try {
              if (props.navigation && typeof props.navigation.navigate === 'function') {
                props.navigation.navigate('Jornadas');
                  navigated = true; // This line remains unchanged
              }
            } catch (e) {
              
            }
            
           
            try {
                if (navParent && typeof navParent.navigate === 'function') {
                navParent.navigate('Perfil', { screen: 'Jornadas' });
                navigated = true;
              }
            } catch (e) {
              
            }
            if (!navigated) {
              try {
                navParent.dispatch(
                  CommonActions.navigate({
                    name: 'Perfil',
                    params: { screen: 'Jornadas' },
                  })
                );
                navigated = true;
              } catch (e) {
                
              }
            }
            if (!navigated) {
              try {
                
                (navigation as any).navigate('Perfil', { screen: 'Jornadas' });
                navigated = true;
              } catch (e) {
                
              }
            }
            if (!navigated) {
             
              try {
                (navigation as any).navigate('Scanner', { screen: 'Jornadas' });
                navigated = true;
              } catch (e) {
                // nada a fazer
              }
            }
            props.navigation.closeDrawer && props.navigation.closeDrawer();
          }}
        >
          <Ionicons name="walk-outline" size={22} color={theme.colors.text.primary} />
          <Text style={styles.menuItemText}>Jornadas</Text>
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
