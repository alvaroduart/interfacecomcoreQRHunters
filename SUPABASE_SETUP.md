# 🚀 Guia de Integração com Supabase - QR Hunters

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Configuração do Projeto](#configuração-do-projeto)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Como Usar](#como-usar)
6. [API Reference](#api-reference)

---

## 🎯 Pré-requisitos

- Conta no Supabase (gratuita): https://supabase.com
- Node.js 20.17.0 ou superior
- Projeto Expo configurado

---

## 🔧 Configuração do Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: `qr-hunters`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha o mais próximo (ex: South America - São Paulo)
4. Aguarde a criação do projeto (~2 minutos)

### Passo 2: Executar o Schema SQL

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Copie todo o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor SQL
5. Clique em **"Run"** (ou pressione Ctrl/Cmd + Enter)
6. Aguarde a execução completar ✅

### Passo 3: Obter Credenciais

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie os seguintes valores:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon public** key (uma chave longa começando com `eyJ...`)

---

## ⚙️ Configuração do Projeto

### Passo 1: Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto (copie do `.env.example`):

```bash
cp .env.example .env
```

### Passo 2: Configurar variáveis de ambiente

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Repository Configuration (mock | supabase)
EXPO_PUBLIC_REPOSITORY_TYPE=supabase
```

### Passo 3: Alternar entre Mock e Supabase

Edite o arquivo `src/core/config/index.ts`:

```typescript
export const config = {
  // Altere para 'supabase' para usar o backend real
  repository: 'supabase' as 'mock' | 'supabase',
  // ...
};
```

### Passo 4: Reiniciar o servidor

```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm start
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### 1. **questions** (Perguntas)
```sql
- id: UUID (PK)
- text: TEXT (texto da pergunta)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. **answers** (Respostas)
```sql
- id: UUID (PK)
- question_id: UUID (FK → questions)
- text: TEXT (texto da resposta)
- is_correct: BOOLEAN (apenas 1 true por pergunta)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 3. **qrcodes** (Pontos de Controle)
```sql
- id: UUID (PK)
- code: TEXT (UNIQUE) (ex: "CHECKPOINT001")
- location_name: TEXT (nome do local)
- latitude: DECIMAL(10, 8) (coordenada GPS)
- longitude: DECIMAL(11, 8) (coordenada GPS)
- description: TEXT (descrição opcional)
- question_id: UUID (FK → questions)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4. **validations** (Histórico)
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- qrcode_id: UUID (FK → qrcodes)
- answer_id: UUID (FK → answers)
- user_latitude: DECIMAL(10, 8)
- user_longitude: DECIMAL(11, 8)
- distance_meters: DECIMAL(10, 2)
- status: TEXT ('acertou' | 'errou')
- created_at: TIMESTAMP
```

### Relacionamentos

```
questions (1) ----< (N) answers
    |
    |
    v
qrcodes (1)
    |
    v
validations (N) >---- (1) auth.users
```

### Views Úteis

- **qrcodes_complete**: QR Codes com perguntas e respostas em JSON
- **user_validation_stats**: Estatísticas de cada usuário (taxa de acerto, etc)

---

## 🎮 Como Usar

### 1. Modo Mock (Desenvolvimento/Testes)

```typescript
// src/core/config/index.ts
export const config = {
  repository: 'mock',
  // ...
};
```

✅ **Vantagens**:
- Funciona offline
- Dados de exemplo pré-carregados
- Ideal para desenvolvimento

### 2. Modo Supabase (Produção)

```typescript
// src/core/config/index.ts
export const config = {
  repository: 'supabase',
  // ...
};
```

✅ **Vantagens**:
- Dados persistentes
- Histórico de validações
- Estatísticas em tempo real
- Multiusuário

---

## 📡 API Reference

### QRCodeRepositorySupabase

#### `getQRCodeByCode(code: string)`
Busca QR Code pelo código escaneado.

```typescript
const qrCode = await repository.getQRCodeByCode('CHECKPOINT001');
```

#### `getQRCodeDetails(id: string)`
Busca QR Code pelo ID.

```typescript
const qrCode = await repository.getQRCodeDetails('uuid-aqui');
```

#### `saveValidation(...)`
Salva tentativa de validação no histórico.

```typescript
await repository.saveValidation(
  userId,
  qrCodeId,
  answerId,
  userLat,
  userLng,
  distance,
  'acertou'
);
```

#### `getUserValidations(userId: string)`
Retorna histórico de validações do usuário.

```typescript
const history = await repository.getUserValidations(userId);
```

---

## 🔒 Segurança (Row Level Security)

O schema SQL já configura políticas de segurança:

- ✅ **Leitura pública**: Qualquer usuário pode ler QR Codes, perguntas e respostas
- 🔐 **Validações privadas**: Usuários só podem ver/criar suas próprias validações
- 🚫 **Proteção de dados**: Usuários não conseguem ver validações de outros

---

## 📊 Consultas Úteis no Supabase

### Ver todos os QR Codes com perguntas
```sql
SELECT * FROM qrcodes_complete;
```

### Estatísticas de um usuário específico
```sql
SELECT * FROM user_validation_stats 
WHERE user_id = 'uuid-do-usuario';
```

### Top 10 usuários com melhor taxa de acerto
```sql
SELECT * FROM user_validation_stats 
ORDER BY success_rate DESC 
LIMIT 10;
```

### Últimas 20 validações
```sql
SELECT 
  v.*,
  qr.location_name,
  qr.code
FROM validations v
JOIN qrcodes qr ON v.qrcode_id = qr.id
ORDER BY v.created_at DESC
LIMIT 20;
```

---

## 🆕 Adicionando Novos QR Codes

### Via SQL Editor

```sql
-- 1. Criar a pergunta
INSERT INTO questions (text) 
VALUES ('Sua pergunta aqui')
RETURNING id; -- Copie o UUID retornado

-- 2. Adicionar respostas (4 obrigatórias)
INSERT INTO answers (question_id, text, is_correct) VALUES
('uuid-da-pergunta', 'Resposta 1', false),
('uuid-da-pergunta', 'Resposta 2', true),  -- Apenas 1 true
('uuid-da-pergunta', 'Resposta 3', false),
('uuid-da-pergunta', 'Resposta 4', false);

-- 3. Criar QR Code
INSERT INTO qrcodes (code, location_name, latitude, longitude, description, question_id)
VALUES (
  'CHECKPOINT004',
  'Nome do Local',
  -19.9330,
  -43.9945,
  'Descrição opcional',
  'uuid-da-pergunta'
);
```

### Via Interface do Supabase (Table Editor)

1. Acesse **Table Editor**
2. Clique na tabela desejada
3. Clique em **Insert** > **Insert row**
4. Preencha os campos
5. Salve

---

## 🐛 Troubleshooting

### Erro: "QR Code não encontrado"
- ✅ Verifique se o código existe na tabela `qrcodes`
- ✅ Confirme que o valor em `code` é exatamente igual ao escaneado

### Erro de conexão com Supabase
- ✅ Verifique as credenciais no `.env`
- ✅ Confirme que o projeto Supabase está ativo
- ✅ Teste a URL no navegador (deve retornar JSON)

### Validação não salva
- ✅ Verifique se o usuário está autenticado
- ✅ Confirme as políticas RLS no Supabase
- ✅ Veja os logs no console do app

### Dados não aparecem
- ✅ Execute o SQL de seed novamente
- ✅ Verifique as policies RLS (SQL Editor > Políticas)
- ✅ Teste com `SELECT * FROM qrcodes` no SQL Editor

---

## 📈 Monitoramento

### Dashboard do Supabase

- **Database**: Ver tabelas e dados em tempo real
- **Auth**: Gerenciar usuários
- **Storage**: (se adicionar imagens de QR Codes)
- **Logs**: Debugar queries e erros

### Métricas Importantes

- Total de validações por dia
- Taxa de acerto geral
- QR Codes mais escaneados
- Usuários mais ativos

---

## 🎁 Recursos Adicionais

### Gerar QR Codes

Use estes sites para gerar QR Codes com os códigos:

- https://www.qr-code-generator.com/
- https://qrcode.tec-it.com/
- https://www.qrcode-monkey.com/

**Conteúdo do QR Code**: `CHECKPOINT001`, `CHECKPOINT002`, etc.

### Imprimir QR Codes

1. Gere o QR Code com o código desejado
2. Baixe em alta resolução (PNG, 300dpi mínimo)
3. Imprima em papel A4
4. Cole no local físico correspondente

---

## 🚀 Próximos Passos

- [ ] Adicionar mais QR Codes aos seus locais
- [ ] Personalizar perguntas para seu contexto
- [ ] Implementar ranking de usuários
- [ ] Adicionar notificações push
- [ ] Criar painel administrativo

---

## 📞 Suporte

- **Documentação Supabase**: https://supabase.com/docs
- **Documentação Expo**: https://docs.expo.dev
- **Issues do Projeto**: Use o GitHub do projeto

---

**Desenvolvido com ❤️ usando Clean Architecture**
