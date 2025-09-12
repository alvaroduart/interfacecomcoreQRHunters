/**
 * Tema global para o aplicativo QrHunters
 * Centraliza cores, espaçamentos e outros valores estilísticos
 * para manter consistência em todo o aplicativo
 */

export const theme = {
  colors: {
    primary: '#4169e1', // Azul principal
    secondary: '#e4aa47', // Amarelo/laranja (cor do botão)
    accent: '#ffe17b', // Amarelo claro (link)
    background: '#f7f6ed', // Fundo claro creme
    text: {
      primary: '#000000',
      secondary: '#888888',
      inverted: '#ffffff',
      link: '#ffe17b',
    },
    input: {
      background: '#000000',
      text: '#ffffff',
    },
    button: {
      primary: '#e4aa47',
      text: '#ffffff',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 8,
    medium: 16,
    large: 30,
    extraLarge: 130,
  },
  fontSizes: {
    small: 12,
    regular: 16,
    medium: 18,
    large: 24,
    extraLarge: 32,
  },
  fontWeights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    bold: 'bold' as const,
  },
};

export default theme;
