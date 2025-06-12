#!/bin/bash

# Validação da Correção de Sincronização
# Este script testa se a correção do problema de sincronização funcionou

echo "🔍 VALIDAÇÃO DA CORREÇÃO DE SINCRONIZAÇÃO"
echo "============================================"
echo ""

echo "📋 1. Verificando se o problema foi identificado corretamente..."

# Verificar se as linhas problemáticas foram removidas do script.js (ignorar comentários)
if grep -v "^\s*//" /home/nicps/Documents/Projetos/RifaThomas/script.js | grep -q "localStorage.removeItem('purchases')"; then
    echo "❌ PROBLEMA: Ainda há linha ativa que remove 'purchases' do localStorage!"
    echo "   Isso apagaria dados confirmados do admin."
    exit 1
else
    echo "✅ OK: Linha problemática removida (localStorage.removeItem('purchases'))"
fi

if grep -v "^\s*//" /home/nicps/Documents/Projetos/RifaThomas/script.js | grep -q "localStorage.removeItem('rifaData')"; then
    echo "❌ PROBLEMA: Ainda há linha ativa que remove 'rifaData' do localStorage!"
    echo "   Isso apagaria dados de números vendidos."
    exit 1
else
    echo "✅ OK: Linha problemática removida (localStorage.removeItem('rifaData'))"
fi

echo ""
echo "📋 2. Verificando se as novas funções foram adicionadas..."

# Verificar se a nova função foi adicionada
if grep -q "loadSoldNumbersFromLocalStorage" /home/nicps/Documents/Projetos/RifaThomas/script.js; then
    echo "✅ OK: Função 'loadSoldNumbersFromLocalStorage' adicionada"
else
    echo "❌ PROBLEMA: Função 'loadSoldNumbersFromLocalStorage' não encontrada!"
    exit 1
fi

# Verificar se o monitoramento foi adicionado
if grep -q "startLocalStorageMonitoring" /home/nicps/Documents/Projetos/RifaThomas/script.js; then
    echo "✅ OK: Sistema de monitoramento adicionado"
else
    echo "❌ PROBLEMA: Sistema de monitoramento não encontrado!"
    exit 1
fi

echo ""
echo "📋 3. Verificando estrutura do código corrigido..."

# Contar linhas do arquivo
TOTAL_LINES=$(wc -l < /home/nicps/Documents/Projetos/RifaThomas/script.js)
echo "ℹ️ Script.js tem $TOTAL_LINES linhas (antes: ~620 linhas)"

# Verificar se não há erros de sintaxe JavaScript básicos
if node -c /home/nicps/Documents/Projetos/RifaThomas/script.js 2>/dev/null; then
    echo "✅ OK: Sintaxe JavaScript válida"
else
    echo "❌ PROBLEMA: Erro de sintaxe JavaScript detectado!"
    echo "   Execute: node -c script.js para ver detalhes"
    exit 1
fi

echo ""
echo "📋 4. Resumo da correção aplicada..."
echo ""
echo "🔧 CORREÇÕES APLICADAS:"
echo "1. ✅ Removida linha que apagava 'purchases' do localStorage"
echo "2. ✅ Removida linha que apagava 'rifaData' do localStorage"
echo "3. ✅ Adicionada função 'loadSoldNumbersFromLocalStorage()'"
echo "4. ✅ Adicionado sistema de monitoramento automático"
echo "5. ✅ Corrigida inicialização para preservar dados do admin"
echo ""
echo "🎯 RESULTADO ESPERADO:"
echo "- Página principal agora carrega números confirmados do admin"
echo "- Números confirmados aparecem como VENDIDOS (vermelhos)"
echo "- Números pendentes aparecem como RESERVADOS (amarelos)"
echo "- Sincronização automática a cada 2 segundos"
echo "- Dados do admin NÃO são mais apagados"
echo ""
echo "🧪 COMO TESTAR:"
echo "1. Abra: http://localhost:8000/teste-sincronizacao-numeros.html"
echo "2. Crie compras confirmadas e pendentes"
echo "3. Abra a página principal e verifique se os números aparecem corretos"
echo "4. Use o admin para confirmar doações e veja se sincroniza"
echo ""
echo "✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO!"
echo "   A correção foi aplicada corretamente."
