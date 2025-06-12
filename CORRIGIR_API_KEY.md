# 🔑 Como Obter a Configuração Correta do Firebase

## 🚨 PROBLEMA IDENTIFICADO
**Erro:** `auth/api-key-not-valid` 
**Causa:** A API Key no arquivo `firebase-config.js` está incorreta ou desatualizada.

## 📋 Passo a Passo para Corrigir

### 1. Acesse o Console Firebase
🔗 **Link direto:** https://console.firebase.google.com/project/raffle-thomas/settings/general/web

### 2. Localize Sua Aplicação Web
- Clique na aba **"General"** (Geral)
- Role até **"Your apps"** (Seus aplicativos)
- Encontre o ícone **`</>`** (Web app)

### 3. Copie a Configuração
Clique em **"Config"** e copie o código que aparece similar a este:
```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "raffle-thomas.firebaseapp.com",
  projectId: "raffle-thomas",
  storageBucket: "raffle-thomas.firebasestorage.app",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

### 4. Aplicar a Configuração Correta

#### Opção 1: Me envie a configuração
Cole aqui a configuração que você copiou do Console e eu atualizarei todos os arquivos.

#### Opção 2: Substituir manualmente
Substitua a configuração nos seguintes arquivos:
- `netlify-deploy/firebase-config.js`
- `netlify-deploy/teste-cdn.html`
- `netlify-deploy/diagnostico-firebase.html`

## 🔍 Verificações Adicionais

### Se não encontrar a aplicação web:
1. Acesse: https://console.firebase.google.com/project/raffle-thomas/settings/general
2. Role até o final da página
3. Clique em **"Add app"** → **"Web"** (`</>`)
4. Digite um nome (ex: "Rifa Thomas Web")
5. **NÃO marque** "Also set up Firebase Hosting"
6. Clique **"Register app"**
7. Copie a configuração mostrada

### Se o projeto não existir:
1. O projeto pode ter sido excluído
2. Você pode estar logado com conta diferente
3. Precisaremos criar um novo projeto

## 🛠️ Configuração Atual vs Necessária

### ❌ Configuração Atual (INCORRETA):
```javascript
apiKey: "AIzaSyDtB1YfeOLWm6_xH1pI8mXJzO-IxIC4vHc"
authDomain: "rifa-cha-thomas.firebaseapp.com"
projectId: "rifa-cha-thomas"
```

### ✅ Configuração Necessária:
```javascript
apiKey: "AIzaSyDrTY8pnDXwDPnWkTGYVxpKTxXy8p8zAmo"
authDomain: "raffle-thomas.firebaseapp.com" 
projectId: "raffle-thomas"
```

## 🎯 Próximo Passo
**Cole aqui a configuração correta** do Console Firebase e eu atualizarei todos os arquivos automaticamente!
