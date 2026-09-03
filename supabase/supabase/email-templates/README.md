# 📧 Templates de E-mail para Envio de Tokens no Supabase

Estes templates foram criados com design Dark Mode Neon exclusivo do **DevSystem**, compatíveis com todos os clientes de e-mail (Gmail, Outlook, Apple Mail, Webmail).

---

## 🛠️ Como Aplicar no Painel do Supabase

1. Acesse o seu projeto no [Supabase Console](https://supabase.com/dashboard).
2. No menu lateral esquerdo, vá em **Authentication** > **Email Templates**.
3. Escolha o template correspondente e substitua o código pelo conteúdo dos arquivos desta pasta:

| Tipo de E-mail | Arquivo de Origem | Variáveis Usadas |
| :--- | :--- | :--- |
| **Confirm signup** (Confirmação de Conta) | `confirm_signup.html` | `{{ .Token }}` e `{{ .ConfirmationURL }}` |
| **Reset Password** (Redefinição de Senha) | `reset_password.html` | `{{ .Token }}` e `{{ .ConfirmationURL }}` |
| **Magic Link** (Login sem Senha) | `magic_link.html` | `{{ .Token }}` e `{{ .ConfirmationURL }}` |

4. No campo **Subject** (Assunto), você pode usar títulos personalizados, por exemplo:
   - Para confirmação: `🔑 Seu código de confirmação — DevSystem`
   - Para redefinição: `🔒 Redefina sua senha — DevSystem`
   - Para magic link: `⚡ Seu link de acesso rápido — DevSystem`
5. Clique em **Save changes**.

---

## 💡 Dica: Habilitar Envio de OTP (Código de 6 dígitos)

Se você preferir que o usuário digite o código numérico em vez de clicar no link:
- Vá em **Authentication** > **Providers** > **Email**.
- Certifique-se de que a opção **"Confirm email"** e **"Secure email change"** estão ativadas.
