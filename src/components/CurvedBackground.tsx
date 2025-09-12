import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';

interface CurvedBackgroundProps {
  color?: string;
  height?: DimensionValue;
  borderRadius?: number;
  position?: 'top' | 'bottom';
  style?: ViewStyle;
}

/**
 * Componente reutilizável que cria um fundo curvo arredondado
 * que pode ser posicionado no topo ou na base da tela.
 */
const CurvedBackground: React.FC<CurvedBackgroundProps> = ({
  color = '#4169e1',
  height = '40%',
  borderRadius = 130,
  position = 'bottom',
  style = {},
}) => {
  const backgroundStyle = {
    backgroundColor: color,
    height: height,
    ...(position === 'bottom' 
      ? { 
          bottom: 0,
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
        }
      : { 
          top: 0,
          borderBottomLeftRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
        }
    ),
  };

  return <View style={[styles.background, backgroundStyle, style]} />;
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
});

export default CurvedBackground;
