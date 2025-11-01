# Funcionalidade de Validação de QR Code

## Visão Geral

Esta funcionalidade implementa um sistema completo de validação de pontos de controle através de QR Codes, incluindo:

- **Leitura de QR Code via câmera**
- **Validação de localização GPS**
- **Sistema de perguntas e respostas**
- **Validação completa do ponto de controle**

## Arquitetura Clean Architecture

A implementação segue rigorosamente os padrões de Clean Architecture do projeto:

### 1. Domain Layer (Camada de Domínio)

#### Entities (Entidades)
- **`QRCode`**: Entidade principal que representa um ponto de controle
  - Propriedades: `id`, `code`, `location`, `coordinates`, `question`, `scannedAt`, `status`, `description`
  - Método `withValidation()`: Cria uma cópia com status atualizado

- **`Question`**: Entidade que representa uma pergunta
  - Propriedades: `id`, `text`, `answers` (array de 4 respostas)
  - Validações: Exatamente 4 respostas, apenas 1 correta
  - Métodos: `isCorrectAnswer()`, `getCorrectAnswer()`

#### Value Objects
- **`Coordinates`**: Encapsula latitude e longitude
  - Métodos: `distanceTo()`, `isWithinRadius()`
  - Usa Haversine para cálculo de distância

- **`Latitude`**: Valida valores entre -90 e 90
- **`Longitude`**: Valida valores entre -180 e 180
- **`Code`**: Representa o código do QR
- **`Location`**: Representa o nome do local

#### Use Cases
- **`ValidateQRCodeUseCase`**: Orquestra toda a lógica de validação
  - Busca o QR Code por ID
  - Valida proximidade GPS (raio padrão: 50 metros)
  - Valida resposta da pergunta
  - Atualiza o status do QR Code
  - Retorna resultado detalhado com mensagens

- **`GetQRCodeDetailsUseCase`**: Busca detalhes de um QR Code
- **`ScanQRCodeUseCase`**: Registra a leitura inicial do QR Code

#### Repository Interface
```typescript
interface QRCodeRepository {
  scanQRCode(code: Code, location: Location): Promise<QRCode>;
  getQRCodeDetails(id: string): Promise<QRCode | undefined>;
  updateQRCode(qrCode: QRCode): Promise<QRCode>;
  getQRCodeByCode(code: string): Promise<QRCode | undefined>;
}
```

### 2. Infrastructure Layer (Camada de Infraestrutura)

#### Repository Mock
- **`QRCodeRepositoryMock`**: Implementação mock com dados de exemplo
  - 3 pontos de controle pré-cadastrados
  - Cada um com coordenadas, perguntas e respostas
  - Singleton pattern

### 3. Factory
- **`QRCodeFactory`**: Cria e configura os use cases
  - Injeta dependências
  - Configura raio de proximidade (50 metros)

### 4. Presentation Layer (Camada de Apresentação)

#### Screens
- **`ScannerScreen`**: Tela de scanner de QR Code
  - Usa `expo-camera` para captura
  - Solicita permissões de câmera e localização
  - Obtém GPS atual do usuário
  - Valida QR Code e navega para pergunta

- **`QuestionScreen`**: Tela de pergunta
  - Exibe informações do local
  - Mostra pergunta com 4 opções
  - Valida resposta e localização
  - Fornece feedback detalhado

## Fluxo de Validação

```
1. Usuário abre Scanner Screen
   ↓
2. Sistema solicita permissões (câmera + GPS)
   ↓
3. Sistema obtém localização atual
   ↓
4. Usuário escaneia QR Code
   ↓
5. Sistema busca dados do QR Code no repositório
   ↓
6. Navega para Question Screen
   ↓
7. Usuário responde a pergunta
   ↓
8. ValidateQRCodeUseCase executa validações:
   - Localização dentro do raio?
   - Resposta correta?
   ↓
9. Sistema atualiza status e exibe resultado
```

## Dados Mock Disponíveis

### QR Code 1 - Biblioteca do CEFET-MG
- **Código**: `CHECKPOINT001`
- **Coordenadas**: `-19.9327, -43.9943`
- **Pergunta**: "Qual é o principal recurso disponível neste local?"
- **Resposta Correta**: "Livros e materiais de estudo"

### QR Code 2 - Laboratório de Informática
- **Código**: `CHECKPOINT002`
- **Coordenadas**: `-19.9325, -43.9940`
- **Pergunta**: "Quantos computadores estão disponíveis neste laboratório?"
- **Resposta Correta**: "30 computadores"

### QR Code 3 - Quadra de Esportes
- **Código**: `CHECKPOINT003`
- **Coordenadas**: `-19.9330, -43.9945`
- **Pergunta**: "Qual esporte NÃO pode ser praticado nesta quadra?"
- **Resposta Correta**: "Natação"

## Permissões Necessárias

O aplicativo solicita duas permissões essenciais:

1. **Câmera**: Para escanear QR Codes
2. **Localização**: Para validar proximidade ao ponto

Ambas são solicitadas automaticamente ao abrir o Scanner Screen.

## Configurações

### Raio de Proximidade
O raio padrão é de **50 metros**. Pode ser alterado no factory:

```typescript
// src/core/factories/QRCodeFactory.ts
const validateQRCodeUseCase = new ValidateQRCodeUseCase(qrCodeRepository, 100); // 100 metros
```

### Fórmula de Distância
Utiliza **Haversine** para cálculo preciso de distância entre coordenadas GPS.

## Validações Implementadas

### 1. Validação de Localização
- Calcula distância entre usuário e ponto de controle
- Verifica se está dentro do raio permitido
- Retorna distância em metros para feedback

### 2. Validação de Resposta
- Verifica se a resposta selecionada é a correta
- Apenas uma resposta correta por pergunta
- Feedback específico para erro

### 3. Validação de QR Code
- Verifica se o código existe no sistema
- Rejeita QR Codes desconhecidos

## Mensagens de Erro

- **Localização fora do raio**: "Você está muito longe do ponto de controle. Distância: Xm"
- **Resposta incorreta**: "Resposta incorreta. Tente novamente!"
- **QR Code inválido**: "Este QR Code não pertence a nenhum ponto de controle."
- **Sem localização**: "Não foi possível obter sua localização. Verifique as permissões."

## Mensagem de Sucesso

**"Ponto de controle validado com sucesso!"**

## Como Testar

1. Abra o aplicativo
2. Navegue para a tela Scanner
3. Conceda permissões de câmera e localização
4. Escaneie um dos QR Codes mock (ou use os códigos: CHECKPOINT001, CHECKPOINT002, CHECKPOINT003)
5. Responda a pergunta
6. Verifique o resultado

**Nota**: Para testes reais, você precisará estar fisicamente próximo às coordenadas configuradas OU ajustar as coordenadas mock para sua localização atual.

## Pacotes Utilizados

- `expo-camera`: Captura de QR Codes
- `expo-location`: Obtenção de coordenadas GPS
- `@react-navigation/native`: Navegação entre telas
- `@expo/vector-icons`: Ícones da interface

## Próximos Passos (Sugestões)

1. Implementar backend real para gerenciar QR Codes
2. Adicionar histórico de pontos validados
3. Sistema de pontuação/gamificação
4. Permitir múltiplas tentativas com penalidade
5. Adicionar timer para responder perguntas
6. Implementar ranking de usuários
7. Adicionar mapa com pontos de controle
8. Notificações quando próximo de um ponto
