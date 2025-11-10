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
import { RootStackParamList } from '../navigation/types';
import {makeAuthUseCases} from '../core/factories/AuthFactory'
import { useAuth } from '../context/AuthContext';
import { Name } from '../core/domain/value-objects/Name';
import { Email } from '../core/domain/value-objects/Email';
import { Password } from '../core/domain/value-objects/Password';
// NOVO: Importação do pacote de ícones
import { MaterialCommunityIcons } from '@expo/vector-icons'; 


const RegisterScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const Auth = makeAuthUseCases()

  // NOVO: Estados para controlar a visibilidade da senha
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);

  const isPasswordValid = () => {
    // ... (sua função de validação continua a mesma)
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':\"|,.<>\/?]/.test(password);
    
    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
    };
  };

  const passwordValidation = isPasswordValid();

  const handleRegister = async () => {
    // ... (sua função de registro continua a mesma)
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      await register(username, email, password);
      Alert.alert(
        'Sucesso',
        'Cadastro realizado com sucesso!',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      const error = err as Error;
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <BaseScreen showBackButton={true}>
      <StatusBar style="dark" />
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
            style={styles.input} // Este campo continua normal
            placeholder="Nome de usuário"
            placeholderTextColor={theme.colors.text.secondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input} // Este campo continua normal
            placeholder="Email"
            placeholderTextColor={theme.colors.text.secondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* MODIFICADO: Campo de Senha com Ícone */}
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput} // Estilo modificado
              placeholder="Senha"
              placeholderTextColor={theme.colors.text.secondary}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setShowPasswordHint(true)}
              secureTextEntry={isPasswordSecure} // Controlado pelo estado
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setIsPasswordSecure(!isPasswordSecure)}
            >
              <MaterialCommunityIcons 
                name={isPasswordSecure ? 'eye-off' : 'eye'} 
                size={24} 
                color={theme.colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>

          {showPasswordHint && password.length > 0 && (
            <View style={styles.passwordHintContainer}>
              {/* ... (seu hint de senha continua o mesmo) ... */}
              <Text style={styles.passwordHintTitle}>A senha deve conter:</Text>
              <Text style={[styles.passwordHint, passwordValidation.hasMinLength && styles.passwordHintValid]}>
                {passwordValidation.hasMinLength ? '✓' : '✗'} Mínimo de 8 caracteres
              </Text>
              <Text style={[styles.passwordHint, passwordValidation.hasUpperCase && styles.passwordHintValid]}>
                {passwordValidation.hasUpperCase ? '✓' : '✗'} Uma letra maiúscula
              </Text>
              <Text style={[styles.passwordHint, passwordValidation.hasLowerCase && styles.passwordHintValid]}>
                {passwordValidation.hasLowerCase ? '✓' : '✗'} Uma letra minúscula
              </Text>
              <Text style={[styles.passwordHint, passwordValidation.hasNumber && styles.passwordHintValid]}>
                {passwordValidation.hasNumber ? '✓' : '✗'} Um número
              </Text>
              <Text style={[styles.passwordHint, passwordValidation.hasSpecialChar && styles.passwordHintValid]}>
                {passwordValidation.hasSpecialChar ? '✓' : '✗'} Um caractere especial (!@#$%^&* etc.)
              </Text>
            </View>
          )}

          {/* MODIFICADO: Campo de Confirmar Senha com Ícone */}
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput} // Estilo modificado
              placeholder="Confirmar senha"
              placeholderTextColor={theme.colors.text.secondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={isConfirmPasswordSecure} // Controlado pelo estado
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)}
            >
              <MaterialCommunityIcons 
                name={isConfirmPasswordSecure ? 'eye-off' : 'eye'} 
                size={24} 
                color={theme.colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já possui uma conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BaseScreen>
  );
};

// MODIFICADO: Novos estilos adicionados
const styles = StyleSheet.create({
  keyboardAvoidingView: {
    // ... (estilo existente)
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 24,
  },
  logoContainer: {
    // ... (estilo existente)
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    // ... (estilo existente)
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  logoText: {
    // ... (estilo existente)
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputContainer: {
    // ... (estilo existente)
    width: '100%',
    marginBottom: 24,
  },
  input: {
    // Este é o estilo original (usado para Nome e Email)
    backgroundColor: '#fff',
    color: theme.colors.text.primary,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  // NOVO: Wrapper para os campos de senha (copia o estilo 'input' mas adiciona flex)
  passwordInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // Removemos o padding daqui para aplicar nos filhos
  },
  // NOVO: Estilo para o TextInput de senha (para ele expandir)
  passwordInput: {
    flex: 1, // Ocupa o espaço disponível
    color: theme.colors.text.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
  },
  // NOVO: Estilo para o botão do ícone
  eyeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  registerButton: {
    // ... (estilo existente)
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  registerButtonText: {
    // ... (estilo existente)
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginContainer: {
    // ... (estilo existente)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    // ... (estilo existente)
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginRight: 6,
  },
  loginLink: {
    // ... (estilo existente)
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  passwordHintContainer: {
    // ... (estilo existente)
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  passwordHintTitle: {
    // ... (estilo existente)
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  passwordHint: {
    // ... (estilo existente)
    fontSize: 12,
    color: '#E57373',
    marginBottom: 4,
    fontWeight: '500',
  },
  passwordHintValid: {
    // ... (estilo existente)
    color: '#66BB6A',
  },
});

export default RegisterScreen;