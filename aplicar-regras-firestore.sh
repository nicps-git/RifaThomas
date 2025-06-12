#!/bin/bash

echo "🔧 Aplicando Regras Temporárias do Firestore"
echo "============================================"
echo ""

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não está instalado."
    echo ""
    echo "📥 Para instalar:"
    echo "   npm install -g firebase-tools"
    echo ""
    echo "🔗 Ou aplique manualmente no Console:"
    echo "   https://console.firebase.google.com/project/raffle-thomas/firestore/rules"
    echo ""
    echo "📋 Regras para aplicar:"
    echo "rules_version = '2';"
    echo "service cloud.firestore {"
    echo "  match /databases/{database}/documents {"
    echo "    match /{document=**} {"
    echo "      allow read, write: if true;"
    echo "    }"
    echo "  }"
    echo "}"
    exit 1
fi

# Verificar se está logado
echo "🔐 Verificando login no Firebase..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Você não está logado no Firebase."
    echo "📥 Fazendo login..."
    firebase login
fi

# Criar arquivo temporário com regras
echo "📝 Criando arquivo de regras temporárias..."
cat > firestore-rules-temp.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // REGRAS TEMPORÁRIAS - PERMITEM TUDO
    // ⚠️ USAR APENAS PARA DESENVOLVIMENTO/TESTE
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
EOF

echo "✅ Arquivo de regras criado: firestore-rules-temp.rules"

# Aplicar regras
echo "🚀 Aplicando regras no projeto raffle-thomas..."
firebase use raffle-thomas

if firebase firestore:rules firestore-rules-temp.rules; then
    echo ""
    echo "🎉 Regras aplicadas com sucesso!"
    echo ""
    echo "✅ Agora você pode:"
    echo "   1. Testar leitura e escrita no Firestore"
    echo "   2. Usar a aplicação normalmente"
    echo "   3. Fazer deploy no Netlify"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "   - Estas são regras temporárias"
    echo "   - Qualquer pessoa pode ler/escrever"
    echo "   - Aplique regras de produção antes do lançamento"
    echo ""
else
    echo ""
    echo "❌ Erro ao aplicar regras."
    echo ""
    echo "🔧 Solução manual:"
    echo "1. Acesse: https://console.firebase.google.com/project/raffle-thomas/firestore/rules"
    echo "2. Cole as regras do arquivo: firestore-rules-temp.rules"
    echo "3. Clique em 'Publish'"
fi

# Limpar arquivo temporário
rm -f firestore-rules-temp.rules

echo ""
echo "🔗 Links úteis:"
echo "   Console Firebase: https://console.firebase.google.com/project/raffle-thomas"
echo "   Regras Firestore: https://console.firebase.google.com/project/raffle-thomas/firestore/rules"
echo "   Database: https://console.firebase.google.com/project/raffle-thomas/firestore/data"
