# Deploy Netlify com Firebase - Guia Completo

## 📋 Pré-requisitos
- [ ] Conta no Firebase com projeto criado
- [ ] Conta no Netlify
- [ ] Configurações do Firebase obtidas

## 🔧 Passo 1: Configurar Firebase

### 1.1 No Console do Firebase:
1. Acesse: https://console.firebase.google.com/
2. Selecione ou crie seu projeto "Rifa Chá Thomas"
3. Ative os serviços necessários:
   - **Authentication** (Email/Password + Anonymous)
   - **Firestore Database**
   - **Hosting** (opcional)

### 1.2 Obter Configurações:
1. Vá em **Configurações do Projeto** (⚙️)
2. Na aba **Geral**, role até "Seus aplicativos"
3. Clique no ícone da web `</>`
4. Registre o app com nome "Rifa Thomas Web"
5. Copie as configurações mostradas

### 1.3 Configurar Domínio Autorizado:
1. Em **Authentication** → **Settings** → **Authorized domains**
2. Adicione seus domínios:
   - `localhost` (para desenvolvimento)
   - `seu-site.netlify.app` (após o deploy)
   - Seu domínio customizado (se houver)

## 🚀 Passo 2: Deploy no Netlify

### 2.1 Preparar os Arquivos:
```bash
# Entre na pasta do projeto
cd /home/nicps/Documents/Projetos/RifaThomas

# Copie os arquivos para netlify-deploy (se necessário)
cp firebase-config.js netlify-deploy/
```

### 2.2 Fazer Upload no Netlify:

#### Opção A - Drag & Drop (Mais Simples):
1. Acesse: https://app.netlify.com/
2. Faça login ou crie uma conta
3. Arraste a pasta `netlify-deploy` para a área de deploy
4. Aguarde o deploy ser concluído

#### Opção B - Git Deploy (Recomendado):
1. Inicialize git no projeto (se não tiver):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Crie repositório no GitHub e faça push

3. No Netlify:
   - Clique em "New site from Git"
   - Conecte com GitHub
   - Selecione o repositório
   - Publish directory: `netlify-deploy`
   - Clique em "Deploy site"

### 2.3 Configurar Domínio e HTTPS:
1. No dashboard do Netlify, vá em **Domain settings**
2. Configure um nome customizado (opcional)
3. HTTPS é configurado automaticamente

## 🔐 Passo 3: Configurar Variáveis de Ambiente (Segurança Extra)

### 3.1 No Netlify Dashboard:
1. Vá em **Site settings** → **Environment variables**
2. Adicione as variáveis:
   - `FIREBASE_API_KEY`: sua API key
   - `FIREBASE_AUTH_DOMAIN`: seu auth domain
   - `FIREBASE_PROJECT_ID`: seu project ID
   - `FIREBASE_STORAGE_BUCKET`: seu storage bucket
   - `FIREBASE_MESSAGING_SENDER_ID`: seu sender ID
   - `FIREBASE_APP_ID`: seu app ID

### 3.2 Atualizar firebase-config.js para usar variáveis (opcional):
```javascript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "sua-api-key-aqui",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "seu-auth-domain",
  // ... etc
};
```

## 🔄 Passo 4: Testar a Aplicação

### 4.1 Verificações:
- [ ] Site carrega corretamente
- [ ] Não há erros no console do navegador
- [ ] Autenticação funciona
- [ ] Dados são salvos no Firestore

### 4.2 Resolver Problemas Comuns:

#### CORS/Domain Issues:
- Adicione o domínio do Netlify nas authorized domains do Firebase

#### 404 na navegação:
- O arquivo `_redirects` já está configurado corretamente

#### Erros de importação:
- Verifique se as URLs do CDN do Firebase estão corretas

## 📱 Passo 5: Configurações Adicionais

### 5.1 PWA (Progressive Web App):
- Adicione um `manifest.json`
- Configure service worker

### 5.2 Analytics:
- Ative Google Analytics no Firebase

### 5.3 Performance:
- Configure cache headers no Netlify

## 🆘 Comandos Úteis

```bash
# Testar localmente
cd netlify-deploy
python3 -m http.server 8000

# Deploy manual via Netlify CLI
npm install -g netlify-cli
netlify deploy --dir=netlify-deploy --prod
```

## 📞 Suporte

Se tiver problemas:
1. Verifique o console do navegador
2. Confira os logs do Netlify
3. Teste as configurações do Firebase
4. Verifique se todos os domínios estão autorizados

---

✅ **Resultado esperado**: Site funcionando em produção com dados persistindo no Firebase!
