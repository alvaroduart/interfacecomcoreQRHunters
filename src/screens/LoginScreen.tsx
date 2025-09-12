import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BaseScreen from '../components/BaseScreen';
import theme from '../theme/theme';

const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Lógica de login será implementada aqui
    console.log('Login attempt:', username, password);
    // navigation.navigate('Home'); // Será implementado depois
  };

  const handleRegister = () => {
    // Navegação para a tela de cadastro será implementada depois
    // navigation.navigate('Register');
    console.log('Navigate to register screen');
  };

  return (
    <BaseScreen>
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
          <Text style={styles.logoText}>QrHunters</Text>
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
            placeholder="Senha:"
            placeholderTextColor="#fff"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não possui uma conta?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>Cadastrar-se</Text>
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
  headerText: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.light,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
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
  loginButton: {
    backgroundColor: theme.colors.button.primary,
    borderRadius: theme.borderRadius.large,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  loginButtonText: {
    color: theme.colors.button.text,
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
  },
  registerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  registerText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text.inverted,
    marginBottom: theme.spacing.xs,
  },
  registerLink: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.accent,
    fontWeight: theme.fontWeights.bold,
  },
});

export default LoginScreen;
