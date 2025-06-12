# 🚨 CONFIGURAR REGRAS FIRESTORE - URGENTE

## ❌ PROBLEMA ATUAL
A validação está falhando porque o Firestore está bloqueando leitura/escrita.

## ✅ SOLUÇÃO IMEDIATA

### 1. Acesse o Firebase Console
🔗 **Link direto:** https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules

### 2. Substitua as regras atuais por estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // REGRAS TEMPORÁRIAS PARA TESTES - PERMITIR TUDO
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Clique em "PUBLICAR"

### 4. Aguarde alguns segundos

### 5. Execute a validação novamente

## 📋 CHECKLIST
- [ ] Acessei o Firebase Console
- [ ] Copiei e colei as regras acima
- [ ] Cliquei em "Publicar"
- [ ] Aguardei alguns segundos
- [ ] Executei a validação novamente

## 🔒 REGRAS DE PRODUÇÃO (APÓS TESTES)

Depois que tudo estiver funcionando, substitua por estas regras mais seguras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Configuração da rifa - leitura pública, escrita restrita
    match /rifa_config/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Compras - leitura e escrita públicas (necessário para o sistema)
    match /purchases/{document} {
      allow read, write: if true;
    }
    
    // Admins - apenas para usuários autenticados
    match /admin_users/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🆘 AJUDA
Se ainda não funcionar:
1. Verifique se está no projeto "rifa-cha-thomas"
2. Recarregue a página da validação
3. Aguarde 1-2 minutos após publicar as regras
4. Execute o teste novamente
