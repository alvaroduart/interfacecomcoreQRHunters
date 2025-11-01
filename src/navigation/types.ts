// Tipos globais de navegação para uso com StackNavigationProp
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  // MainApp deve receber uma instrução de navegação aninhada (tela + parâmetros)
  MainApp: { screen?: string; params?: any } | undefined;
  // Expor telas filhas comuns como chaves de nível superior para digitação mais simples em testes/componentes
  Scanner: undefined;
  Question: {
    qrCodeId: string;
    userLatitude: number;
    userLongitude: number;
  };
  Progress: undefined;
  Route: { journeyId?: string } | undefined;
  Perfil: undefined;
  Jornadas: undefined;
  Home: undefined;
};
