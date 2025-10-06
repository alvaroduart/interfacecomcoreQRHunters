import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import theme from '../theme/theme';
import { makeAuthUseCases } from '../core/factories';
import { useAuth } from '../context/AuthContext';
import { Password } from '../core/domain/value-objects/Password';

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (user) {
      const { changePasswordUseCase } = makeAuthUseCases();
      await changePasswordUseCase.execute({ userId: user.id, oldPassword: user.password, newPassword: Password.create(newPassword) });
      Alert.alert('Sucesso', 'Senha atualizada com sucesso!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Text>
            <Ionicons name="menu" size={28} color="#000" />
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{width: 40}} /> {/* Espaço para manter o cabeçalho centralizado */}
      </View>

      {/* Perfil do usuário */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{uri: 'https://i.imgur.com/eyaqwju.png'}} 
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Text>
              <Ionicons name="camera" size={24} color="#fff" />
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user ? user.name.value : 'Nome do Usuário'}</Text>
      </View>
      
      {/* Área de configurações */}
      <View style={styles.settingsContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nova senha"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar nova senha"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        
        <TouchableOpacity 
          style={styles.updateButton}
          onPress={handleUpdatePassword}
        >
          <Text style={styles.updateButtonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>
      
      {/* Círculo de fundo estilizado - padrão das outras telas */}
      <View style={styles.backgroundCircle} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10, 
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  settingsContainer: {
    paddingHorizontal: 20,
    zIndex: 2,
  },
  settingButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingButtonText: {
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default ProfileScreen;
