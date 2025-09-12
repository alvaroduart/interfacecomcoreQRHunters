import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, ViewStyle, StatusBar, DimensionValue } from 'react-native';
import CurvedBackground from '../components/CurvedBackground';
import theme from '../theme/theme';

interface BaseScreenProps {
  children: ReactNode;
  backgroundColor?: string;
  showCurvedBackground?: boolean;
  curvedBackgroundProps?: {
    color?: string;
    height?: DimensionValue;
    borderRadius?: number;
    position?: 'top' | 'bottom';
  };
  style?: ViewStyle;
}

/**
 * Componente base para todas as telas do aplicativo,
 * garantindo consistência visual em todas as telas.
 */
const BaseScreen: React.FC<BaseScreenProps> = ({
  children,
  backgroundColor = theme.colors.background,
  showCurvedBackground = true,
  curvedBackgroundProps = {
    color: theme.colors.primary,
    height: '40%',
    borderRadius: theme.borderRadius.extraLarge,
    position: 'bottom'
  },
  style = {},
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      <StatusBar translucent backgroundColor="transparent" />
      
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
});

export default BaseScreen;
