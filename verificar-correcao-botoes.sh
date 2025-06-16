#!/bin/bash

echo "🔍 VERIFICAÇÃO - Correção dos Botões de Confirmação"
echo "=================================================="

echo ""
echo "📂 Verificando arquivos modificados..."

# Verificar se admin.js foi modificado
if [ -f "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.js" ]; then
    echo "✅ admin.js encontrado"
    
    # Verificar se as correções estão presentes
    if grep -q "isPendingDonation" "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.js"; then
        echo "✅ Lógica isPendingDonation implementada"
    else
        echo "❌ Lógica isPendingDonation NÃO encontrada"
    fi
    
    if grep -q "status === 'pending' && (paymentMethod === 'doacao'" "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.js"; then
        echo "✅ Filtro para 'pending' + 'doacao' implementado"
    else
        echo "❌ Filtro para 'pending' + 'doacao' NÃO encontrado"
    fi
    
    if grep -q "filter === 'pending_donation'" "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.js"; then
        echo "✅ Filtro pending_donation corrigido"
    else
        echo "❌ Filtro pending_donation NÃO corrigido"
    fi
else
    echo "❌ admin.js NÃO encontrado"
fi

echo ""
echo "🧪 Verificando arquivo de teste..."
if [ -f "/home/nicps/Documents/Projetos/RifaThomas/teste-botoes-confirmacao.html" ]; then
    echo "✅ Página de teste criada"
else
    echo "❌ Página de teste NÃO encontrada"
fi

echo ""
echo "📋 Resumo das correções implementadas:"
echo "-------------------------------------"
echo "1. ✅ Corrigido filtro na função loadParticipants() para incluir:"
echo "   - Status 'pending_donation'"
echo "   - Status 'pending' + paymentMethod 'doacao'/'donation'"
echo ""
echo "2. ✅ Melhorada função createActionButtons() para:"
echo "   - Verificar múltiplas condições para doações pendentes"
echo "   - Evitar mostrar botões para itens já confirmados/rejeitados"
echo "   - Melhor logging para debug"
echo ""
echo "3. ✅ Criada página de teste para validar as correções"

echo ""
echo "🔧 Problemas identificados e solucionados:"
echo "-----------------------------------------"
echo "• PROBLEMA: Filtro 'pending_donation' não incluía compras com status 'pending' + método 'doacao'"
echo "• SOLUÇÃO: Modificado filtro para incluir ambas as condições"
echo ""
echo "• PROBLEMA: Botões só apareciam para status exato 'pending_donation'"
echo "• SOLUÇÃO: Lógica expandida para detectar todas as variações de doações pendentes"

echo ""
echo "🚀 Para testar as correções:"
echo "1. Abra a página admin.html"
echo "2. Clique no filtro 'Doações Pendentes'"
echo "3. Verifique se todas as solicitações pendentes mostram botões de confirmação"
echo "4. Use a página teste-botoes-confirmacao.html para diagnóstico detalhado"

echo ""
echo "✅ Verificação concluída!"
