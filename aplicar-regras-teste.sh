#!/bin/bash

echo "🔧 Aplicação de Regras Temporárias para Teste"
echo "============================================="
echo ""

echo "📋 REGRAS TEMPORÁRIAS (Para teste - menos seguras)"
echo "=================================================="
echo ""
echo "Aplique estas regras no Firebase Console para testar:"
echo "https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules"
echo ""
echo "SUBSTITUA TODO o conteúdo por:"
echo ""
echo "┌─────────────────────────────────────────────────┐"
echo "│  REGRAS TEMPORÁRIAS - APENAS PARA TESTE        │"
echo "└─────────────────────────────────────────────────┘"
echo ""

cat << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // REGRAS TEMPORÁRIAS - PERMISSIVAS PARA TESTE
    // NÃO USE EM PRODUÇÃO!
    
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
EOF

echo ""
echo "┌─────────────────────────────────────────────────┐"
echo "│  DEPOIS DE APLICAR, CLIQUE EM 'PUBLICAR'       │"
echo "└─────────────────────────────────────────────────┘"
echo ""
echo "🧪 APÓS APLICAR AS REGRAS:"
echo "========================="
echo "1. Aguarde 1-2 minutos para propagar"
echo "2. Acesse: http://localhost:8000/teste-simples.html"
echo "3. Clique em '🧪 Testar Gravação'"
echo "4. Deve aparecer: ✅ Gravação bem-sucedida!"
echo ""
echo "✅ Se funcionar, as regras originais podem estar incorretas"
echo "❌ Se não funcionar, o problema é na configuração do projeto"
echo ""

read -p "Deseja abrir o Firebase Console para aplicar as regras? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]] && command -v xdg-open &> /dev/null; then
    xdg-open "https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules"
fi

echo ""
echo "⚠️  IMPORTANTE: Depois do teste, aplique as regras de produção:"
echo ""

cat firestore.rules

echo ""
echo "🔄 PRÓXIMOS PASSOS:"
echo "=================="
echo "1. Aplicar regras temporárias"
echo "2. Testar gravação"
echo "3. Se funcionar, aplicar regras de produção"
echo "4. Testar novamente"
