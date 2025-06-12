#!/bin/bash

# Script para guiar configuração Firebase + Netlify
echo "🔥 Configuração Firebase + Netlify para Rifa Thomas"
echo "=================================================="
echo ""

echo "📋 PASSO 1: Configure o Firebase"
echo "==============================="
echo "1. Acesse: https://console.firebase.google.com/"
echo "2. Crie um novo projeto (ou selecione existente): 'rifa-cha-thomas'"
echo "3. Ative os serviços necessários:"
echo "   ✅ Authentication (Email/Password + Anonymous)"
echo "   ✅ Firestore Database"
echo "   ✅ Storage (opcional)"
echo ""

echo "📝 PASSO 2: Obter configurações do Firebase"
echo "==========================================="
echo "1. No Firebase Console, vá em: ⚙️ Configurações do Projeto"
echo "2. Na aba 'Geral', role até 'Seus aplicativos'"
echo "3. Clique no ícone da web '</>' para adicionar app web"
echo "4. Nome do app: 'Rifa Thomas Web'"
echo "5. ✅ Marque 'Configurar Firebase Hosting'"
echo "6. Copie o objeto firebaseConfig que aparece"
echo ""

echo "🔑 PASSO 3: Atualizar firebase-config.js"
echo "========================================"
echo "Substitua as configurações em netlify-deploy/firebase-config.js"
echo "Exemplo do que você receberá:"
echo ""
echo "const firebaseConfig = {"
echo '  apiKey: "AIzaSyC1234567890abcdefgh...",'
echo '  authDomain: "rifa-cha-thomas.firebaseapp.com",'
echo '  projectId: "rifa-cha-thomas",'
echo '  storageBucket: "rifa-cha-thomas.appspot.com",'
echo '  messagingSenderId: "123456789012",'
echo '  appId: "1:123456789012:web:abc123..."'
echo "};"
echo ""

echo "🌐 PASSO 4: Deploy no Netlify"
echo "============================="
echo "Você já tem o projeto no Netlify: rifa-cha-thomas"
echo ""
echo "Opção A - Drag & Drop (Simples):"
echo "1. Abra: https://app.netlify.com/sites/rifa-cha-thomas"
echo "2. Vá em 'Deploys'"
echo "3. Arraste a pasta 'netlify-deploy' para fazer novo deploy"
echo ""
echo "Opção B - Git Deploy (Recomendado):"
echo "1. Conecte seu repositório GitHub ao Netlify"
echo "2. Configure Build settings:"
echo "   - Build command: (vazio)"
echo "   - Publish directory: netlify-deploy"
echo ""

echo "🔐 PASSO 5: Configurar domínios autorizados"
echo "=========================================="
echo "1. Volte ao Firebase Console"
echo "2. Vá em Authentication → Settings → Authorized domains"
echo "3. Adicione seus domínios:"
echo "   - localhost (para desenvolvimento)"
echo "   - rifa-cha-thomas.netlify.app"
echo "   - Seu domínio customizado (se houver)"
echo ""

echo "✅ PASSO 6: Testar conexão"
echo "=========================="
echo "1. Acesse seu site no Netlify"
echo "2. Abra DevTools (F12) → Console"
echo "3. Verifique se não há erros"
echo "4. Teste criação de uma compra"
echo ""

echo "🚀 PRÓXIMOS PASSOS:"
echo "=================="
echo "1. Configure Firebase (passos 1-3)"
echo "2. Execute: ./configure-firebase.sh"
echo "3. Faça deploy no Netlify"
echo ""

read -p "Pressione Enter para abrir o Firebase Console..." 
if command -v xdg-open &> /dev/null; then
    xdg-open "https://console.firebase.google.com/"
fi
