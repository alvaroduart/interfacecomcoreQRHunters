import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BaseScreen from '../components/BaseScreen';
import theme from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const RegisterScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Validações básicas
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    // Aqui implementaríamos a lógica de registro real
    console.log('Register attempt:', { username, email, password });
    
    // Após registro bem-sucedido, voltaríamos para a tela de login
    Alert.alert(
      'Sucesso', 
      'Cadastro realizado com sucesso!', 
      [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
    );
  };

  return (
    <BaseScreen showBackButton={true}>
      <StatusBar style="auto" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      > 
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Usuário:"
            placeholderTextColor="#fff"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email:"
            placeholderTextColor="#fff"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Senha:"
            placeholderTextColor="#fff"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha:"
            placeholderTextColor="#fff"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Registrar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.xxl,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  } as const,
  logoText: {
    fontSize: theme.fontSizes.extraLarge,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
    marginTop: -20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  input: {
    backgroundColor: theme.colors.input.background,
    color: theme.colors.input.text,
    borderRadius: theme.borderRadius.large,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSizes.regular,
  },
  registerButton: {
    backgroundColor: theme.colors.button.primary,
    borderRadius: theme.borderRadius.large,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  registerButtonText: {
    color: theme.colors.button.text,
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
  },
});

export default RegisterScreen;
