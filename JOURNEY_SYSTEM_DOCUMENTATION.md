# Sistema de Jornadas - Implementação Completa

## ✅ Implementação Concluída

O sistema de jornadas foi implementado com sucesso! Agora os usuários podem:

1. **Visualizar jornadas disponíveis** na tela "Jornadas" (acessível pelo menu do perfil)
2. **Iniciar uma jornada** e ter ela marcada como ativa
3. **Escanear QR codes** que fazem parte da jornada
4. **Finalizar a jornada** quando tiver validado os pontos necessários
5. **Ver o progresso** de cada jornada (pontos completados, porcentagem, etc.)

---

## 📋 Passo a Passo para Uso

### 1. Configurar o Banco de Dados

Execute os comandos SQL do arquivo `SUPABASE_JOURNEYS_SETUP.md` no Supabase SQL Editor:

```sql
-- Cria as tabelas: journeys, journey_points, user_journeys
-- Com políticas RLS configuradas
```

**Tabelas criadas:**
- `journeys`: Jornadas disponíveis (nome, descrição)
- `journey_points`: QR codes que compõem cada jornada (ordem, descrição)
- `user_journeys`: Progresso do usuário em cada jornada

### 2. Cadastrar Jornadas

No Supabase, insira jornadas de exemplo:

```sql
-- Inserir uma jornada
INSERT INTO public.journeys (id, name, description) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Percurso UNIFEI', 'Explore os pontos históricos da UNIFEI');

-- Associar QR codes à jornada (use IDs reais dos seus QR codes)
INSERT INTO public.journey_points (journey_id, qrcode_id, order_index, description) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'ID_DO_SEU_QRCODE_1', 0, 'Primeiro ponto'),
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'ID_DO_SEU_QRCODE_2', 1, 'Segundo ponto'),
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'ID_DO_SEU_QRCODE_3', 2, 'Terceiro ponto');
```

### 3. Usar o App

1. **Abrir Jornadas**: Menu do Perfil → "Jornadas"
2. **Ver detalhes**: Toque em "Ver detalhes" para ver informações da jornada
3. **Iniciar**: Toque em "Iniciar" para começar a jornada
4. **Escanear**: Escaneie os QR codes que fazem parte da jornada
5. **Finalizar**: Na tela de Percurso, toque em "✓ Finalizar Percurso"

---

## 🏗️ Arquitetura Implementada

### Novos Arquivos Criados

1. **`src/context/JourneyContext.tsx`**
   - Contexto React para gerenciar a jornada ativa
   - Compartilha estado entre telas

2. **`src/core/infra/repositories/JourneyRepositorySupabase.ts`**
   - Repositório para comunicação com Supabase
   - Métodos: `getJourney`, `getAllJourneys`, `startJourney`, `completeJourneyPoint`, `finishJourney`

3. **`SUPABASE_JOURNEYS_SETUP.md`**
   - Documentação completa das tabelas
   - Scripts SQL para criação e configuração

### Arquivos Modificados

1. **`App.tsx`**
   - Adicionado `JourneyProvider` para disponibilizar contexto globalmente

2. **`src/core/factories/JourneyFactory.ts`**
   - Alterado de `JourneyRepositoryMock` para `JourneyRepositorySupabase`
   - Agora usa dados reais do Supabase

3. **`src/screens/RouteScreen.tsx`**
   - Importa `useJourney` e `makeJourneyUseCases`
   - Função `handleFinishRoute` atualizada para:
     * Verificar se há jornada ativa
     * Finalizar a jornada no banco
     * Mostrar mensagem de parabéns
     * Limpar jornada ativa do contexto

4. **`src/screens/JourneysScreen.tsx`**
   - **Novos recursos:**
     * Barra de progresso visual
     * Badge "Completada" para jornadas finalizadas
     * Botões "Iniciar"/"Continuar"
     * Dialog de detalhes com informações completas
     * Estados de loading e empty
   - **Funções:**
     * `handleStartJourney`: Inicia jornada e define como ativa
     * `handleViewDetails`: Mostra detalhes em um Alert

---

## 🔄 Fluxo de Dados

```
1. Usuário abre "Jornadas"
   ↓
2. JourneyRepositorySupabase.getAllJourneys()
   ↓
3. Busca no Supabase: journeys + journey_points + user_journeys
   ↓
4. Retorna lista de jornadas com progresso do usuário
   ↓
5. Usuário toca "Iniciar"
   ↓
6. JourneyRepositorySupabase.startJourney()
   ↓
7. Cria/Reseta registro em user_journeys
   ↓
8. Define jornada como ativa no JourneyContext
   ↓
9. Usuário escaneia QR codes
   ↓
10. Sistema valida QR code (validations table)
   ↓
11. JourneyRepositorySupabase.completeJourneyPoint()
   ↓
12. Incrementa current_point_index em user_journeys
   ↓
13. Usuário toca "Finalizar Percurso"
   ↓
14. JourneyRepositorySupabase.finishJourney()
   ↓
15. Marca is_completed = true, preenche completed_at
   ↓
16. Limpa jornada ativa do contexto
   ↓
17. Mostra mensagem de parabéns 🎉
```

