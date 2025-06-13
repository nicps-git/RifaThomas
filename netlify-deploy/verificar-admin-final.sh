#!/bin/bash

echo "🔍 VERIFICAÇÃO FINAL - SISTEMA ADMIN RIFA THOMAS"
echo "================================================"

# Verificar se os arquivos estão no lugar
echo ""
echo "📁 Verificando arquivos..."

files=(
    "admin.html"
    "admin-corrigido-final.html" 
    "admin-bypass-auth.html"
    "admin-emergency.html"
    "diagnostico-firebase-auth.html"
    "firebase-config.js"
    "admin.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANDO"
    fi
done

echo ""
echo "🔧 Verificando configurações..."

# Verificar se Firebase config existe e tem as chaves necessárias
if grep -q "apiKey" firebase-config.js && grep -q "projectId" firebase-config.js; then
    echo "✅ Firebase config - OK"
else
    echo "❌ Firebase config - PROBLEMA"
fi

# Verificar se admin.js tem as funções restauradas
if grep -q "filterParticipants" admin.js && grep -q "exportParticipants" admin.js; then
    echo "✅ Funções admin restauradas - OK"
else
    echo "❌ Funções admin - FALTANDO"
fi

echo ""
echo "🌐 URLs de Teste:"
echo "- Admin Principal: http://localhost:8080/admin.html"
echo "- Admin Melhorado: http://localhost:8080/admin-corrigido-final.html"  
echo "- Bypass Auth: http://localhost:8080/admin-bypass-auth.html"
echo "- Emergência: http://localhost:8080/admin-emergency.html"
echo "- Diagnóstico: http://localhost:8080/diagnostico-firebase-auth.html"

echo ""
echo "🔐 Credenciais:"
echo "- Email: admin@rifathomas.com"
echo "- Senha: casaVERDE123"
echo "- Código Emergência: RIFATHOMAS2025"

echo ""
echo "✅ VERIFICAÇÃO CONCLUÍDA!"
echo ""
echo "🎯 TESTE RECOMENDADO:"
echo "1. Acesse: http://localhost:8080/admin.html"
echo "2. Se der erro, use: http://localhost:8080/admin-bypass-auth.html"
echo "3. Para diagnóstico: http://localhost:8080/diagnostico-firebase-auth.html"
echo ""
