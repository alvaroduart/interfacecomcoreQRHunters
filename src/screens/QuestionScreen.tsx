import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import theme from '../theme/theme';
import { makeQRCodeUseCases } from '../core/factories/QRCodeFactory';
import { QRCode } from '../core/domain/entities/QRCode';
import { Answer } from '../core/domain/entities/Question';
import { useAuth } from '../context/AuthContext';

type QuestionScreenRouteProp = RouteProp<RootStackParamList, 'Question'>;
type QuestionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Question'>;

const QuestionScreen = () => {
  const navigation = useNavigation<QuestionScreenNavigationProp>();
  const route = useRoute<QuestionScreenRouteProp>();
  const { user } = useAuth();
  
  const { qrCodeId, userLatitude, userLongitude } = route.params;
  
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Carrega os dados do QR Code
  React.useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    try {
      const { getQRCodeDetailsUseCase } = makeQRCodeUseCases();
      const qrCodeData = await getQRCodeDetailsUseCase.execute({ id: qrCodeId });
      
      if (!qrCodeData) {
        Alert.alert('Erro', 'QR Code não encontrado', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        return;
      }
      
      setQRCode(qrCodeData);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar pergunta', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswerId) {
      Alert.alert('Atenção', 'Por favor, selecione uma resposta');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setSubmitting(true);

    try {
      const { validateQRCodeUseCase } = makeQRCodeUseCases();
      
      const result = await validateQRCodeUseCase.execute({
        qrCodeId,
        userId: user.id,
        userCoordinates: {
          latitude: userLatitude,
          longitude: userLongitude
        },
        answerId: selectedAnswerId
      });

      if (result.success) {
        Alert.alert(
          '✅ Parabéns!',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        const errorMsg = result.errors?.locationMismatch
          ? result.message
          : result.errors?.wrongAnswer
          ? result.message
          : 'Não foi possível validar o ponto de controle';

        Alert.alert('❌ Ops!', errorMsg, [
          {
            text: 'Tentar Novamente',
            onPress: () => {
              setSelectedAnswerId(null);
              setSubmitting(false);
            }
          },
          {
            text: 'Voltar',
            onPress: () => navigation.goBack()
          }
        ]);
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao validar a resposta. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando pergunta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!qrCode) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pergunta do Checkpoint</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Informações do local */}
        <View style={styles.locationCard}>
          <Ionicons name="location" size={24} color={theme.colors.primary} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{qrCode.location.value}</Text>
            {qrCode.description && (
              <Text style={styles.locationDescription}>{qrCode.description}</Text>
            )}
          </View>
        </View>

        {/* Pergunta */}
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Pergunta:</Text>
          <Text style={styles.questionText}>{qrCode.question.text}</Text>
        </View>

        {/* Respostas */}
        <View style={styles.answersContainer}>
          <Text style={styles.answersLabel}>Escolha uma resposta:</Text>
          {qrCode.question.answers.map((answer: Answer) => (
            <TouchableOpacity
              key={answer.id}
              style={[
                styles.answerButton,
                selectedAnswerId === answer.id && styles.answerButtonSelected
              ]}
              onPress={() => setSelectedAnswerId(answer.id)}
              disabled={submitting}
            >
              <View style={[
                styles.radioButton,
                selectedAnswerId === answer.id && styles.radioButtonSelected
              ]}>
                {selectedAnswerId === answer.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={[
                styles.answerText,
                selectedAnswerId === answer.id && styles.answerTextSelected
              ]}>
                {answer.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão de confirmar */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedAnswerId || submitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedAnswerId || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Confirmar Resposta</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text.secondary,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.text.secondary,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  questionLabel: {
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    lineHeight: 28,
  },
  answersContainer: {
    marginBottom: 20,
  },
  answersLabel: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  answerButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#f0f7ff',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  answerText: {
    flex: 1,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text.primary,
  },
  answerTextSelected: {
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.primary,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
    marginLeft: 8,
  },
});

export default QuestionScreen;
