# 🚀 Deploy da Edge Function pelo Dashboard (SEM CLI)

Se você **NÃO quiser** instalar o Supabase CLI, pode fazer o deploy diretamente pelo Dashboard:

---

## 📝 Passo a Passo

### 1️⃣ Acesse o Dashboard do Supabase
- Entre em: https://supabase.com/dashboard
- Selecione seu projeto: **QrHunters**

### 2️⃣ Vá para Edge Functions
- No menu lateral esquerdo, clique em **"Edge Functions"**
- Clique no botão **"Create a new function"**

### 3️⃣ Configure a Função
- **Function name:** `delete-user` (exatamente assim)
- Clique em **"Create function"**

### 4️⃣ Cole o Código
No editor que aparece, **delete todo o código padrão** e cole este código:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com privilégios de service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Obter userId do body
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Deletando usuário:', userId)

    // 1. Deletar validações do usuário
    const { error: validationsError } = await supabaseAdmin
      .from('validations')
      .delete()
      .eq('user_id', userId)

    if (validationsError) {
      console.error('Erro ao deletar validações:', validationsError)
    } else {
      console.log('Validações deletadas com sucesso')
    }

    // 2. Deletar avatar do storage (se existir)
    try {
      const { data: avatarFiles } = await supabaseAdmin.storage
        .from('avatars')
        .list(userId)

      if (avatarFiles && avatarFiles.length > 0) {
        const filesToDelete = avatarFiles.map(file => `${userId}/${file.name}`)
        await supabaseAdmin.storage
          .from('avatars')
          .remove(filesToDelete)
        console.log('Avatars deletados com sucesso')
      }
    } catch (storageError) {
      console.error('Erro ao deletar avatars:', storageError)
    }

    // 3. Deletar usuário do Supabase Auth (requer service_role)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    )

    if (deleteUserError) {
      console.error('Erro ao deletar usuário:', deleteUserError)
      return new Response(
        JSON.stringify({ error: deleteUserError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Usuário deletado com sucesso')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário deletado com sucesso' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### 5️⃣ Deploy
- Clique no botão **"Deploy"** (canto superior direito)
- Aguarde a confirmação: ✅ "Function deployed successfully"

### 6️⃣ Verificar
- A função estará disponível em:
```
https://SEU_PROJECT_REF.supabase.co/functions/v1/delete-user
```

Para encontrar o **PROJECT_REF**:
- Vá em **Settings** → **General**
- Copie o **Reference ID**

---

## ✅ Pronto!

Agora quando o usuário clicar em "Deletar Perfil" no app:

1. ✅ Todas as **validações** serão deletadas
2. ✅ O **avatar** será removido do Storage
3. ✅ O **usuário** será removido do Supabase Auth
4. ✅ O app fará **logout** automaticamente

---

## 🧪 Testar

Para testar se funcionou:

1. Abra o app
2. Vá para a tela de **Perfil**
3. Clique em **"Deletar perfil"**
4. Confirme a ação
5. ✅ Você deve ser redirecionado para a tela de Login
6. ✅ Tente fazer login com a conta deletada → deve dar erro "Invalid credentials"

---

## 🔄 Alternativa SEM Edge Function

Se você **não quiser** criar a Edge Function, o app já está preparado com um **fallback**:

- Deleta as validações do usuário ✅
- Faz logout da sessão ✅
- **MAS:** Mantém o usuário no Auth (não deleta completamente)

Para deletar **completamente** o usuário do Auth, a Edge Function é **necessária**.

---

## 📞 Suporte

Se tiver algum problema, verifique:
1. O nome da função está correto: `delete-user`
2. O código foi colado completo (sem cortes)
3. O deploy foi concluído com sucesso
4. O bucket `avatars` existe no Storage

Logs da função podem ser vistos em:
**Edge Functions** → **delete-user** → **Logs**
