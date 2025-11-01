// Configuração do ambiente
export const config = {
  // Altere para 'supabase' quando quiser usar o backend real
  repository: 'supabase' as 'mock' | 'supabase',
  
  // Configurações do Supabase
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // Raio de proximidade padrão em metros
  proximityRadiusMeters: 50,
};
