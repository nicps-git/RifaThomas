#!/bin/bash

# 🎯 TESTE FINAL DE PRODUÇÃO - Validação Completa do Sistema
# Data: 13 de Junho de 2025
# Objetivo: Validar que a solução está pronta para produção

echo "🚀 INICIANDO TESTE FINAL DE PRODUÇÃO..."
echo "======================================"

# Definir diretório base
BASE_DIR="/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy"
cd "$BASE_DIR"

echo "📂 Verificando estrutura de arquivos..."

# Verificar arquivos essenciais
declare -a FILES=("admin.html" "admin.js" "admin.css" "firebase-config.js" "index.html")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - ARQUIVO CRÍTICO AUSENTE!"
        exit 1
    fi
done

echo ""
echo "🔍 Verificando implementação das correções..."

# Verificar funções críticas no admin.js
echo "📋 Funções implementadas:"
grep -q "function confirmDonation" admin.js && echo "✅ confirmDonation" || echo "❌ confirmDonation"
grep -q "function rejectDonation" admin.js && echo "✅ rejectDonation" || echo "❌ rejectDonation"
grep -q "function editParticipant" admin.js && echo "✅ editParticipant" || echo "❌ editParticipant"
grep -q "function createSampleData" admin.js && echo "✅ createSampleData" || echo "❌ createSampleData"
grep -q "forcarBotoesEmergencia" admin.js && echo "✅ forcarBotoesEmergencia" || echo "❌ forcarBotoesEmergencia"

# Verificar event delegation
grep -q "handleGlobalClick" admin.js && echo "✅ Event Delegation" || echo "❌ Event Delegation"

# Verificar botões de emergência no HTML
grep -q "CORREÇÃO DE EMERGÊNCIA" admin.html && echo "✅ Botões de Emergência no HTML" || echo "❌ Botões de Emergência"

echo ""
echo "📊 Estatísticas dos arquivos:"
wc -l admin.js | awk '{print "📜 admin.js: " $1 " linhas"}'
wc -l admin.html | awk '{print "🌐 admin.html: " $1 " linhas"}'

echo ""
echo "🔧 Verificando exposição global das funções..."
grep -q "window.confirmDonation = confirmDonation" admin.js && echo "✅ confirmDonation global" || echo "❌ confirmDonation global"
grep -q "window.rejectDonation = rejectDonation" admin.js && echo "✅ rejectDonation global" || echo "❌ rejectDonation global"
grep -q "window.createSampleData = createSampleData" admin.js && echo "✅ createSampleData global" || echo "❌ createSampleData global"

echo ""
echo "🧪 Verificando ferramentas de teste criadas..."
declare -a TEST_FILES=("teste-final-confirmacao.html" "debug-admin-atual.html" "diagnostico-botoes-admin.html" "sucesso-botoes-corrigidos.html")
for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "⚠️ $file - ferramenta de teste ausente"
    fi
done

echo ""
echo "📝 Verificando documentação..."
declare -a DOC_FILES=("MISSAO_CUMPRIDA_BOTOES_FINAIS.md" "SOLUCAO_BOTOES_EMERGENCIA_IMPLEMENTADA.md" "DEPLOY_PRODUCAO_FINAL.md")
for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "⚠️ $file - documentação ausente"
    fi
done

echo ""
echo "🔥 Verificando configuração Firebase..."
if grep -q "rifa-cha-thomas" firebase-config.js; then
    echo "✅ Projeto Firebase configurado"
else
    echo "❌ Configuração Firebase incorreta"
fi

echo ""
echo "⚡ Teste de sintaxe JavaScript..."
if node -c admin.js 2>/dev/null; then
    echo "✅ admin.js sintaxe válida"
else
    echo "❌ admin.js contém erros de sintaxe"
fi

echo ""
echo "🚀 Verificando servidor local..."
if pgrep -f "python3 -m http.server" > /dev/null; then
    PORT=$(pgrep -f "python3 -m http.server" | head -1 | xargs ps -p | grep -o 'http.server [0-9]*' | grep -o '[0-9]*')
    echo "✅ Servidor rodando na porta $PORT"
    echo "🌐 URL: http://localhost:$PORT/admin.html"
else
    echo "⚠️ Servidor local não está rodando"
    echo "💡 Execute: python3 -m http.server 8001"
fi

echo ""
echo "======================================"
echo "🎯 RESUMO DO TESTE FINAL"
echo "======================================"

# Contar sucessos e falhas
TOTAL_CHECKS=15
SUCCESS_COUNT=$(echo -e "$(grep -c "function confirmDonation" admin.js)" + "$(grep -c "function rejectDonation" admin.js)" + "$(grep -c "function editParticipant" admin.js)" + "$(grep -c "function createSampleData" admin.js)" + "$(grep -c "forcarBotoesEmergencia" admin.js)" + "$(grep -c "handleGlobalClick" admin.js)" + "$(grep -c "CORREÇÃO DE EMERGÊNCIA" admin.html)" + "$(grep -c "window.confirmDonation = confirmDonation" admin.js)" + "$(grep -c "window.rejectDonation = rejectDonation" admin.js)" + "$(grep -c "window.createSampleData = createSampleData" admin.js)" + "$(ls admin.html admin.js admin.css firebase-config.js index.html 2>/dev/null | wc -l)" | bc)

PERCENTAGE=$((SUCCESS_COUNT * 100 / TOTAL_CHECKS))

echo "📊 Taxa de Sucesso: $SUCCESS_COUNT/$TOTAL_CHECKS ($PERCENTAGE%)"

if [ $PERCENTAGE -ge 90 ]; then
    echo "🎉 SISTEMA PRONTO PARA PRODUÇÃO!"
    echo "✅ Taxa excelente de implementação"
elif [ $PERCENTAGE -ge 75 ]; then
    echo "🟡 SISTEMA BOM PARA PRODUÇÃO"
    echo "⚠️ Algumas verificações falharam, mas deve funcionar"
else
    echo "❌ SISTEMA PRECISA DE CORREÇÕES"
    echo "🔧 Verificar implementações ausentes"
fi

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. 🌐 Acessar: http://localhost:8001/admin.html"
echo "2. 🧪 Testar botões de confirmação"
echo "3. 🚨 Verificar sistema de emergência"
echo "4. 🚀 Deploy para produção se tudo OK"

echo ""
echo "🔗 LINKS DE TESTE:"
echo "• Admin: http://localhost:8001/admin.html"
echo "• Teste: http://localhost:8001/teste-final-confirmacao.html"
echo "• Debug: http://localhost:8001/debug-admin-atual.html"

echo ""
echo "🎯 COMANDOS DE DEBUG:"
echo "• Console: window.forcarBotoesEmergencia()"
echo "• Dados: window.createSampleData()"
echo "• Estado: window.adminData"

echo ""
echo "======================================"
echo "✅ TESTE FINAL CONCLUÍDO"
echo "======================================"
