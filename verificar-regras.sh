#!/bin/bash

# Script para verificar e corrigir regras do Firestore
echo "🔐 Verificador de Regras Firestore"
echo "=================================="
echo ""

CONFIG_FILE="netlify-deploy/firebase-config.js"

# Verificar se Firebase está configurado
if ! [ -f "$CONFIG_FILE" ] || grep -q "SUA_API_KEY_AQUI" "$CONFIG_FILE"; then
    echo "❌ Firebase não está configurado!"
    echo "Execute: ./configure-firebase.sh"
    exit 1
fi

echo "✅ Firebase configurado!"
echo ""

# Extrair Project ID do arquivo de configuração
PROJECT_ID=$(grep 'projectId:' "$CONFIG_FILE" | sed 's/.*projectId: *"//' | sed 's/".*//')

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Não foi possível extrair o Project ID!"
    exit 1
fi

echo "🔍 Project ID detectado: $PROJECT_ID"
echo ""

echo "🔐 PROBLEMA PRINCIPAL: Regras de Segurança"
echo "=========================================="
echo ""
echo "O Firestore por padrão BLOQUEIA todas as escritas."
echo "Você precisa aplicar regras personalizadas que permitem:"
echo ""
echo "✅ Leitura pública de compras (para mostrar números vendidos)"
echo "✅ Escrita apenas para usuários autenticados"
echo "✅ Administradores podem modificar tudo"
echo ""

echo "📋 Regras Corretas (do arquivo firestore.rules):"
echo "==============================================="
echo ""

if [ -f "firestore.rules" ]; then
    echo "```javascript"
    cat firestore.rules
    echo "```"
else
    echo "❌ Arquivo firestore.rules não encontrado!"
    echo ""
    echo "Criando regras básicas..."
    
    cat > firestore.rules << 'EOF'
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
EOF
    
    echo "✅ Arquivo firestore.rules criado!"
fi

echo ""
echo "🚀 COMO APLICAR AS REGRAS:"
echo "========================="
echo ""
echo "1️⃣  Via Firebase Console (Recomendado):"
echo "   • Acesse: https://console.firebase.google.com/project/$PROJECT_ID/firestore/rules"
echo "   • Copie o conteúdo do arquivo firestore.rules"
echo "   • Cole na interface web"
echo "   • Clique em 'Publicar'"
echo ""

echo "2️⃣  Via Firebase CLI (Avançado):"
echo "   • npm install -g firebase-tools"
echo "   • firebase login"
echo "   • firebase deploy --only firestore:rules"
echo ""

echo "🧪 TESTE APÓS APLICAR REGRAS:"
echo "============================="
echo ""
echo "1. Execute: ./testar-firebase.sh"
echo "2. Acesse: http://localhost:8000/test-firebase.html"
echo "3. Teste botão 'Testar Escrita no Firestore'"
echo "4. Deve aparecer '✅ Escrita no Firestore bem-sucedida!'"
echo ""

echo "🔍 VERIFICAR SE FUNCIONOU:"
echo "========================="
echo ""
echo "1. Acesse: https://console.firebase.google.com/project/$PROJECT_ID/firestore/data"
echo "2. Procure pela coleção 'config'"
echo "3. Deve ter um documento com dados de teste"
echo ""

read -p "Deseja abrir o Firebase Console para aplicar as regras? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🌐 Abrindo Firebase Console..."
    
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://console.firebase.google.com/project/$PROJECT_ID/firestore/rules"
    else
        echo "Acesse: https://console.firebase.google.com/project/$PROJECT_ID/firestore/rules"
    fi
    
    echo ""
    echo "📋 Instruções:"
    echo "1. Substitua todo o conteúdo pelas regras do arquivo firestore.rules"
    echo "2. Clique em 'Publicar'"
    echo "3. Aguarde confirmação"
    echo "4. Execute: ./testar-firebase.sh"
fi

echo ""
echo "✅ Script concluído!"
echo ""
echo "🔄 Próximos passos:"
echo "1. Aplicar regras no Firebase Console"
echo "2. Testar com: ./testar-firebase.sh"
echo "3. Verificar se dados aparecem no Firestore"
