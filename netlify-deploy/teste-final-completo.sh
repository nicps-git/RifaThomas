#!/bin/bash

echo "🎯 TESTE FINAL - Verificação Completa da Correção dos Botões"
echo "==========================================================="

cd /home/nicps/Documents/Projetos/RifaThomas/netlify-deploy

echo "📋 RESUMO DAS CORREÇÕES APLICADAS:"
echo "================================="
echo "✅ Função normalizeString() - Remove acentos, pontuação e normaliza texto"
echo "✅ Função isDoacaoRobusta() - Verifica múltiplos campos:"
echo "   • purchase.tipo"
echo "   • purchase.metodoPagamento" 
echo "   • purchase.paymentMethod"
echo "   • purchase.observacoes"
echo "   • purchase.notes"
echo ""
echo "✅ Função isStatusPendenteRobusta() - Aceita variações:"
echo "   • pendente, pending, aguardando, nao confirmado, naoconfirmado"
echo ""
echo "✅ Atualização das funções principais:"
echo "   • createActionButtons() - Usa lógica robusta"
echo "   • loadParticipants() - Filtros robustos"
echo ""

# Verificar arquivos criados
echo "📁 ARQUIVOS DE TESTE CRIADOS:"
echo "============================"

if [[ -f "teste-final-botoes.html" ]]; then
    echo "✅ teste-final-botoes.html - Teste completo da correção"
else
    echo "❌ teste-final-botoes.html NÃO encontrado"
fi

if [[ -f "debug-casos-especificos.html" ]]; then
    echo "✅ debug-casos-especificos.html - Análise de casos específicos"
else
    echo "❌ debug-casos-especificos.html NÃO encontrado"
fi

if [[ -f "inspetor-firebase.html" ]]; then
    echo "✅ inspetor-firebase.html - Inspeção dos dados brutos"
else
    echo "❌ inspetor-firebase.html NÃO encontrado"
fi

echo ""
echo "🚀 INICIANDO TESTES..."
echo "====================="

# Abrir página de teste final
echo "1. 🎯 Abrindo teste final da correção..."
if command -v xdg-open &> /dev/null; then
    xdg-open "teste-final-botoes.html"
elif command -v open &> /dev/null; then
    open "teste-final-botoes.html"
else
    echo "   ⚠️ Abra manualmente: file://$(pwd)/teste-final-botoes.html"
fi

sleep 2

# Abrir página admin real para teste prático
echo "2. 🔧 Abrindo página admin real para verificação..."
if [[ -f "admin.html" ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "admin.html"
    elif command -v open &> /dev/null; then
        open "admin.html"
    else
        echo "   ⚠️ Abra manualmente: file://$(pwd)/admin.html"
    fi
else
    echo "   ❌ admin.html não encontrado"
fi

echo ""
echo "📋 INSTRUÇÕES PARA VERIFICAÇÃO:"
echo "==============================="
echo "1. Na página 'Teste Final':"
echo "   • Clique em 'Testar Lógica Completa' - deve mostrar 100% sucesso"
echo "   • Clique em 'Carregar e Analisar Dados' - deve mostrar dados reais"
echo "   • Verifique se o resultado final é 'SUCESSO TOTAL'"
echo ""
echo "2. Na página 'Admin' real:"
echo "   • Faça login normalmente"
echo "   • Clique no filtro 'Doações Pendentes'"
echo "   • Verifique se TODOS os registros têm botões ✅ Confirmar / ❌ Rejeitar"
echo "   • Use F12 para ver logs [BUTTON-DEBUG] no console"
echo ""
echo "3. Se ainda houver problemas:"
echo "   • Verifique os logs detalhados no console"
echo "   • Use as páginas de debug específico"
echo "   • Analise os dados brutos no inspetor Firebase"
echo ""

# Verificar se há algum problema óbvio no código
echo "🔍 VERIFICAÇÃO RÁPIDA DO CÓDIGO:"
echo "==============================="

if grep -q "isDoacaoRobusta" admin.js && grep -q "isStatusPendenteRobusta" admin.js; then
    echo "✅ Funções robustas presentes no admin.js"
else
    echo "❌ PROBLEMA: Funções robustas não encontradas no admin.js"
fi

if grep -q "normalizeString" admin.js; then
    echo "✅ Função de normalização presente"
else
    echo "❌ PROBLEMA: Função normalizeString não encontrada"
fi

echo ""
echo "🎉 TESTE INICIADO!"
echo "=================="
echo "As páginas foram abertas para verificação."
echo "Siga as instruções acima para confirmar se a correção funcionou."
echo ""
echo "💡 DICA: Se tudo estiver correto, os botões devem aparecer para"
echo "   TODAS as doações que têm status pendente, independente de:"
echo "   - Acentuação (doação vs doacao)"
echo "   - Maiúsculas (DOAÇÃO vs doação)"
echo "   - Campo usado (tipo vs metodoPagamento vs observacoes)"
echo "   - Variações de status (pendente vs pending vs aguardando)"
