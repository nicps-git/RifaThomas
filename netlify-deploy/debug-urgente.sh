#!/bin/bash

echo "🚨 DEBUG URGENTE - Identificar Problema dos Botões"
echo "=================================================="

cd /home/nicps/Documents/Projetos/RifaThomas/netlify-deploy

echo "⚡ SITUAÇÃO ATUAL:"
echo "   - Botões sumiram após as alterações"
echo "   - Função createActionButtons foi simplificada ao máximo"
echo "   - Botões básicos (Editar/Debug) devem SEMPRE aparecer"
echo ""

echo "🔧 AÇÃO IMEDIATA:"
echo "================"

# Abrir página de debug
echo "1. 🧪 Abrindo página de debug urgente..."
if command -v xdg-open &> /dev/null; then
    xdg-open "debug-urgente-botoes.html"
elif command -v open &> /dev/null; then
    open "debug-urgente-botoes.html"
else
    echo "   ⚠️ Abra manualmente: file://$(pwd)/debug-urgente-botoes.html"
fi

sleep 2

# Abrir página admin também
echo "2. 🔧 Abrindo página admin real..."
if [[ -f "admin.html" ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "admin.html"
    elif command -v open &> /dev/null; then
        open "admin.html"
    else
        echo "   ⚠️ Abra manualmente: file://$(pwd)/admin.html"
    fi
fi

echo ""
echo "📋 INSTRUÇÕES URGENTES:"
echo "======================="
echo "1. 🧪 Na página DEBUG URGENTE:"
echo "   • Clique em 'Testar Função Isolada' - deve mostrar botões"
echo "   • Clique em 'Testar com Admin.js' - verifica se o arquivo está carregando"
echo "   • Clique em 'Testar com Dados Reais' - simula dados da sua imagem"
echo "   • Verifique se aparecem botões renderizados na tela"
echo ""
echo "2. 🔧 Na página ADMIN real:"
echo "   • Faça login normal"
echo "   • Abra F12 (Console de Desenvolvedor)" 
echo "   • Procure por logs [BUTTON-DEBUG] no console"
echo "   • Verifique se há algum erro em vermelho"
echo ""
echo "3. 🔍 DIAGNÓSTICOS POSSÍVEIS:"
echo "   • Se função isolada funciona MAS admin real não = problema no carregamento"
echo "   • Se console mostra erros = problema de JavaScript"
echo "   • Se não há logs [BUTTON-DEBUG] = função não está sendo chamada"
echo "   • Se HTML é gerado mas não aparece = problema de CSS ou DOM"
echo ""

# Verificar arquivo admin.js
echo "🔍 VERIFICAÇÃO RÁPIDA DO ARQUIVO:"
echo "================================"

if [[ -f "admin.js" ]]; then
    echo "✅ admin.js existe"
    
    if grep -q "VERSÃO ULTRA SIMPLES" admin.js; then
        echo "✅ Versão ultra simples aplicada"
    else
        echo "❌ Versão ultra simples NÃO encontrada"
    fi
    
    if grep -q "buttonsHtml.*Editar" admin.js; then
        echo "✅ Código de botão Editar encontrado"
    else
        echo "❌ Código de botão Editar NÃO encontrado"
    fi
    
    if grep -q "return buttonsHtml" admin.js; then
        echo "✅ Return do HTML encontrado"
    else
        echo "❌ Return do HTML NÃO encontrado"
    fi
    
    echo ""
    echo "📊 Tamanho do arquivo admin.js: $(wc -l < admin.js) linhas"
    echo "📊 Última modificação: $(stat -c %y admin.js)"
    
else
    echo "❌ PROBLEMA CRÍTICO: admin.js não encontrado!"
fi

echo ""
echo "⚡ PRÓXIMOS PASSOS:"
echo "=================="
echo "1. Use as páginas abertas para identificar onde está o problema"
echo "2. Se a função isolada funciona, o problema é no admin real"
echo "3. Se nem a função isolada funciona, há erro na lógica"
echo "4. Observe especialmente os logs no console F12"
echo ""
echo "🎯 META: Identificar se o problema é:"
echo "   A) Função não sendo chamada"
echo "   B) Função com erro interno"  
echo "   C) HTML sendo gerado mas não exibido"
echo "   D) Arquivo admin.js não carregando corretamente"
echo ""
echo "📞 Após os testes, relate o que encontrou!"
