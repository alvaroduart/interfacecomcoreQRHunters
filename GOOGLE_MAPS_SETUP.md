# Configuração do Google Maps no QR Hunters

## 📍 Funcionalidade Implementada

A tela de **Percurso** agora exibe um mapa real com todos os QR codes validados pelo usuário, mostrando:
- Marcadores numerados para cada ponto validado
- Nome do local em cada marcador
- Informações sobre o progresso (quantidade de pontos validados)
- Botões para escanear novos QR codes e finalizar o percurso

## 🔑 Obter Chave da API do Google Maps

### Passo 1: Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Crie um novo projeto ou selecione um existente
4. Nome sugerido: "QR Hunters"

### Passo 2: Ativar APIs Necessárias

1. No menu lateral, vá em: **APIs & Services** → **Library**
2. Procure e ative as seguintes APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Maps JavaScript API** (opcional, para web)

### Passo 3: Criar Credenciais

1. Vá em: **APIs & Services** → **Credentials**
2. Clique em **+ CREATE CREDENTIALS** → **API Key**
3. Uma chave será gerada automaticamente
4. Clique em **RESTRICT KEY** para configurar

### Passo 4: Restringir a Chave (Recomendado)

**Para Android:**
1. Em "Application restrictions", selecione **Android apps**
2. Clique em **+ Add an item**
3. Adicione o package name: `com.anonymous.app` (ou seu package)
4. Adicione o SHA-1 fingerprint (obtenha rodando o comando abaixo)

**Para iOS:**
1. Em "Application restrictions", selecione **iOS apps**
2. Adicione o Bundle ID do seu app

**Para obter o SHA-1 (Android):**
```bash
# Para debug
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Para release
keytool -list -v -keystore path/to/your/release.keystore
```

### Passo 5: Adicionar a Chave ao Projeto

Edite o arquivo `app.json` e substitua `YOUR_GOOGLE_MAPS_API_KEY` pela sua chave:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "SUA_CHAVE_AQUI"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "SUA_CHAVE_AQUI"
      }
    }
  }
}
```

## 🚀 Como Usar

### Testando com Expo Go

⚠️ **Importante:** O Google Maps pode não funcionar perfeitamente no Expo Go. Para testar completamente:

1. **Development Build:**
```bash
npx expo install expo-dev-client
npx expo prebuild
```

2. **Build para Android:**
```bash
eas build --profile development --platform android
```

3. **Build para iOS:**
```bash
eas build --profile development --platform ios
```

### Testando no Simulador

O mapa funcionará no simulador sem chave de API, mas mostrará marca d'água "For development purposes only".

## 📱 Funcionalidades da Tela de Percurso

1. **Mapa Interativo:**
   - Zoom e pan
   - Marcadores numerados
   - Título e descrição em cada marcador

2. **Card de Progresso:**
   - Mostra quantidade de pontos validados
   - Mensagem quando não há pontos

3. **Botões de Ação:**
   - "Escanear QR Code" - Navega para a câmera
   - "Finalizar Percurso" - Aparece apenas se houver pontos validados

4. **Integração com Supabase:**
   - Busca automaticamente as validações do usuário
   - Exibe os pontos com coordenadas reais

## 🗂️ Estrutura de Dados

Os QR codes validados contêm:
```typescript
{
  id: string;              // ID do QR code
  code: string;            // Código do QR code
  locationName: string;    // Nome do local
  description?: string;    // Descrição opcional
  latitude: number;        // Latitude
  longitude: number;       // Longitude
  validatedAt: Date;       // Data/hora da validação
}
```

## 🐛 Troubleshooting

### Mapa não aparece:
1. Verifique se adicionou a chave da API corretamente
2. Confirme que as APIs do Google Maps estão ativadas
3. Verifique as permissões de localização

### Marcadores não aparecem:
1. Valide pelo menos um QR code primeiro
2. Verifique se o usuário está logado
3. Confira os logs do console para erros

### Erro "Maps SDK not initialized":
1. Faça um rebuild do app: `npx expo prebuild --clean`
2. Reinstale as dependências: `npm install`
3. Limpe o cache: `npx expo start -c`

## 📚 Próximos Passos

- [ ] Adicionar rota traçada entre os pontos
- [ ] Calcular distância total percorrida
- [ ] Adicionar timer para tempo de percurso
- [ ] Permitir exportar o mapa como imagem
- [ ] Adicionar modo offline com mapas baixados

## 🔗 Links Úteis

- [Google Maps Platform](https://console.cloud.google.com/)
- [React Native Maps Docs](https://github.com/react-native-maps/react-native-maps)
- [Expo Maps Guide](https://docs.expo.dev/versions/latest/sdk/map-view/)
