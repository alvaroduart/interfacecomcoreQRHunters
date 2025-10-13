import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, DimensionValue, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CurvedBackground from '../components/CurvedBackground';
import theme from '../theme/theme';
import { useNavigation, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

interface BaseScreenProps {
  children: ReactNode;
  backgroundColor?: string;
  showCurvedBackground?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  curvedBackgroundProps?: {
    color?: string;
    height?: DimensionValue;
    borderRadius?: number;
    position?: 'top' | 'bottom';
  };
  style?: ViewStyle;
}

// Componente base para telas — fornece header/back e fundo curvo configurável
const BaseScreen: React.FC<BaseScreenProps> = ({
  children,
  backgroundColor = theme.colors.background,
  showCurvedBackground = true,
  showBackButton = false,
  onBackPress,
  curvedBackgroundProps = {
    color: theme.colors.primary,
    height: '40%',
    borderRadius: theme.borderRadius.extraLarge,
    position: 'bottom'
  },
  style = {},
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      <StatusBar translucent backgroundColor="transparent" />
      
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      )}
      
      <View style={styles.contentContainer}>
        {children}
      </View>
      
      {showCurvedBackground && (
        <CurvedBackground
          color={curvedBackgroundProps.color}
          height={curvedBackgroundProps.height}
          borderRadius={curvedBackgroundProps.borderRadius}
          position={curvedBackgroundProps.position}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default BaseScreen;
