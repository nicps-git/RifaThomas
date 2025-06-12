# 🔥 Como Criar e Configurar Banco Firebase para Rifa Thomas

## 📋 Visão Geral

Sim, você PRECISA criar um banco de dados no Firebase! Sua aplicação usa **Firestore Database** para persistir:

- ✅ Compras de rifas
- ✅ Números vendidos
- ✅ Dados de administradores
- ✅ Configurações da rifa
- ✅ Resultados do sorteio
- ✅ Reservas temporárias

## 🚀 Processo de Criação do Banco

### **Passo 1: Acessar Firebase Console**
1. Acesse: https://console.firebase.google.com/
2. Faça login com sua conta Google
3. Selecione ou crie o projeto "rifa-cha-thomas"

### **Passo 2: Ativar Firestore Database**
1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha o modo:
   - **Produção**: Mais seguro (recomendado)
   - **Teste**: Menos restritivo (temporário)
4. Selecione a localização (ex: us-central1, southamerica-east1)

### **Passo 3: Configurar Regras de Segurança**
O Firestore já vai criar regras básicas, mas você precisa aplicar as regras personalizadas.

### **Passo 4: Ativar Authentication**
1. No menu lateral, clique em **"Authentication"**
2. Vá na aba **"Sign-in method"**
3. Ative os provedores:
   - **Email/Password** (para admins)
   - **Anonymous** (para usuários normais)

## 🔧 Estrutura do Banco que será Criada

Sua aplicação criará automaticamente estas coleções:

```
firestore-database/
├── purchases/          # Compras realizadas
│   ├── purchase_123/
│   │   ├── id: "purchase_123"
│   │   ├── name: "João Silva"
│   │   ├── email: "joao@email.com"
│   │   ├── phone: "11999999999"
│   │   ├── numbers: [1, 15, 33]
│   │   ├── totalPrice: 30.00
│   │   ├── status: "pending"
│   │   └── createdAt: "2025-06-11T..."
│   └── ...
│
├── admins/             # Administradores
│   ├── user_uid_123/
│   │   ├── email: "admin@rifa.com"
│   │   ├── role: "admin"
│   │   └── createdAt: "2025-06-11T..."
│   └── ...
│
├── config/             # Configurações
│   └── rifa/
│       ├── title: "Rifa Chá Thomas"
│       ├── description: "..."
│       ├── ticketPrice: 10.00
│       ├── maxNumbers: 100
│       ├── drawDate: "2025-07-01"
│       └── ...
│
├── reservations/       # Reservas temporárias
│   ├── reserve_456/
│   │   ├── numbers: [5, 23]
│   │   ├── userToken: "token_abc"
│   │   ├── expiresAt: "2025-06-11T..."
│   │   └── createdAt: "2025-06-11T..."
│   └── ...
│
└── draw/              # Resultados do sorteio
    └── results/
        ├── winners: [...]
        ├── drawDate: "2025-07-01T..."
        └── createdAt: "2025-07-01T..."
```

## 🔐 Regras de Segurança Importantes

As regras que você já tem no arquivo `firestore.rules` são:

- **Compras**: Todos podem ler, apenas usuários autenticados podem escrever
- **Admins**: Apenas o próprio admin pode acessar seus dados
- **Config**: Todos podem ler, apenas admins podem modificar
- **Sorteio**: Todos podem ler resultados, apenas admins podem criar

## ⚡ Próximos Passos

1. **Criar o banco** (siga o processo acima)
2. **Aplicar regras de segurança** (usar arquivo firestore.rules)
3. **Configurar as chaves** (executar configure-firebase.sh)
4. **Fazer deploy** (executar deploy-final.sh)

## 💡 Observações Importantes

- **Gratuito**: Firebase tem um plano gratuito generoso
- **Automático**: As coleções são criadas automaticamente quando a app roda
- **Tempo Real**: Os dados são sincronizados em tempo real
- **Escalável**: Suporta milhares de usuários simultâneos

## 🆘 Se der Erro

- Verifique se o Firestore está ativado
- Confirme se as regras estão aplicadas
- Teste se a autenticação está funcionando
- Verifique os domínios autorizados

---

**✅ Depois de criar o banco, execute: `./configure-firebase.sh`**
