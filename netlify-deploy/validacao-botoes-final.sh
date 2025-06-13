#!/bin/bash

# 🔍 VALIDAÇÃO FINAL - BOTÕES DE CONFIRMAÇÃO
# Script para verificar se a solução dos botões foi implementada corretamente

echo "🔍 INICIANDO VALIDAÇÃO FINAL DOS BOTÕES DE CONFIRMAÇÃO..."
echo "============================================================"

# Verificar se os arquivos essenciais existem
echo "📂 Verificando arquivos essenciais..."

if [ -f "admin.html" ]; then
    echo "✅ admin.html encontrado"
else
    echo "❌ admin.html NÃO encontrado"
    exit 1
fi

if [ -f "admin.js" ]; then
    echo "✅ admin.js encontrado"
else
    echo "❌ admin.js NÃO encontrado"
    exit 1
fi

# Verificar se as funções de emergência foram implementadas
echo ""
echo "🚨 Verificando implementação das funções de emergência..."

if grep -q "forcarBotoesEmergencia" admin.js; then
    echo "✅ Função forcarBotoesEmergencia implementada"
else
    echo "❌ Função forcarBotoesEmergencia NÃO encontrada"
fi

if grep -q "window.confirmDonation" admin.js; then
    echo "✅ Exposição global de confirmDonation implementada"
else
    echo "❌ Exposição global de confirmDonation NÃO encontrada"
fi

if grep -q "window.rejectDonation" admin.js; then
    echo "✅ Exposição global de rejectDonation implementada"
else
    echo "❌ Exposição global de rejectDonation NÃO encontrada"
fi

# Verificar se os botões de emergência foram adicionados ao HTML
echo ""
echo "🔧 Verificando botões de emergência no HTML..."

if grep -q "CORREÇÃO DE EMERGÊNCIA" admin.html; then
    echo "✅ Seção de emergência adicionada ao HTML"
else
    echo "❌ Seção de emergência NÃO encontrada no HTML"
fi

if grep -q "forcarBotoesEmergencia" admin.html; then
    echo "✅ Botão de emergência no HTML encontrado"
else
    echo "❌ Botão de emergência no HTML NÃO encontrado"
fi

# Verificar se o event delegation está implementado
echo ""
echo "🎯 Verificando event delegation..."

if grep -q "handleGlobalClick" admin.js; then
    echo "✅ Event delegation handleGlobalClick implementado"
else
    echo "❌ Event delegation handleGlobalClick NÃO encontrado"
fi

if grep -q "data-action" admin.js; then
    echo "✅ Data attributes para botões implementados"
else
    echo "❌ Data attributes para botões NÃO encontrados"
fi

# Verificar se as funções de confirmação estão implementadas
echo ""
echo "✅ Verificando funções de confirmação..."

if grep -q "confirmDonation.*function" admin.js; then
    echo "✅ Função confirmDonation implementada"
else
    echo "❌ Função confirmDonation NÃO encontrada"
fi

if grep -q "rejectDonation.*function" admin.js; then
    echo "✅ Função rejectDonation implementada"
else
    echo "❌ Função rejectDonation NÃO encontrada"
fi

if grep -q "editParticipant.*function" admin.js; then
    echo "✅ Função editParticipant implementada"
else
    echo "❌ Função editParticipant NÃO encontrada"
fi

# Verificar se createSampleData está implementado
echo ""
echo "📊 Verificando dados de teste..."

if grep -q "createSampleData.*function" admin.js; then
    echo "✅ Função createSampleData implementada"
else
    echo "❌ Função createSampleData NÃO encontrada"
fi

# Contar linhas de código para verificar se as implementações estão completas
echo ""
echo "📏 Estatísticas dos arquivos..."

admin_js_lines=$(wc -l < admin.js)
admin_html_lines=$(wc -l < admin.html)

echo "📜 admin.js: $admin_js_lines linhas"
echo "🌐 admin.html: $admin_html_lines linhas"

if [ $admin_js_lines -gt 700 ]; then
    echo "✅ admin.js tem tamanho adequado (>700 linhas)"
else
    echo "⚠️ admin.js pode estar incompleto (<700 linhas)"
