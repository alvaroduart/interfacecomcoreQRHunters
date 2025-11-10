# Edge Function para Deletar Usuário no Supabase

Esta Edge Function permite deletar completamente um usuário do sistema, incluindo seus dados relacionados.

## 📋 Pré-requisitos

1. Ter o Supabase CLI instalado:
```bash
npm install -g supabase
```

2. Fazer login no Supabase:
```bash
supabase login
```

3. Linkar seu projeto:
```bash
supabase link --project-ref SEU_PROJECT_REF
```

## 🚀 Deploy da Edge Function

### Opção 1: Via Supabase CLI (RECOMENDADO)

1. **Navegue até a pasta do projeto:**
```bash
cd /Users/viniciusferreira/QrHuntersTests/interfacecomcoreQRHunters
```

2. **Faça o deploy da função:**
```bash
supabase functions deploy delete-user --project-ref SEU_PROJECT_REF
```

3. **A função estará disponível em:**
```
https://SEU_PROJECT_REF.supabase.co/functions/v1/delete-user
```

### Opção 2: Via Dashboard do Supabase

1. **Acesse o Dashboard do Supabase**
2. **Vá em "Edge Functions"** no menu lateral
3. **Clique em "Create a new function"**
4. **Nome:** `delete-user`
5. **Cole o código do arquivo** `supabase-edge-functions/delete-user/index.ts`
6. **Clique em "Deploy"**

## 🔐 Configurar Permissões

A Edge Function usa o `SUPABASE_SERVICE_ROLE_KEY` que já está configurado automaticamente pelo Supabase.

Certifique-se de que as seguintes variáveis de ambiente estão configuradas:
- `SUPABASE_URL` ✅ (automático)
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (automático)

## 🧪 Testar a Edge Function

Você pode testar manualmente usando `curl`:

```bash
curl -i --location --request POST 'https://SEU_PROJECT_REF.supabase.co/functions/v1/delete-user' \
  --header 'Authorization: Bearer SEU_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"USER_ID_AQUI"}'
```

## 📝 O que a função faz:

1. ✅ Deleta todas as **validações** do usuário (tabela `validations`)
2. ✅ Deleta o **avatar** do Storage (pasta `avatars/userId/`)
3. ✅ Deleta o **usuário** do Supabase Auth

## ⚙️ Como o App usa a função:

Quando o usuário clica em "Deletar Perfil" no app:

1. `ProfileScreen` → `handleDeleteAccount()`
2. `DeleteAccountUseCase` → `execute()`
3. `AuthRepositorySupabase` → `deleteAccount()`
4. Chama a Edge Function: `supabase.functions.invoke('delete-user', { body: { userId } })`
5. Edge Function deleta tudo
6. App faz logout

## 🔄 Método Alternativo (sem Edge Function)

Se você **não quiser** criar a Edge Function, o app já tem um fallback que:

1. Deleta as validações do usuário
2. Faz logout da sessão
3. Mantém o usuário no Auth (mas sem dados relacionados)

**Nota:** Para deletar completamente o usuário do Auth, a Edge Function é necessária.

## 🛠️ Troubleshooting

### Erro: "Function not found"
- Certifique-se de que fez o deploy da função
- Verifique o nome: deve ser exatamente `delete-user`

### Erro: "Unauthorized"
- Verifique se está autenticado no Supabase CLI
- Execute: `supabase login` novamente

### Erro: "Invalid API key"
- Confirme que seu projeto está linkado corretamente
- Execute: `supabase link --project-ref SEU_PROJECT_REF`

## 📚 Documentação Oficial

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
