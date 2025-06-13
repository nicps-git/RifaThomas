#!/bin/bash

echo "🧪 TESTE DA IMPLEMENTAÇÃO FIREBASE-ONLY"
echo "======================================"

# Verificar se os arquivos existem
echo ""
echo "📂 Verificando arquivos..."
if [ -f "script.js" ]; then
    echo "✅ script.js encontrado"
else
    echo "❌ script.js não encontrado"
    exit 1
fi

if [ -f "script-backup-com-localstorage.js" ]; then
    echo "✅ Backup criado: script-backup-com-localstorage.js"
else
    echo "⚠️ Backup não encontrado"
fi

# Verificar se localStorage foi removido
echo ""
echo "🔍 Verificando remoção do localStorage..."

LOCALSTORAGE_COUNT=$(grep -c "localStorage" script.js)
if [ $LOCALSTORAGE_COUNT -eq 0 ]; then
    echo "✅ localStorage completamente removido do script.js"
else
    echo "❌ Ainda existem $LOCALSTORAGE_COUNT referências ao localStorage"
    echo "Localizações:"
    grep -n "localStorage" script.js
fi

# Verificar funções críticas
echo ""
echo "🔧 Verificando funções críticas..."

# Verificar se initializeWithFirebase não tem fallback
if grep -q "localStorage" script.js; then
    echo "❌ initializeWithFirebase ainda tem referências ao localStorage"
else
    echo "✅ initializeWithFirebase limpo (sem localStorage)"
fi

# Verificar se handlePurchase é Firebase-only
if grep -A 20 "async function handlePurchase" script.js | grep -q "savePurchaseData"; then
    echo "❌ handlePurchase ainda tem fallback para localStorage"
else
    echo "✅ handlePurchase é Firebase-only"
fi

# Verificar se updateSoldNumbersFromPurchases não salva no localStorage
if grep -A 10 "function updateSoldNumbersFromPurchases" script.js | grep -q "saveNumbersToLocalStorage"; then
    echo "❌ updateSoldNumbersFromPurchases ainda salva no localStorage"
else
    echo "✅ updateSoldNumbersFromPurchases não usa localStorage"
fi

# Verificar se showFirebaseError existe
if grep -q "function showFirebaseError" script.js; then
    echo "✅ showFirebaseError implementada"
else
    echo "❌ showFirebaseError não encontrada"
fi

# Verificar logs de debug
echo ""
echo "📊 Verificando logs de debug..."

if grep -q "MODO FIREBASE APENAS" script.js; then
    echo "✅ Logs de debug atualizados"
else
    echo "❌ Logs de debug não atualizados"
fi

# Verificar timeout reduzido
if grep -q "10000.*10 segundos apenas" script.js; then
    echo "✅ Timeout reduzido para 10 segundos"
else
    echo "❌ Timeout não foi reduzido"
fi

# Verificar se há erros de sintaxe
echo ""
echo "🔍 Verificando sintaxe JavaScript..."

# Usar node para verificar sintaxe básica
if command -v node >/dev/null 2>&1; then
    if node -c script.js 2>/dev/null; then
        echo "✅ Sintaxe JavaScript válida"
    else
        echo "❌ Erro de sintaxe encontrado:"
        node -c script.js
    fi
else
    echo "⚠️ Node.js não disponível - não foi possível verificar sintaxe"
fi

# Verificar tamanho do arquivo
echo ""
echo "📈 Informações do arquivo..."
LINES=$(wc -l < script.js)
SIZE=$(wc -c < script.js)
echo "📄 Linhas: $LINES"
echo "💾 Tamanho: $SIZE bytes"

# Comparar com backup se existir
if [ -f "script-backup-com-localstorage.js" ]; then
    BACKUP_LINES=$(wc -l < script-backup-com-localstorage.js)
    BACKUP_SIZE=$(wc -c < script-backup-com-localstorage.js)
    
    DIFF_LINES=$((BACKUP_LINES - LINES))
    DIFF_SIZE=$((BACKUP_SIZE - SIZE))
    
    echo "🔄 Comparação com backup:"
    echo "   Linhas removidas: $DIFF_LINES"
    echo "   Bytes economizados: $DIFF_SIZE"
fi

# Verificar estrutura de funções importantes
echo ""
echo "🎯 Verificando estrutura de funções..."

FUNCTIONS=(
    "initializeWithFirebase"
    "loadSoldNumbersFromFirebase"
    "updateSoldNumbersFromPurchases"
    "handlePurchase"
    "showFirebaseError"
    "updateNumbersDisplay"
)

for func in "${FUNCTIONS[@]}"; do
    if grep -q "function $func\|async function $func" script.js; then
        echo "✅ $func encontrada"
    else
        echo "❌ $func não encontrada"
    fi
done

echo ""
echo "======================================"
echo "🏁 TESTE CONCLUÍDO"

# Contagem final
TOTAL_TESTS=8
PASSED_TESTS=$(grep -c "✅" /tmp/test_output 2>/dev/null || echo "0")

if [ $LOCALSTORAGE_COUNT -eq 0 ]; then
    echo "🎉 SUCESSO: localStorage completamente removido!"
    echo "🔥 Sistema agora é 100% Firebase-only"
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo "1. Testar conexão com Firebase"
    echo "2. Verificar sincronização admin → página principal"
    echo "3. Testar tratamento de erros"
    echo "4. Deploy para produção"
else
    echo "⚠️ ATENÇÃO: Ainda existem referências ao localStorage"
    echo "❌ Revisar e remover referências restantes"
fi
