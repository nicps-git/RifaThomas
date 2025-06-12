# 🔧 CORRIGIR LEITURA E GRAVAÇÃO - Firestore Rules

## ❌ PROBLEMA ATUAL:
- ✅ Firebase conecta (autenticação OK)
- ❌ Leitura falha: "Missing or insufficient permissions"
- ❌ Gravação falha: "Missing or insufficient permissions"

## 🎯 SOLUÇÃO: Configurar Regras do Firestore

### PASSO 1: Acessar Console Firebase
🔗 **Link direto:** https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules

### PASSO 2: Aplicar Regras Temporárias
Cole estas regras no editor:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // REGRAS TEMPORÁRIAS - PERMITIR TUDO PARA TESTE
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### PASSO 3: Publicar as Regras
1. Clique em **"Publish"**
2. Aguarde confirmação: "Rules published successfully"

### PASSO 4: Verificar se Database Existe
Se aparecer erro "Database not found":

1. Vá para: https://console.firebase.google.com/project/rifa-cha-thomas/firestore
2. Se não existir banco, clique **"Create database"**
3. Escolha **"Start in test mode"**
4. Selecione região: **"southamerica-east1"**
5. Clique **"Done"**

### PASSO 5: Verificar Autenticação
🔗 **Link:** https://console.firebase.google.com/project/rifa-cha-thomas/authentication/providers

Certifique-se que está habilitado:
- ✅ **Anonymous** (Anônimo)

## 🧪 TESTAR APÓS CONFIGURAÇÃO:

1. **Recarregue a página** `teste-final.html`
2. **Clique:** "🚀 Iniciar Teste Completo"
3. **Resultado esperado:** 
   - ✅ Firebase CDN
   - ✅ Inicialização  
   - ✅ Autenticação
   - ✅ Conexão Firestore
   - ✅ Leitura Dados
   - ✅ Gravação Dados

## ⚠️ IMPORTANTE:
- Estas são **regras temporárias** para teste
- **NUNCA** use em produção
- Após testar, aplicar regras de segurança adequadas

## 🆘 SE AINDA NÃO FUNCIONAR:

### Verificar Projeto:
- Confirme que está no projeto: **"rifa-cha-thomas"**
- URL deve ser: `https://console.firebase.google.com/project/rifa-cha-thomas`

### Limpar Cache:
- Pressione **Ctrl+Shift+R** (Linux) para reload forçado
- Ou abra em **aba anônima**

### Verificar Rede:
- Teste se consegue acessar: https://firestore.googleapis.com
- Verifique se não há firewall bloqueando

---
**🎯 OBJETIVO:** Fazer leitura e gravação funcionarem sem alterar API Key
