import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import theme from '../theme/theme';
import { makeAuthUseCases } from '../core/factories';
import { useAuth } from '../context/AuthContext';
import { Password } from '../core/domain/value-objects/Password';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, logout, setUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handlePickImage = async () => {
    try {
      // Solicitar permissão para acessar a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para você escolher uma foto.');
        return;
      }

      // Abrir galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await handleUploadAvatar(asset.uri, asset.fileName || 'avatar.jpg', asset.mimeType || 'image/jpeg');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const handleUploadAvatar = async (fileUri: string, fileName: string, fileType: string) => {
    if (!user) return;

    setUploadingAvatar(true);
    try {
      const { uploadAvatarUseCase } = makeAuthUseCases();
      const avatarUrl = await uploadAvatarUseCase.execute({
        userId: user.id,
        fileUri,
        fileName,
        fileType,
      });

      // Atualizar o usuário no contexto com o novo avatar
      const updatedUser = user.updateAvatar(avatarUrl);
      setUser(updatedUser);

      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload do avatar:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar a foto de perfil');
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!user) return;
    Alert.alert(
      'Deletar perfil',
      'Tem certeza que deseja deletar seu perfil? Esta ação não poderá ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            const { deleteAccountUseCase } = makeAuthUseCases();
            const success = await deleteAccountUseCase.execute({ userId: user.id });
            if (success) {
              Alert.alert('Conta deletada', 'Seu perfil foi deletado com sucesso.');
              // Limpa estado de auth; o StackNavigator principal irá mostrar a tela de Login
              logout();
            } else {
              Alert.alert('Erro', 'Não foi possível deletar o perfil.');
            }
          },
        },
      ]
    );
  };
  
  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Erro', 'Digite sua senha atual');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (user) {
      const { changePasswordUseCase } = makeAuthUseCases();
      try {
        const success = await changePasswordUseCase.execute({ 
          userId: user.id, 
          oldPassword: currentPassword, 
          newPassword 
        });
        if (success) {
          Alert.alert('Sucesso', 'Senha atualizada com sucesso!');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          // Limpa estado de auth; o StackNavigator principal irá mostrar a tela de Login
          logout();
        } else {
          Alert.alert('Erro', 'Não foi possível atualizar a senha.');
        }
      } catch (err: any) {
        // Exibir mensagem de erro retornada pelo repositório/use-case, se disponível
        const message = err?.message || 'Não foi possível atualizar a senha.';
        Alert.alert('Erro', message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Cabeçalho */}
         <View style={styles.header}>
           <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
             <Ionicons name="menu" size={28} color="#fff" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Perfil</Text>
           <View style={{ width: 40 }} />
         </View>

      {/* Perfil do usuário */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          {uploadingAvatar ? (
            <View style={styles.avatarLoadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <Image 
              source={{uri: user?.avatarUrl || 'https://i.imgur.com/eyaqwju.png'}} 
              style={styles.avatar}
            />
          )}
          <TouchableOpacity 
            style={styles.editAvatarButton}
            onPress={handlePickImage}
            disabled={uploadingAvatar}
          >
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user ? user.name.value : 'Nome do Usuário'}</Text>
      </View>
      
      {/* Área de configurações */}
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Alterar senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Senha atual"
              placeholderTextColor={theme.colors.text.secondary}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Nova senha"
              placeholderTextColor={theme.colors.text.secondary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar nova senha"
              placeholderTextColor={theme.colors.text.secondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={handleUpdatePassword}
              activeOpacity={0.8}
            >
              <Text style={styles.updateButtonText}>Atualizar senha</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>Deletar perfil</Text>
            </TouchableOpacity>
          </View>
      
      {/* Círculo de fundo estilizado - padrão das outras telas */}
      <View style={styles.backgroundCircle} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundCircle: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary,
    opacity: 0.08,
    zIndex: -1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  avatarLoadingContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
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
      paddingHorizontal: 24,
      zIndex: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text.secondary,
      marginBottom: 12,
      marginLeft: 2,
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
    deleteButton: {
      backgroundColor: '#fff',
      borderRadius: 10,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 8,
      borderWidth: 1.5,
      borderColor: '#FF4D4F',
    },
    deleteButtonText: {
      color: '#FF4D4F',
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
});

export default ProfileScreen;
