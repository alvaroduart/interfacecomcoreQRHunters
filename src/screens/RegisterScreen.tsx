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
  Alert,
  ScrollView
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

  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);

  const isPasswordValid = () => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':\"|,.<>\/?]/.test(password);
    const hasNoSpaces = !/\s/.test(password);
    
    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      hasNoSpaces,
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && hasNoSpaces
    };
  };  const passwordValidation = isPasswordValid();

  const handleRegister = async () => {
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
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
              placeholder="Nome de usuário"
              placeholderTextColor={theme.colors.text.secondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.text.secondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Senha"
                placeholderTextColor={theme.colors.text.secondary}
                value={password}
                onChangeText={(text) => setPassword(text.replace(/\s/g, ''))}
                onFocus={() => setShowPasswordHint(true)}
                secureTextEntry={isPasswordSecure}
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
                <Text style={[styles.passwordHint, passwordValidation.hasNoSpaces && styles.passwordHintValid]}>
                  {passwordValidation.hasNoSpaces ? '✓' : '✗'} Sem espaços
                </Text>
              </View>
            )}

            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirmar senha"
                placeholderTextColor={theme.colors.text.secondary}
                value={confirmPassword}
                onChangeText={(text) => setConfirmPassword(text.replace(/\s/g, ''))}
                secureTextEntry={isConfirmPasswordSecure}
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
          {/* <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já possui uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 24,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
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

  passwordInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: theme.colors.text.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
  },
  eyeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  registerButton: {
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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginRight: 6,
  },
  loginLink: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  passwordHintContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  passwordHintTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  passwordHint: {
    fontSize: 12,
    color: '#E57373',
    marginBottom: 4,
    fontWeight: '500',
  },
  passwordHintValid: {
    color: '#66BB6A',
  },
});

export default RegisterScreen;