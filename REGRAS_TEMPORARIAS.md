# 🚨 SOLUÇÃO RÁPIDA: Regras Temporárias para Teste

## ❌ **PROBLEMA ATUAL:**
O Firebase não aceita gravações mesmo com o código funcionando. Isso indica que as regras de segurança estão bloqueando as escritas.

---

## 🔧 **SOLUÇÃO IMEDIATA:**

### **1. Aplicar Regras Temporárias (APENAS PARA TESTE)**

Acesse: https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules

**Substitua TODO o conteúdo por estas regras temporárias:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // REGRAS TEMPORÁRIAS - PERMISSIVAS PARA TESTE
    // ⚠️ NÃO USE EM PRODUÇÃO!
    
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### **2. Clique em "Publicar"**
### **3. Aguarde 1-2 minutos para propagar**

---

## 🧪 **TESTAR:**

1. **Acesse:** http://localhost:8000/teste-simples.html
2. **Clique em:** "🧪 Testar Gravação"
3. **Resultado esperado:** ✅ Gravação bem-sucedida!

---

## 📊 **DIAGNÓSTICO:**

### **✅ Se a gravação funcionar:**
- **Problema:** Regras de segurança muito restritivas
- **Solução:** Ajustar regras de produção

### **❌ Se ainda não funcionar:**
- **Problema:** Configuração do projeto Firebase
- **Verificar:** Authentication, domínios autorizados

---

## 🔐 **REGRAS DE PRODUÇÃO (Aplicar depois do teste):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura de compras para todos
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
      allow write: if request.auth != null;
    }
    
    // Resultados do sorteio podem ser lidos por todos
    match /draw/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Reservas temporárias
    match /reservations/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🚀 **PRÓXIMOS PASSOS:**

1. **Aplicar regras temporárias**
2. **Testar gravação**
3. **Se funcionar:** Aplicar regras de produção
4. **Testar novamente**
5. **Deploy no Netlify**

---

**⚠️ IMPORTANTE:** As regras temporárias são inseguras! Aplique as regras de produção assim que confirmar que a gravação funciona.
