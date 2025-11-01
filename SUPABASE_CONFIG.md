# Configuração do Supabase - Desabilitar Confirmação de Email

Para permitir que usuários façam login imediatamente após o registro, sem precisar confirmar o email, siga os passos abaixo:

## Passos no Supabase Dashboard:

1. **Acesse seu projeto no Supabase Dashboard**
   - URL: https://supabase.com/dashboard

2. **Navegue até Authentication → Settings**
   - No menu lateral: `Authentication` → `Settings`

3. **Desabilite a confirmação de email**
   - Encontre a seção **"Email Confirmation"** ou **"Enable email confirmations"**
   - **Desative** a opção "Enable email confirmations"
   - Ou configure: `DISABLE_EMAIL_CONFIRMATION = true`

4. **Salve as alterações**
   - Clique em "Save" no final da página

## Configuração via SQL (Alternativa):

Se preferir fazer via SQL, execute no SQL Editor do Supabase:

```sql
-- Desabilitar confirmação de email para novos usuários
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Verificar configuração atual
SELECT * FROM auth.config;
```

## Verificação:

Após fazer essas alterações:

1. Registre um novo usuário pelo app
2. O usuário deve conseguir fazer login **imediatamente**
3. No Supabase Dashboard → Authentication → Users, o usuário aparecerá com:
   - ✅ Email confirmado automaticamente
   - ✅ `email_confirmed_at` preenchido
   - ✅ Status ativo

## Configuração Adicional (Opcional):

### Para ambiente de desenvolvimento, você pode também:

**1. Desabilitar rate limiting:**
   - Settings → Rate Limits
   - Aumente ou desabilite temporariamente

**2. Configurar redirecionamento:**
   - URL Configuration → Site URL: `exp://localhost:8081`
   - Redirect URLs: adicione suas URLs do Expo

## Observações Importantes:

⚠️ **Produção:** Em produção, considere manter a confirmação de email ativada para segurança.

🔐 **Segurança:** Sem confirmação de email, qualquer um pode registrar com qualquer email. 

💡 **Recomendação:** Use confirmação de email em produção e desabilite apenas em desenvolvimento/testes.

## Política de Senha do Supabase:

Por padrão, o Supabase exige senhas fortes com:
- ✅ Mínimo de 8 caracteres
- ✅ Uma letra maiúscula
- ✅ Uma letra minúscula
- ✅ Um número
- ✅ Um caractere especial (!@#$%^&* etc.)

**Para relaxar a política de senha em desenvolvimento:**

1. Acesse: **Authentication** → **Settings** → **Password Policy**
2. Configure: **Password Strength** para "Weak" ou "Medium"
3. Ou desabilite: **Enforce password strength**

⚠️ **Importante:** Se você já registrou um usuário com senha fraca, precisará:
- Deletar o usuário no Dashboard (Authentication → Users)
- Registrar novamente com uma senha forte
- Exemplo de senha válida: `Senha123!` ou `Admin@2024`

## Código já ajustado:

O código em `AuthRepositorySupabase.ts` já está configurado com:
```typescript
options: {
  emailRedirectTo: undefined, // Não redirecionar para confirmação
}
```

Isso garante que o app não tenta redirecionar o usuário para confirmação de email.
