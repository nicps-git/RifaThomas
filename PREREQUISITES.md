# 📋 Pré-requisitos para Firebase - Rifa Thomas

## ⚠️ Dependências Necessárias

### 1. Node.js (Obrigatório)

**Baixar e instalar:**
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (recomendada)
3. Execute o instalador
4. Reinicie o terminal/VS Code

**Verificar instalação:**
```powershell
node --version
npm --version
```

### 2. Firebase CLI (Após instalar Node.js)

**Instalar globalmente:**
```powershell
npm install -g firebase-tools
```

**Verificar instalação:**
```powershell
firebase --version
```

### 3. Login no Firebase

**Fazer login:**
```powershell
firebase login
```

## 🚀 Próximos Passos

Após instalar as dependências:

1. **Execute:** `firebase init` no diretório do projeto
2. **Selecione:** Firestore, Functions e Hosting
3. **Configure:** conforme o arquivo FIREBASE_SETUP.md
4. **Deploy:** `firebase deploy`

## 📁 Estrutura Atual

```
Rifa/
├── index.html          # Página principal
├── admin.html          # Painel administrativo  
├── login.html          # Sistema de login
├── firebase-config.js  # Configuração Firebase
├── script.js          # JavaScript principal
├── admin.js           # JavaScript admin
├── styles.css         # Estilos principais
├── admin.css          # Estilos admin
├── firebase.json      # Configuração deploy
├── firestore.rules    # Regras segurança
└── package.json       # Metadados projeto
```

## 🔗 Links Úteis

- **Firebase Console:** https://console.firebase.google.com/
- **Node.js:** https://nodejs.org/
- **Documentação Firebase:** https://firebase.google.com/docs