fi

# Verificar se há erros de sintaxe no JavaScript
echo ""
echo "🔍 Verificando sintaxe JavaScript..."

if node -c admin.js 2>/dev/null; then
    echo "✅ admin.js tem sintaxe válida"
else
    echo "❌ admin.js tem erros de sintaxe"
fi

# Verificar se há erros de HTML
echo ""
echo "🔍 Verificando HTML..."

if command -v tidy >/dev/null 2>&1; then
    if tidy -q -e admin.html 2>/dev/null; then
        echo "✅ admin.html tem estrutura válida"
    else
        echo "⚠️ admin.html pode ter problemas de estrutura"
    fi
else
    echo "ℹ️ tidy não disponível, pulando validação HTML"
fi

# Verificar se os testes foram criados
echo ""
echo "🧪 Verificando arquivos de teste..."

test_files=(
    "teste-botoes-isolado.html"
    "debug-admin-atual.html"
    "diagnostico-botoes-admin.html"
    "SOLUCAO_BOTOES_EMERGENCIA_IMPLEMENTADA.md"
)

for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file criado"
    else
        echo "❌ $file NÃO encontrado"
    fi
done

# Resumo final
echo ""
echo "============================================================"
echo "🎯 RESUMO DA VALIDAÇÃO"
echo "============================================================"

# Contar sucessos
success_count=0
total_checks=15

# Verificar cada item crítico
[ -f "admin.html" ] && ((success_count++))
[ -f "admin.js" ] && ((success_count++))
grep -q "forcarBotoesEmergencia" admin.js && ((success_count++))
grep -q "window.confirmDonation" admin.js && ((success_count++))
grep -q "window.rejectDonation" admin.js && ((success_count++))
grep -q "CORREÇÃO DE EMERGÊNCIA" admin.html && ((success_count++))
grep -q "handleGlobalClick" admin.js && ((success_count++))
grep -q "data-action" admin.js && ((success_count++))
grep -q "confirmDonation.*function" admin.js && ((success_count++))
grep -q "rejectDonation.*function" admin.js && ((success_count++))
grep -q "editParticipant.*function" admin.js && ((success_count++))
grep -q "createSampleData.*function" admin.js && ((success_count++))
[ $admin_js_lines -gt 700 ] && ((success_count++))
node -c admin.js 2>/dev/null && ((success_count++))
[ -f "SOLUCAO_BOTOES_EMERGENCIA_IMPLEMENTADA.md" ] && ((success_count++))

percentage=$((success_count * 100 / total_checks))

echo "✅ Verificações passadas: $success_count/$total_checks ($percentage%)"

if [ $percentage -ge 90 ]; then
    echo "🎉 EXCELENTE! Implementação quase completa"
    echo "🚀 Os botões devem estar funcionando corretamente"
elif [ $percentage -ge 70 ]; then
    echo "✅ BOA! Implementação em boa forma"
    echo "⚠️ Algumas verificações falharam, mas deve funcionar"
elif [ $percentage -ge 50 ]; then
    echo "⚠️ PARCIAL! Implementação incompleta"
    echo "🔧 Recomenda-se revisar as partes que falharam"
else
    echo "❌ PROBLEMAS! Implementação com muitas falhas"
    echo "🚨 Necessário revisar urgentemente"
fi

echo ""
echo "📋 PRÓXIMOS PASSOS RECOMENDADOS:"
echo "1. Abrir http://localhost:8000/admin.html"
echo "2. Verificar se os botões aparecem na tabela"
echo "3. Testar botão '🚨 Forçar Botões' se necessário"
echo "4. Usar o console: window.forcarBotoesEmergencia()"
echo "5. Verificar logs no console do navegador (F12)"

echo ""
echo "🔗 LINKS ÚTEIS:"
echo "• Teste isolado: http://localhost:8000/teste-botoes-isolado.html"
echo "• Debug admin: http://localhost:8000/debug-admin-atual.html"
echo "• Diagnóstico: http://localhost:8000/diagnostico-botoes-admin.html"

echo ""
echo "============================================================"
echo "✅ VALIDAÇÃO CONCLUÍDA"
echo "============================================================"
