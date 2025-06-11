# 🚀 Setup do Firebase para Rifa Thomas - Banco de Dados de Produção

## 📋 Pré-requisitos
- Conta Google
- Navegador web atualizado

## 🔧 Passo a Passo para Configuração

### 1. Criar Projeto no Firebase

1. **Acesse:** https://console.firebase.google.com/
2. **Clique em:** "Criar um projeto"
3. **Nome do projeto:** `rifa-cha-thomas`
4. **Desabilite** Google Analytics (não é necessário)
5. **Clique em:** "Criar projeto"

### 2. Configurar Authentication (Autenticação)

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Vá na aba **"Sign-in method"**
4. **Habilite os seguintes métodos:**
   - ✅ **Email/senha** (para administradores)
   - ✅ **Anônimo** (para visitantes)

### 3. Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. **Escolha:** "Iniciar no modo de teste" (por enquanto)
4. **Localização:** South America (se disponível) ou US-Central
5. Clique em **"Concluído"**

### 4. Configurar Regras de Segurança

Na aba **"Regras"** do Firestore, substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura de compras para todos (visualização pública dos números vendidos)
    match /purchases/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Apenas admins podem acessar dados de admin
    match /admins/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Configurações podem ser lidas por todos, escritas apenas por admins
    match /config/{document} {
      allow read: if true;
      allow write: if exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Resultados do sorteio podem ser lidos por todos
    match /draw/{document} {
      allow read: if true;
      allow write: if exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Reservas temporárias
    match /reservations/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Obter Configurações do Projeto

1. Clique no ícone de **engrenagem** (Configurações do projeto)
2. Vá em **"Seus aplicativos"**
3. Clique em **"Web"** (ícone `</>`)
4. **Nome do app:** `Rifa Thomas Web`
5. **NÃO** marque "Configurar o Firebase Hosting"
6. Clique em **"Registrar app"**
7. **COPIE** as configurações mostradas

### 6. Configurar o Arquivo firebase-config.js

1. Abra o arquivo `firebase-config.js`
2. Substitua a seção de configurações:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "rifa-cha-thomas.firebaseapp.com", 
  projectId: "rifa-cha-thomas",
  storageBucket: "rifa-cha-thomas.appspot.com",
  messagingSenderId: "123456789",
  appId: "SUA_APP_ID_AQUI"
};
```

**COLE** as suas configurações reais obtidas no passo anterior.

### 7. Estrutura de Dados no Firestore

O sistema criará automaticamente as seguintes coleções:

#### 📦 **Collection: purchases**
```javascript
{
  id: "purchase_1234567890_abc123",
  name: "João Silva",
  phone: "(11) 99999-9999",
  numbers: [1, 5, 10],
  totalAmount: 120.00,
  paymentMethod: "doacao", // ou "pix"
  status: "pending_donation", // "confirmed", "rejected"
  createdAt: "2025-06-11T10:30:00.000Z",
  updatedAt: "2025-06-11T10:30:00.000Z"
}
```

#### 👤 **Collection: admins**
```javascript
{
  userId: "admin123",
  email: "admin@email.com",
  role: "admin",
  createdAt: "2025-06-11T10:30:00.000Z"
}
```

#### ⚙️ **Collection: config**
```javascript
{
  totalNumbers: 150,
  ticketPrice: 40.00,
  pixKey: "contato@charifa.com",
  prizes: {...},
  updatedAt: "2025-06-11T10:30:00.000Z"
}
```

## 🎯 Funcionalidades Implementadas

### ✅ **Para Visitantes:**
- ✅ Visualização dos números disponíveis/vendidos em tempo real
- ✅ Seleção e reserva de números
- ✅ Formulário de compra (PIX ou doação)
- ✅ Sincronização automática

### ✅ **Para Administradores:**
- ✅ Login seguro com email/senha
- ✅ Painel em tempo real com estatísticas
- ✅ Confirmação/rejeição de doações
- ✅ Gerenciamento de participantes
- ✅ Relatórios e exportação
- ✅ Configurações da rifa

### 🔄 **Sincronização em Tempo Real:**
- ✅ Números vendidos atualizam instantaneamente
- ✅ Múltiplos administradores podem trabalhar juntos
- ✅ Estatísticas sempre atualizadas
- ✅ Backup automático na nuvem

## 🔐 Segurança

- ✅ **Autenticação** Firebase Authentication
- ✅ **Autorização** baseada em roles (admin/user)
- ✅ **Regras de segurança** no Firestore
- ✅ **Dados criptografados** em trânsito e repouso
- ✅ **Backup automático** do Google

## 💰 Custos

O Firebase tem um **plano gratuito generoso:**

- ✅ **Firestore:** 50.000 leituras/dia - 20.000 escritas/dia
- ✅ **Authentication:** Usuários ilimitados
- ✅ **Hosting:** 125MB storage + 10GB transfer/mês

Para uma rifa de 150 números, os limites gratuitos são **mais que suficientes**.

## 🚀 Como Usar Após Configurar

### **Primeiro Acesso:**
1. Acesse: `login.html`
2. Clique em **"Criar Conta Admin"**
3. Use seu email e uma senha forte
4. Faça login no painel administrativo

### **Uso Diário:**
1. Participantes acessam `index.html`
2. Escolhem números e fazem pedidos
3. Admin confirma doações pelo painel
4. Tudo sincroniza automaticamente!

## 🔧 Troubleshooting

### **Erro: "Firebase não carregou"**
- Verifique se `firebase-config.js` está sendo carregado antes dos outros scripts
- Confirme se as configurações do Firebase estão corretas

### **Erro: "Permissão negada"**
- Verifique se as regras do Firestore estão configuradas corretamente
- Confirme se o usuário tem role de admin

### **Números não atualizam em tempo real**
- Verifique a conexão com internet
- Recarregue a página
- Confirme se não há erros no console do navegador

## 📞 Suporte

Se precisar de ajuda:
1. ✅ Verifique os logs no console do navegador (F12)
2. ✅ Consulte a documentação do Firebase
3. ✅ Entre em contato com o desenvolvedor

---

**🎉 Seu sistema de rifa agora está pronto para produção com banco de dados profissional!**