---

## 📊 Estrutura do Banco de Dados

### Relacionamentos

```
journeys (1) ──< (N) journey_points >── (1) qrcodes
    │                                          │
    │                                          │
    └──< (N) user_journeys                    │
              │                                │
              └────> auth.users                │
                                               │
validations >────────────────────────────────┘
```

### Como funciona o progresso

- **`current_point_index`**: Índice do próximo ponto a ser visitado
- **`is_completed`**: `true` quando todos os pontos foram validados
- **`completed_at`**: Data/hora de conclusão da jornada

O progresso é calculado baseado nas validações (`status = 'acertou'`) dos QR codes que fazem parte da jornada.

---

## 🎨 Interface do Usuário

### Tela de Jornadas

- **Card de jornada:**
  - Ícone (🚶 para em andamento, ✅ para completada)
  - Nome da jornada
  - Descrição
  - Barra de progresso visual
  - "X de Y pontos • Z%"
  - Botão "Ver detalhes"
  - Botão "Iniciar" ou "Continuar" (não aparece se completada)

- **Dialog de detalhes:**
  - Descrição completa
  - Total de pontos
  - Pontos completados
  - Porcentagem de progresso
  - Próximo ponto (se em andamento)
  - Status de conclusão

### Tela de Percurso (Mapa)

- **Botão "✓ Finalizar Percurso":**
  - Aparece quando há pontos validados
  - Se há jornada ativa: finaliza a jornada
  - Se não há jornada: apenas navega para Progresso

---

## 🔧 Próximos Passos Recomendados

1. **Criar jornadas reais no Supabase**
   - Use os IDs dos seus QR codes existentes
   - Defina uma ordem lógica para os pontos

2. **Adicionar validação de ordem** (opcional)
   - Forçar usuário a visitar pontos na sequência
   - Implementar em `completeJourneyPoint`

3. **Sistema de recompensas** (opcional)
   - Dar pontos/badges ao completar jornadas
   - Criar tabela `journey_rewards`

4. **Histórico de jornadas** (opcional)
   - Mostrar todas as jornadas completadas
   - Data de conclusão, tempo levado, etc.

5. **Notificações** (opcional)
   - Avisar quando estiver perto de um ponto
   - Parabenizar ao completar jornada

---

## 📝 Notas Técnicas

### Clean Architecture

A implementação segue os princípios da Clean Architecture:

- **Domain**: Entidades (`Journey`, `JourneyPoint`), Use Cases, Interfaces de Repositório
- **Infra**: Implementação concreta (`JourneyRepositorySupabase`)
- **Presentation**: Telas React Native e Context API

### Gerenciamento de Estado

- **Context API**: Para jornada ativa (compartilhada entre telas)
- **Local State**: Para dados específicos de cada tela
- **Supabase**: Source of truth para dados persistentes

### Boas Práticas Implementadas

✅ Repository Pattern
✅ Dependency Injection via Factory
✅ Type Safety com TypeScript
✅ Error Handling com try/catch
✅ Loading States
✅ Empty States
✅ Console.log para debugging
✅ RLS (Row Level Security) no Supabase

---

## 🐛 Troubleshooting

### "Nenhuma jornada disponível"

1. Verifique se executou os scripts SQL
2. Confira se há registros na tabela `journeys`
3. Verifique as políticas RLS

### "Não foi possível carregar as jornadas"

1. Abra o console (logs)
2. Verifique se há erros de conexão
3. Confirme que o `supabaseClient` está configurado

### Progresso não atualiza

1. Verifique se os QR codes estão associados à jornada em `journey_points`
2. Confirme que as validações estão sendo criadas corretamente
3. Use `console.log` no `JourneyRepositorySupabase` para debug

---

## ✨ Funcionalidades Implementadas

- ✅ Listar todas as jornadas disponíveis
- ✅ Ver detalhes de cada jornada
- ✅ Iniciar uma jornada
- ✅ Continuar jornada em andamento
- ✅ Visualizar progresso (barra, porcentagem, pontos)
- ✅ Finalizar jornada quando completada
- ✅ Integração com sistema de validações existente
- ✅ Estados visuais (loading, empty, completed)
- ✅ Persistência no Supabase
- ✅ Context para jornada ativa
- ✅ Documentação completa

---

Implementação finalizada! 🎉
