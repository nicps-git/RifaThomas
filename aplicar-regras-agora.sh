#!/bin/bash

echo "🔧 APLICAR REGRAS FIRESTORE - RIFA THOMAS"
echo "========================================"
echo ""

# Verificar se está no diretório correto
if [ ! -f "firebase.json" ]; then
    echo "❌ Erro: arquivo firebase.json não encontrado"
    echo "📁 Execute este script na pasta do projeto"
    exit 1
fi

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não está instalado."
    echo ""
    echo "📥 Instalando Firebase CLI..."
    npm install -g firebase-tools
    
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar Firebase CLI"
        echo ""
        echo "🔗 Aplicar manualmente no Console:"
        echo "   https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules"
        echo ""
        show_rules
        exit 1
    fi
fi

function show_rules() {
    echo "📋 REGRAS PARA APLICAR:"
    echo "======================"
    echo ""
    cat << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // REGRAS TEMPORÁRIAS PARA DESENVOLVIMENTO
    // PERMITIR TODAS AS OPERAÇÕES
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
EOF
    echo ""
}

function apply_rules() {
    echo "🔄 Aplicando regras temporárias..."
    
    # Backup das regras atuais
    echo "💾 Fazendo backup das regras atuais..."
    firebase firestore:rules:get > firestore.rules.backup 2>/dev/null
    
    # Aplicar novas regras
    echo "📝 Aplicando novas regras..."
    firebase deploy --only firestore:rules
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ REGRAS APLICADAS COM SUCESSO!"
        echo ""
        echo "🧪 Agora você pode:"
        echo "   1. Testar a validação: firefox netlify-deploy/validacao-final.html"
        echo "   2. Teste rápido: firefox netlify-deploy/teste-regras-firestore.html"
        echo ""
    else
        echo ""
        echo "❌ ERRO ao aplicar regras"
        echo ""
        echo "🔗 Aplicar manualmente no Console:"
        echo "   https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules"
        echo ""
        show_rules
    fi
}

echo "🔑 Fazendo login no Firebase..."
firebase login

if [ $? -ne 0 ]; then
    echo "❌ Erro no login do Firebase"
    echo ""
    echo "🔗 Aplicar manualmente no Console:"
    echo "   https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules"
    echo ""
    show_rules
    exit 1
fi

echo ""
echo "🎯 Selecionando projeto rifa-cha-thomas..."
firebase use rifa-cha-thomas

if [ $? -ne 0 ]; then
    echo "❌ Erro ao selecionar projeto"
    echo ""
    echo "📋 Projetos disponíveis:"
    firebase projects:list
    echo ""
    echo "🔧 Tente: firebase use --add"
    echo ""
    echo "🔗 Ou aplicar manualmente no Console:"
    echo "   https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules"
    echo ""
    show_rules
    exit 1
fi

echo ""
show_rules

echo "🚀 Deseja aplicar estas regras? (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    apply_rules
else
    echo ""
    echo "🔗 Aplicar manualmente no Console:"
    echo "   https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules"
    echo ""
    show_rules
fi
