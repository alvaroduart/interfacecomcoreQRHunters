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
import { RootStackParamList } from '../navigation/types'; // Verifique o caminho real para este arquivo
import theme from '../theme/theme'; // Verifique o caminho real para este arquivo
import { makeAuthUseCases } from '../core/factories'; // Verifique o caminho real para este arquivo
import { useAuth } from '../context/AuthContext'; // Verifique o caminho real para este arquivo
import { Password } from '../core/domain/value-objects/Password'; // Verifique o caminho real para este arquivo
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, logout, setUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [isCurrentPasswordSecure, setIsCurrentPasswordSecure] = useState(true);
  const [isNewPasswordSecure, setIsNewPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // NOVO: Função auxiliar para processar o resultado do ImagePicker
  const processImageResult = async (result: ImagePicker.ImagePickerResult) => {
    try {
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Assegura que fileName e mimeType tenham valores padrão
        await handleUploadAvatar(
          asset.uri,
          asset.fileName || `avatar-${Date.now()}.jpg`, // Nome único
          asset.mimeType || 'image/jpeg'
        );
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem');
    }
  };

  // NOVO: Função para abrir a CÂMERA
  const handleLaunchCamera = async () => {
    try {
      // Pede permissão para a CÂMERA
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à câmera para tirar uma foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      await processImageResult(result);
    } catch (error) {
      console.error('Erro ao abrir a câmera:', error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera');
    }
  };

  // NOVO: Função para abrir a GALERIA
  const handleLaunchGallery = async () => {
    try {
      // Pede permissão para a GALERIA
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para você escolher uma foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      await processImageResult(result);
    } catch (error) {
      console.error('Erro ao selecionar da galeria:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria');
    }
  };

  // NOVO: Função para mostrar as opções de escolha (câmera ou galeria)
  const showImagePickerOptions = () => {
    Alert.alert(
      'Alterar Foto de Perfil',
      'Escolha uma opção para sua nova foto:',
      [
        {
          text: 'Tirar Foto',
          onPress: () => handleLaunchCamera(),
        },
        {
          text: 'Escolher da Galeria',
          onPress: () => handleLaunchGallery(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true } // Permite fechar clicando fora do alerta
    );
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

    // Validação básica da nova senha (adicione mais validações conforme a sua Password VO)
    try {
        // Exemplo simples: mínimo de 8 caracteres e deve conter letra e número
        if (!newPassword || newPassword.length < 8) {
            throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
        }
        const complexityRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
        if (!complexityRegex.test(newPassword)) {
            throw new Error('A nova senha deve conter pelo menos uma letra e um número.');
        }
    } catch (error: any) {
        Alert.alert('Erro na nova senha', error.message);
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
          Alert.alert('Sucesso', 'Senha atualizada com sucesso! Por favor, faça login novamente com sua nova senha.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          logout(); // Força logout para o usuário fazer login com a nova senha
        } else {
          Alert.alert('Erro', 'Não foi possível atualizar a senha.');
        }
      } catch (err: any) {
        const message = err?.message || 'Não foi possível atualizar a senha.';
        Alert.alert('Erro', message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          {uploadingAvatar ? (
            <View style={styles.avatarLoadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatarBackground]}>
                <Ionicons name="person-circle-outline" size={80} color={theme.colors.primary} />
              </View>
            )
          )}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={showImagePickerOptions} 
            disabled={uploadingAvatar}
          >
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user ? user.name.value : 'Nome do Usuário'}</Text>
      </View>

      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Alterar senha</Text>

        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Senha atual"
            placeholderTextColor={theme.colors.text.secondary}
            secureTextEntry={isCurrentPasswordSecure}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsCurrentPasswordSecure(!isCurrentPasswordSecure)}
          >
            <Ionicons
              name={isCurrentPasswordSecure ? 'eye-off' : 'eye'}
              size={24}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Nova senha"
            placeholderTextColor={theme.colors.text.secondary}
            secureTextEntry={isNewPasswordSecure}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsNewPasswordSecure(!isNewPasswordSecure)}
          >
            <Ionicons
              name={isNewPasswordSecure ? 'eye-off' : 'eye'}
              size={24}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirmar nova senha"
            placeholderTextColor={theme.colors.text.secondary}
            secureTextEntry={isConfirmPasswordSecure}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)}
          >
            <Ionicons
              name={isConfirmPasswordSecure ? 'eye-off' : 'eye'}
              size={24}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

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
  defaultAvatarBackground: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
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
  passwordInputContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    paddingLeft: 15,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  eyeButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
});

export default ProfileScreen;