#!/bin/bash

echo "🔧 Testando Correções dos Botões - Versão Robusta"
echo "================================================="

cd /home/nicps/Documents/Projetos/RifaThomas/netlify-deploy

# Verificar se as funções robustas foram adicionadas
echo "📋 Verificando se as correções foram aplicadas..."

# Verificar se normalizeString existe
if grep -q "function normalizeString" admin.js; then
    echo "✅ Função normalizeString encontrada"
else
    echo "❌ Função normalizeString NÃO encontrada"
fi

# Verificar se isDoacaoRobusta existe
if grep -q "function isDoacaoRobusta" admin.js; then
    echo "✅ Função isDoacaoRobusta encontrada"
else
    echo "❌ Função isDoacaoRobusta NÃO encontrada"
fi

# Verificar se isStatusPendenteRobusta existe
if grep -q "function isStatusPendenteRobusta" admin.js; then
    echo "✅ Função isStatusPendenteRobusta encontrada"
else
    echo "❌ Função isStatusPendenteRobusta NÃO encontrada"
fi

# Verificar se createActionButtons foi atualizada
if grep -q "isDoacaoRobusta(purchase)" admin.js; then
    echo "✅ createActionButtons usando lógica robusta"
else
    echo "❌ createActionButtons NÃO usando lógica robusta"
fi

# Verificar se loadParticipants foi atualizada  
if grep -q "const isDonation = isDoacaoRobusta(purchase)" admin.js; then
    echo "✅ loadParticipants usando lógica robusta"
else
    echo "❌ loadParticipants NÃO usando lógica robusta"
fi

echo ""
echo "🎯 Campos que a nova lógica verifica:"
echo "   - purchase.tipo (normalizado)"
echo "   - purchase.metodoPagamento (normalizado)"
echo "   - purchase.paymentMethod (normalizado)"
echo "   - purchase.observacoes (normalizado)"
echo "   - purchase.notes (normalizado)"
echo ""
echo "🔍 Variações aceitas para doação:"
echo "   - doacao, doacão, doação, donation"
echo ""
echo "🔍 Variações aceitas para pendente:"
echo "   - pendente, pending, aguardando, nao confirmado, naoconfirmado"
echo ""

# Testar com os scripts de debug
echo "🌐 Abrindo páginas de debug para teste..."

# Abrir debug específico
if [[ -f "debug-casos-especificos.html" ]]; then
    echo "📊 Abrindo debug de casos específicos..."
    if command -v xdg-open &> /dev/null; then
        xdg-open "debug-casos-especificos.html" 
    elif command -v open &> /dev/null; then
        open "debug-casos-especificos.html"
    fi
fi

# Abrir inspetor Firebase
if [[ -f "inspetor-firebase.html" ]]; then
    echo "🔬 Abrindo inspetor Firebase..."
    if command -v xdg-open &> /dev/null; then
        xdg-open "inspetor-firebase.html" 
    elif command -v open &> /dev/null; then
        open "inspetor-firebase.html"
    fi
fi

echo ""
echo "📋 PRÓXIMOS PASSOS PARA TESTE:"
echo "1. Nas páginas abertas, verifique se ainda há casos sem botões"
echo "2. Compare os dados dos casos com e sem botões"
echo "3. Use a função de 'Teste Manual da Lógica' para validar"
echo "4. Se ainda houver problemas, analise os dados brutos no inspetor"
echo ""
echo "✅ Correções aplicadas! Agora teste na página admin real."
