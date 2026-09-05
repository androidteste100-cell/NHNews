# 📰 Portal de Notícias Moderno (Astro + Supabase + n8n + Vercel)

Portal de notícias responsivo, com SEO otimizado, suporte a anúncios Google AdSense, painel administrativo completo e API de Webhook para publicação automática com **n8n / Make / IA**.

---

## 🚀 Como Colocar no GitHub e Fazer Deploy na Vercel

### 1. Enviar para o GitHub

#### Opção A (Recomendada no AI Studio):
1. No menu superior direito do Google AI Studio, clique em **Export** (ou nos três pontinhos).
2. Selecione **Export to GitHub** (ou baixe como **ZIP** e descompacte no seu computador).
3. Caso use o GitHub diretamente, ele criará o repositório automaticamente na sua conta.

#### Opção B (Pelo Terminal / Linha de Comando):
```bash
git init
git add .
git commit -m "feat: portal de noticias com painel admin e webhook n8n"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/portal-noticias.git
git push -u origin main
```

---

### 2. Conectar e Publicar na Vercel

1. Acesse **[vercel.com](https://vercel.com)** e entre com a sua conta do GitHub.
2. Clique em **"Add New..."** ➔ **"Project"**.
3. Localize e selecione o repositório **`portal-noticias`** que você acabou de criar no GitHub.
4. A Vercel detectará automaticamente o framework **Astro**.
5. Antes de clicar em Deploy, abra a seção **"Environment Variables"** e adicione as seguintes variáveis:

| Nome da Variável | Descrição / Exemplo |
| :--- | :--- |
| `PUBLIC_SUPABASE_URL` | URL do seu projeto no Supabase (`https://xxxx.supabase.co`) |
| `PUBLIC_SUPABASE_ANON_KEY` | Chave pública `anon` do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta `service_role` do Supabase (para bypass de RLS no backend) |
| `ADMIN_PASSWORD` | Senha para acessar o painel `/admin` (ex: `sua_senha_segura`) |
| `WEBHOOK_API_KEY` | Token secreto para o n8n ou Make publicar notícias (ex: `seu_token_secreto_n8n_make`) |
| `PUBLIC_SITE_URL` | URL final do seu site gerada pela Vercel (ex: `https://meu-portal.vercel.app`) |

6. Clique no botão azul **"Deploy"**.
7. Pronto! Em cerca de 1 minuto, seu portal estará no ar com HTTPS, CDN global e atualizações automáticas a cada novo commit.

---

### 3. Automação no Piloto Automático (n8n & Make)

O projeto já possui um endpoint ativo pronto para receber notícias de robôs e automações:

- **Endpoint de Publicação:** `POST https://seu-site.vercel.app/api/v1/publish`
- **Header de Autenticação:** `x-api-key: seu_token_secreto_n8n_make`

#### Fluxo n8n Pronto:
O arquivo do workflow pronto está disponível em:
`/automation/n8n-workflow-portal-noticias.json`

Basta abrir o n8n, dar **Ctrl + V** para colar o fluxo pronto, configurar seu feed RSS e conectar sua IA (Gemini ou OpenAI) para publicar notícias 24 horas por dia!
