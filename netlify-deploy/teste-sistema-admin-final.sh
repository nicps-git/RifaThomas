#!/bin/bash
# Script para testar todas as funcionalidades do admin corrigido
# Data: 12/06/2025

echo "🧪 TESTE COMPLETO - ADMIN RIFA THOMAS"
echo "===================================="
echo ""

# Verificar arquivos principais
echo "📁 Verificando arquivos..."
files=(
    "admin.html"
    "admin.js"
    "admin.css"
    "firebase-config.js"
    "login.html"
    "script.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANDO"
    fi
done

echo ""
echo "🔍 Verificando sintaxe JavaScript..."

# Verificar sintaxe dos arquivos JS
echo "  - admin.js:"
if node -c admin.js 2>/dev/null; then
    echo "    ✅ Sintaxe válida"
else
    echo "    ❌ Erro de sintaxe"
    node -c admin.js
fi

echo "  - firebase-config.js:"
if node -c firebase-config.js 2>/dev/null; then
    echo "    ✅ Sintaxe válida"
else
    echo "    ❌ Erro de sintaxe"
fi

echo "  - script.js:"
if node -c script.js 2>/dev/null; then
    echo "    ✅ Sintaxe válida"
else
    echo "    ❌ Erro de sintaxe"
fi

echo ""
echo "📋 Verificando estrutura do admin.html..."

# Verificar elementos importantes do admin.html
required_elements=(
    "participants-tbody"
    "config-form"
    "config-total-numbers"
    "config-ticket-price"
    "config-pix-key"
    "filter-all"
    "filter-pending_donation"
    "filter-confirmed"
)

for element in "${required_elements[@]}"; do
    if grep -q "id=\"$element\"" admin.html; then
        echo "✅ Elemento #$element encontrado"
    else
        echo "❌ Elemento #$element não encontrado"
    fi
done

echo ""
echo "🔧 Verificando funções principais no admin.js..."

# Verificar funções importantes
required_functions=(
    "confirmDonation"
    "rejectDonation"
    "loadParticipants"
    "filterParticipants"
    "saveConfiguration"
    "loadConfiguration"
    "exportParticipants"
    "performDraw"
    "editParticipant"
)

for func in "${required_functions[@]}"; do
    if grep -q "function $func" admin.js || grep -q "async function $func" admin.js; then
        echo "✅ Função $func() encontrada"
    else
        echo "❌ Função $func() não encontrada"
    fi
done

echo ""
echo "🎨 Verificando CSS do admin..."

if [ -f "admin.css" ]; then
    css_classes=(
        ".participants-table"
        ".btn-confirm"
        ".btn-reject"
        ".status-badge"
        ".notification"
    )
    
    for class in "${css_classes[@]}"; do
        if grep -q "$class" admin.css; then
            echo "✅ Classe $class encontrada"
        else
            echo "⚠️  Classe $class não encontrada"
        fi
    done
else
    echo "❌ Arquivo admin.css não encontrado"
fi

echo ""
echo "🔐 Verificando configurações de autenticação..."

if grep -q "admin@rifathomas.com" firebase-config.js || grep -q "admin@rifathomas.com" admin.js; then
    echo "✅ Email admin configurado"
else
    echo "❌ Email admin não configurado"
fi

if grep -q "casaVERDE123" firebase-config.js || grep -q "casaVERDE123" admin.js; then
    echo "✅ Senha admin configurada"
else
    echo "❌ Senha admin não configurada"
fi

echo ""
echo "📊 Verificando campos de dados..."

# Verificar se os campos corretos estão sendo usados
if grep -q "buyerName\|buyerPhone" admin.js; then
    echo "✅ Campos corretos (buyerName/buyerPhone) em uso"
else
    echo "❌ Campos incorretos - verificar nomes"
fi

echo ""
echo "🧪 RESUMO DO TESTE"
echo "=================="

# Contar sucessos e falhas
total_checks=0
passed_checks=0

echo "📋 Status dos arquivos principais:"
for file in "${files[@]}"; do
    total_checks=$((total_checks + 1))
    if [ -f "$file" ]; then
        passed_checks=$((passed_checks + 1))
        echo "  ✅ $file"
    else
        echo "  ❌ $file"
    fi
done

echo ""
echo "📊 Estatísticas:"
echo "  Total de verificações: $total_checks"
echo "  Verificações passou: $passed_checks"
echo "  Taxa de sucesso: $(( passed_checks * 100 / total_checks ))%"

echo ""
if [ $passed_checks -eq $total_checks ]; then
    echo "🎉 SUCESSO! Todos os arquivos principais estão presentes."
    echo "✅ O sistema admin está pronto para testes."
else
    echo "⚠️  ATENÇÃO! Alguns arquivos estão faltando."
    echo "❌ Verifique os itens marcados com ❌ acima."
fi

echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo "1. Abra admin.html em um navegador"
echo "2. Faça login com: admin@rifathomas.com / casaVERDE123"
echo "3. Teste as funcionalidades de confirmação"
echo "4. Verifique se os dados são salvos corretamente"
echo "5. Teste exportação e configurações"

echo ""
echo "🔗 ARQUIVOS DE TESTE DISPONÍVEIS:"
echo "  - teste-admin-funcionalidades.html (teste completo)"
echo "  - debug-admin-completo.html (debug detalhado)"
echo ""

echo "✅ Teste concluído!"
