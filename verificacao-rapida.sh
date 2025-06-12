#!/bin/bash

echo "🔧 Verificação Rápida - Firebase Rifa Thomas"
echo "=============================================="
echo ""

# Verificar se os arquivos de configuração estão corretos
echo "📁 Verificando arquivos de configuração..."

# Contar quantos arquivos têm a API Key correta
CORRECT_COUNT=$(grep -r "AIzaSyDrTY8pnDXwDPnWkTGYVxpKTxXy8p8zAmo" netlify-deploy/ | wc -l)
echo "✅ Arquivos com API Key correta: $CORRECT_COUNT"

# Verificar se ainda há configurações antigas
OLD_COUNT=$(grep -r "rifa-cha-thomas" netlify-deploy/ 2>/dev/null | wc -l)
if [ $OLD_COUNT -eq 0 ]; then
    echo "✅ Nenhuma configuração antiga encontrada"
else
    echo "⚠️  Ainda há $OLD_COUNT referências à configuração antiga"
fi

echo ""
echo "🔗 Links importantes para verificar no Console Firebase:"
echo "----------------------------------------"
echo "1. 🏠 Console Principal:"
echo "   https://console.firebase.google.com/project/raffle-thomas"
echo ""
echo "2. 🔐 Autenticação:"
echo "   https://console.firebase.google.com/project/raffle-thomas/authentication/providers"
echo "   ➤ Verificar se 'Anonymous' está HABILITADO"
echo ""
echo "3. 🗄️  Firestore Database:"
echo "   https://console.firebase.google.com/project/raffle-thomas/firestore"
echo "   ➤ Verificar se o banco foi criado"
echo ""
echo "4. ⚖️  Regras do Firestore:"
echo "   https://console.firebase.google.com/project/raffle-thomas/firestore/rules"
echo "   ➤ Aplicar regras temporárias para teste"
echo ""
echo "5. ⚙️  Configurações da App:"
echo "   https://console.firebase.google.com/project/raffle-thomas/settings/general/web"
echo "   ➤ Verificar se a configuração web existe"
echo ""

echo "🧪 Testes disponíveis:"
echo "----------------------"
echo "1. teste-api-key.html     - Testa apenas a API Key"
echo "2. teste-cdn.html         - Teste completo básico"
echo "3. diagnostico-firebase.html - Diagnóstico de 10 pontos"
echo ""

echo "📋 Regras temporárias para Firestore:"
echo "-------------------------------------"
cat << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
EOF

echo ""
echo "🚀 Próximos passos:"
echo "1. Teste o arquivo 'teste-api-key.html' primeiro"
echo "2. Se funcionar, vá para o Console Firebase e:"
echo "   - Habilite autenticação anônima"
echo "   - Aplique as regras temporárias"
echo "   - Crie o database Firestore se não existir"
echo "3. Teste novamente com 'teste-cdn.html'"
echo ""
