#!/bin/bash

echo "🚨 DIAGNÓSTICO URGENTE - Problema dos Botões Sumindo"
echo "===================================================="

echo ""
echo "1. Verificando estado atual do admin.js..."
grep -n "function createActionButtons" netlify-deploy/admin.js
echo ""

echo "2. Verificando se há múltiplas funções createActionButtons..."
grep -n "createActionButtons" netlify-deploy/admin.js | head -10
echo ""

echo "3. Verificando se função emergência está presente..."
grep -A5 -B5 "EMERGÊNCIA EXTREMA" netlify-deploy/admin.js
echo ""

echo "4. Verificando se há outros arquivos JS que podem estar conflitando..."
find netlify-deploy/ -name "*.js" -not -name "admin.js" | head -5
echo ""

echo "5. Verificando se há cache ou versões antigas..."
ls -la netlify-deploy/admin.js*
echo ""

echo "6. Criando versão ultra-debug para testar agora..."
cp netlify-deploy/admin.js netlify-deploy/admin.js.pre-debug-$(date +%H%M%S)
echo "Backup criado!"

echo ""
echo "7. Verificando integridade do arquivo..."
tail -5 netlify-deploy/admin.js
echo ""

echo "===================================================="
echo "✅ Diagnóstico completo!"
echo "Próximo passo: aplicar solução mais agressiva"
