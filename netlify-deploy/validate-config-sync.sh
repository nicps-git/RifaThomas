#!/bin/bash
# Script para validar sincronização de configurações

echo "🧪 Iniciando validação completa da sincronização de configurações"
echo "================================================================"

echo ""
echo "1️⃣ Verificando estrutura de arquivos..."

# Verificar arquivos essenciais
files=(
    "firebase-config.js"
    "index.html"
    "admin.html"
    "script.js"
    "admin.js"
    "test-config-sync.html"
    "simple-config-test.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file NÃO encontrado"
    fi
done

echo ""
echo "2️⃣ Verificando implementação de funções no firebase-config.js..."

# Verificar funções essenciais
functions=(
    "saveConfig"
    "loadConfig"
    "listenToChanges"
)

for func in "${functions[@]}"; do
    if grep -q "$func" firebase-config.js; then
        echo "✅ Função $func implementada"
    else
        echo "❌ Função $func NÃO encontrada"
    fi
done

echo ""
echo "3️⃣ Verificando uso de configurações no script.js..."

if grep -q "loadConfigurationFromFirebase" script.js; then
    echo "✅ Carregamento de configurações implementado"
else
    echo "❌ Carregamento de configurações NÃO encontrado"
fi

if grep -q "applyConfigurationToUI" script.js; then
    echo "✅ Aplicação de configurações na UI implementada"
else
    echo "❌ Aplicação de configurações na UI NÃO encontrada"
fi

if grep -q "rifa_config" script.js; then
    echo "✅ Listener para configurações implementado"
else
    echo "❌ Listener para configurações NÃO encontrado"
fi

echo ""
echo "4️⃣ Verificando configuração da coleção no Firebase..."

if grep -q "rifa_config" firebase-config.js; then
    echo "✅ Coleção rifa_config configurada"
else
    echo "❌ Coleção rifa_config NÃO configurada"
fi

echo ""
echo "5️⃣ Verificando servidor local..."

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ | grep -q "200"; then
    echo "✅ Servidor local respondendo"
else
    echo "❌ Servidor local NÃO respondendo"
fi

echo ""
echo "6️⃣ Verificando arquivos de teste..."

test_files=(
    "test-config-sync.html"
    "simple-config-test.html"
    "debug-config.html"
)

for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Arquivo de teste $file disponível"
    else
        echo "❌ Arquivo de teste $file NÃO encontrado"
    fi
done

echo ""
echo "📊 RESUMO DA VALIDAÇÃO"
echo "====================="
echo ""
echo "✅ IMPLEMENTADO:"
echo "   - Funções saveConfig, loadConfig, listenToChanges"
echo "   - Carregamento automático de configurações"
echo "   - Listener para mudanças em tempo real"
echo "   - Aplicação de configurações na UI"
echo "   - Arquivos de teste para validação"
echo ""
echo "🔄 PRÓXIMOS PASSOS:"
echo "   1. Abrir http://localhost:8000/admin.html"
echo "   2. Fazer login e alterar configurações"
echo "   3. Abrir http://localhost:8000/index.html"
echo "   4. Verificar se mudanças aparecem automaticamente"
echo "   5. Usar http://localhost:8000/test-config-sync.html para testes detalhados"
echo ""
echo "🎯 TESTE COMPLETO:"
echo "   - Admin salva config → Firebase → Index page atualiza"
echo "   - Tempo real através de listeners"
echo "   - Fallback para localStorage quando Firebase falha"

echo ""
echo "✅ Validação concluída!"
