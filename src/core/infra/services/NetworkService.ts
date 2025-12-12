import NetInfo from '@react-native-community/netinfo';

/**
 * Serviço para verificar conectividade de rede
 */
export class NetworkService {
  private static instance: NetworkService;
  private isConnected: boolean = true;

  private constructor() {
    this.setupListener();
  }

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  /**
   * Configura listener para mudanças de conectividade
   */
  private setupListener(): void {
    NetInfo.addEventListener(state => {
      this.isConnected = state.isConnected ?? false;
      console.log('[NetworkService] Conectividade alterada:', this.isConnected ? 'Online' : 'Offline');
    });
  }

  /**
   * Verifica se há conexão com internet
   */
  async checkConnection(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected ?? false;
      return this.isConnected;
    } catch (error) {
      console.error('[NetworkService] Erro ao verificar conectividade:', error);
      return false;
    }
  }

  /**
   * Retorna o estado atual da conexão (síncrono)
   */
  isOnline(): boolean {
    return this.isConnected;
  }
}
