#!/bin/bash

# Script rápido para testar Firebase após correções
echo "🔧 Teste Rápido - Firebase Corrigido"
echo "=================================="
echo ""

# Verificar se servidor está rodando
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Servidor local está rodando"
else
    echo "🚀 Iniciando servidor local..."
    cd netlify-deploy
    python3 -m http.server 8000 &
    SERVER_PID=$!
    sleep 3
    echo "✅ Servidor iniciado (PID: $SERVER_PID)"
fi

echo ""
echo "📍 URLs de teste:"
echo "• Principal: http://localhost:8000"
echo "• Teste Firebase: http://localhost:8000/teste-gravacao.html"
echo "• Debug avançado: http://localhost:8000/test-firebase.html"
echo ""

echo "🔍 O que verificar:"
echo "=================="
echo "1. Acesse: http://localhost:8000/teste-gravacao.html"
echo "2. Veja se aparece '✅ Firebase carregado com sucesso!'"
echo "3. Clique em 'Testar Gravação'"
echo "4. Deve aparecer '✅ Gravação bem-sucedida!'"
echo ""

echo "🛠️ Correções aplicadas:"
echo "======================"
echo "✅ Scripts convertidos para ES6 modules"
echo "✅ Firebase carregamento melhorado"
echo "✅ Logs de debug adicionados"
echo "✅ Aguardo automático do carregamento"
echo ""

echo "🔥 Firebase Console links:"
echo "=========================="
echo "• Regras: https://console.firebase.google.com/project/rifa-cha-thomas/firestore/rules"
echo "• Dados: https://console.firebase.google.com/project/rifa-cha-thomas/firestore/data"
echo "• Auth: https://console.firebase.google.com/project/rifa-cha-thomas/authentication/providers"
echo ""

read -p "Abrir página de teste automaticamente? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]] && command -v xdg-open &> /dev/null; then
    echo "🌐 Abrindo página de teste..."
    xdg-open "http://localhost:8000/teste-gravacao.html"
fi

echo ""
echo "📋 Próximos passos se funcionar:"
echo "==============================="
echo "1. Teste a aplicação principal"
echo "2. Verifique se dados aparecem no Firebase Console"
echo "3. Faça deploy no Netlify"
echo ""

echo "✅ Teste pronto! Verifique o navegador."
