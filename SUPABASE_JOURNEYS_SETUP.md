# Configuração de Jornadas no Supabase

## 1. Criar Tabelas

Execute os seguintes comandos SQL no Supabase SQL Editor:

### Tabela `journeys` (Jornadas)

```sql
-- Tabela de jornadas
CREATE TABLE IF NOT EXISTS public.journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler jornadas
CREATE POLICY "Jornadas são públicas para leitura"
  ON public.journeys
  FOR SELECT
  USING (true);

-- Comentários
COMMENT ON TABLE public.journeys IS 'Jornadas disponíveis no aplicativo';
COMMENT ON COLUMN public.journeys.id IS 'Identificador único da jornada';
COMMENT ON COLUMN public.journeys.name IS 'Nome da jornada';
COMMENT ON COLUMN public.journeys.description IS 'Descrição da jornada';
```

### Tabela `journey_points` (Pontos das Jornadas)

```sql
-- Tabela de pontos das jornadas (relaciona QR codes com jornadas)
CREATE TABLE IF NOT EXISTS public.journey_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  qrcode_id UUID NOT NULL REFERENCES public.qrcodes(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(journey_id, qrcode_id),
  UNIQUE(journey_id, order_index)
);

-- Habilitar RLS
ALTER TABLE public.journey_points ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler pontos das jornadas
CREATE POLICY "Pontos de jornadas são públicos para leitura"
  ON public.journey_points
  FOR SELECT
  USING (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_journey_points_journey_id ON public.journey_points(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_points_qrcode_id ON public.journey_points(qrcode_id);

-- Comentários
COMMENT ON TABLE public.journey_points IS 'Pontos (QR codes) que compõem cada jornada';
COMMENT ON COLUMN public.journey_points.journey_id IS 'Referência à jornada';
COMMENT ON COLUMN public.journey_points.qrcode_id IS 'Referência ao QR code';
COMMENT ON COLUMN public.journey_points.order_index IS 'Ordem do ponto na jornada (0, 1, 2...)';
```

### Tabela `user_journeys` (Progresso do Usuário nas Jornadas)

```sql
-- Tabela de progresso do usuário nas jornadas
CREATE TABLE IF NOT EXISTS public.user_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  current_point_index INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, journey_id)
);

-- Habilitar RLS
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler apenas suas próprias jornadas
CREATE POLICY "Usuários veem apenas suas próprias jornadas"
  ON public.user_journeys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias jornadas
CREATE POLICY "Usuários podem iniciar jornadas"
  ON public.user_journeys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar apenas suas próprias jornadas
CREATE POLICY "Usuários podem atualizar suas jornadas"
  ON public.user_journeys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_journeys_user_id ON public.user_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_journey_id ON public.user_journeys(journey_id);

-- Comentários
COMMENT ON TABLE public.user_journeys IS 'Progresso dos usuários nas jornadas';
COMMENT ON COLUMN public.user_journeys.user_id IS 'Usuário que está fazendo a jornada';
COMMENT ON COLUMN public.user_journeys.journey_id IS 'Jornada sendo realizada';
COMMENT ON COLUMN public.user_journeys.current_point_index IS 'Índice do próximo ponto a ser visitado';
COMMENT ON COLUMN public.user_journeys.is_completed IS 'Se a jornada foi completada';
COMMENT ON COLUMN public.user_journeys.started_at IS 'Quando o usuário iniciou a jornada';
COMMENT ON COLUMN public.user_journeys.completed_at IS 'Quando o usuário completou a jornada';
```

## 2. Inserir Dados de Exemplo

### Passo 1: Excluir Jornada Antiga e Criar Novas

```sql
-- Excluir a jornada "Centro Histórico de Itajubá" (se existir)
DELETE FROM public.journeys 
WHERE name = 'Centro Histórico de Itajubá';

-- Inserir a jornada do CEFET-MG (com todos os QR codes)
INSERT INTO public.journeys (id, name, description) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Jornada CEFET-MG', 'Explore todos os pontos históricos e importantes do CEFET-MG em Itajubá')
ON CONFLICT (id) DO NOTHING;

-- Inserir uma jornada vazia (sem QR codes)
INSERT INTO public.journeys (id, name, description) VALUES
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Jornada Teste', 'Jornada de teste sem QR codes associados')
ON CONFLICT (id) DO NOTHING;
```

### Passo 2: Associar TODOS os QR Codes à Jornada

Execute este comando para buscar todos os QR codes existentes e ver seus IDs:

```sql
-- Listar todos os QR codes existentes
SELECT id, code, location_name, description 
FROM public.qrcodes 
ORDER BY location_name;
```

Depois, execute este script para associar automaticamente TODOS os QR codes à jornada do CEFET:

```sql
-- Associar todos os QR codes existentes à jornada do CEFET
-- O order_index será baseado na ordem alfabética dos locais
INSERT INTO public.journey_points (journey_id, qrcode_id, order_index, description)
SELECT 
  'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d' as journey_id,
  id as qrcode_id,
  ROW_NUMBER() OVER (ORDER BY location_name) - 1 as order_index,
  COALESCE(description, 'Ponto da jornada CEFET-MG') as description
FROM public.qrcodes
ON CONFLICT (journey_id, qrcode_id) DO NOTHING;
```

**Nota**: Este script automaticamente:
- Pega todos os QR codes da tabela `qrcodes`
- Associa eles à jornada do CEFET
- Define a ordem baseada no nome da localização (alfabética)
- Se o QR code não tiver descrição, usa uma padrão

## 3. Verificar Estrutura

```sql
-- Verificar a jornada criada
SELECT * FROM public.journeys;

-- Verificar quantos pontos foram associados à jornada
SELECT COUNT(*) as total_pontos 
FROM public.journey_points 
WHERE journey_id = 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d';

-- Ver todos os pontos da jornada do CEFET em ordem
SELECT 
  jp.order_index,
  qr.location_name as local,
  qr.code as codigo_qr,
  jp.description
FROM public.journey_points jp
JOIN public.qrcodes qr ON jp.qrcode_id = qr.id
WHERE jp.journey_id = 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d'
ORDER BY jp.order_index;

-- Verificar progresso dos usuários (se houver)
SELECT 
  uj.current_point_index,
  uj.is_completed,
  uj.started_at,
  uj.completed_at,
  j.name as journey_name
FROM public.user_journeys uj
JOIN public.journeys j ON uj.journey_id = j.id
WHERE j.id = 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d';
```

## 4. Relacionamento com Validações

As validações (tabela `validations`) já existentes serão usadas para marcar o progresso nas jornadas:
- Quando um usuário escaneia um QR code que faz parte de uma jornada ativa, o `current_point_index` é incrementado
- Quando todos os pontos são validados, `is_completed` é marcado como `true` e `completed_at` é preenchido

## 5. Estrutura Conceitual

```
journeys (jornadas disponíveis)
  ├─ journey_points (QR codes que compõem a jornada)
  │    └─ qrcodes (dados do QR code: localização, pergunta, etc)
  └─ user_journeys (progresso do usuário)
       └─ validations (validações individuais de QR codes)
```
