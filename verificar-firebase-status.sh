#!/bin/bash
# Script para verificar status do Firebase

echo "🔥 VERIFICANDO STATUS DO FIREBASE - RIFATHOMAS"
echo "================================================"

# Verificar se os arquivos existem
echo "📁 Verificando arquivos:"
if [ -f "firebase-config-fixed.js" ]; then
    echo "✅ firebase-config-fixed.js encontrado"
else
    echo "❌ firebase-config-fixed.js não encontrado"
fi

if [ -f "index.html" ]; then
    echo "✅ index.html encontrado"
else
    echo "❌ index.html não encontrado"
fi

if [ -f "script.js" ]; then
    echo "✅ script.js encontrado"
else
    echo "❌ script.js não encontrado"
fi

echo ""
echo "🔍 Verificando configuração no index.html:"
if grep -q "firebase-config-fixed.js" index.html; then
    echo "✅ Configuração Firebase corrigida está sendo carregada"
else
    echo "❌ Configuração Firebase corrigida NÃO está sendo carregada"
fi

echo ""
echo "🌐 Verificando servidor local:"
if curl -s http://localhost:8001/ > /dev/null; then
    echo "✅ Servidor local rodando em http://localhost:8001"
else
    echo "❌ Servidor local não está rodando"
fi

echo ""
echo "📋 INSTRUÇÕES:"
echo "1. Abra: http://localhost:8001/teste-firebase-corrigido.html"
echo "2. Clique em 'Executar Todos' para testar Firebase"
echo "3. Se funcionar, abra: http://localhost:8001/index.html"
echo "4. Verifique se não aparece mais 'Firebase não carregado, usando localStorage'"

echo ""
echo "🔧 Se ainda houver problemas:"
echo "- Verifique o console do navegador (F12)"
echo "- Execute: ./verificar-firebase-console.sh"
echo "- Ou use o fallback: http://localhost:8001/netlify-deploy/admin-direto.html"
