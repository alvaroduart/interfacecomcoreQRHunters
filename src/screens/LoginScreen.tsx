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
// import {makeAuthUseCases} from '../core/factories/AuthFactory'; // Removido (não estava sendo usado)
import { useAuth } from '../context/AuthContext';
import { Email } from '../core/domain/value-objects/Email';
import { Password } from '../core/domain/value-objects/Password';
// NOVO: Importação do pacote de ícones
import { MaterialCommunityIcons } from '@expo/vector-icons'; 


const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // NOVO: Estado para controlar a visibilidade da senha
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  // const Login = makeAuthUseCases() // Removido (não estava sendo usado)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      await login(email, password);
      // Ao autenticar, o contexto será atualizado e o StackNavigator redireciona automaticamente
    } catch (err) {
      const error = err as Error;
      Alert.alert('Erro', error.message);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <BaseScreen>
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
            style={styles.input}
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
              style={styles.passwordInput}
              placeholder="Senha"
              placeholderTextColor={theme.colors.text.secondary}
              value={password}
              onChangeText={setPassword}
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

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não possui uma conta?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BaseScreen>
  );
};

// MODIFICADO: Novos estilos adicionados
const styles = StyleSheet.create({
  keyboardAvoidingView: {
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
    // Este é o estilo original (usado para Email)
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

  // NOVO: Wrapper para o campo de senha (copia o estilo 'input' mas adiciona flex)
  passwordInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
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

  loginButton: {
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
  loginButtonText: {
    // ... (estilo existente)
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  registerContainer: {
    // ... (estilo existente)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    // ... (estilo existente)
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginRight: 6,
  },
  registerLink: {
    // ... (estilo existente)
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;