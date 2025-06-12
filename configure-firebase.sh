#!/bin/bash

# Script interativo para configurar Firebase
echo "🔧 Configurador Interativo Firebase"
echo "==================================="
echo ""

CONFIG_FILE="netlify-deploy/firebase-config.js"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Arquivo $CONFIG_FILE não encontrado!"
    exit 1
fi

echo "Vou te ajudar a configurar o Firebase passo a passo."
echo ""
echo "📋 Primeiro, obtenha suas configurações do Firebase:"
echo "1. Acesse: https://console.firebase.google.com/"
echo "2. Selecione seu projeto 'rifa-cha-thomas'"
echo "3. Vá em ⚙️ Configurações do Projeto → Geral"
echo "4. Role até 'Seus aplicativos' e clique no ícone web"
echo ""

read -p "Já tem as configurações do Firebase? (y/n): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Por favor, obtenha as configurações primeiro e execute o script novamente."
    if command -v xdg-open &> /dev/null; then
        echo "Abrindo Firebase Console..."
        xdg-open "https://console.firebase.google.com/"
    fi
    exit 1
fi

echo ""
echo "✨ Ótimo! Agora vamos configurar cada campo:"
echo ""

# Função para substituir configuração
update_config() {
    local key=$1
    local value=$2
    local pattern=$3
    
    sed -i "s/$pattern/$key: \"$value\",/g" "$CONFIG_FILE"
    echo "✅ $key configurado"
}

# Coletar configurações
echo "🔑 API Key:"
read -p "Cole sua apiKey: " API_KEY

echo ""
echo "🌐 Auth Domain:"
read -p "Cole seu authDomain (ex: seu-projeto.firebaseapp.com): " AUTH_DOMAIN

echo ""
echo "📦 Project ID:"
read -p "Cole seu projectId: " PROJECT_ID

echo ""
echo "💾 Storage Bucket:"
read -p "Cole seu storageBucket (ex: seu-projeto.appspot.com): " STORAGE_BUCKET

echo ""
echo "📧 Messaging Sender ID:"
read -p "Cole seu messagingSenderId: " SENDER_ID

echo ""
echo "📱 App ID:"
read -p "Cole seu appId: " APP_ID

echo ""
echo "🔄 Aplicando configurações..."

# Fazer backup
cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
echo "📋 Backup criado: $CONFIG_FILE.backup"

# Aplicar configurações
update_config "apiKey" "$API_KEY" "apiKey: \"SUA_API_KEY_AQUI\","
update_config "authDomain" "$AUTH_DOMAIN" "authDomain: \"rifa-cha-thomas.firebaseapp.com\","
update_config "projectId" "$PROJECT_ID" "projectId: \"rifa-cha-thomas\","
update_config "storageBucket" "$STORAGE_BUCKET" "storageBucket: \"rifa-cha-thomas.appspot.com\","
update_config "messagingSenderId" "$SENDER_ID" "messagingSenderId: \"123456789\","
update_config "appId" "$APP_ID" "appId: \"SUA_APP_ID_AQUI\""

echo ""
echo "✅ Configuração concluída!"
echo ""

echo "📊 Resumo das configurações aplicadas:"
echo "======================================"
echo "API Key: ${API_KEY:0:20}..."
echo "Auth Domain: $AUTH_DOMAIN"
echo "Project ID: $PROJECT_ID"
echo "Storage Bucket: $STORAGE_BUCKET"
echo "Messaging Sender ID: $SENDER_ID"
echo "App ID: ${APP_ID:0:30}..."
echo ""

echo "🧪 Testando configuração..."
if grep -q "SUA_API_KEY_AQUI" "$CONFIG_FILE"; then
    echo "⚠️  Ainda restam configurações por fazer!"
else
    echo "✅ Todas as configurações foram aplicadas!"
fi

echo ""
echo "🚀 Próximos passos:"
echo "=================="
echo "1. Teste localmente: cd netlify-deploy && python3 -m http.server 8000"
echo "2. Acesse: http://localhost:8000"
echo "3. Verifique o console do navegador (F12)"
echo "4. Se tudo estiver OK, faça deploy no Netlify"
echo ""

echo "🌐 Para fazer deploy no Netlify:"
echo "==============================="
echo "1. Acesse: https://app.netlify.com/sites/rifa-cha-thomas"
echo "2. Vá na aba 'Deploys'"
echo "3. Arraste a pasta 'netlify-deploy' para fazer novo deploy"
echo ""

read -p "Deseja abrir a pasta netlify-deploy? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "netlify-deploy/"
    fi
fi

echo ""
echo "🎉 Configuração Firebase concluída!"
