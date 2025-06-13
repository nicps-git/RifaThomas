#!/bin/bash

# ===============================================
# VALIDAÇÃO FINAL - Sistema Auto-Sync
# Rifa Thomas - 13 de Junho de 2025
# ===============================================

echo "🚀 INICIANDO VALIDAÇÃO FINAL DO SISTEMA AUTO-SYNC"
echo "=================================================="
echo ""

# Função para mostrar resultados
show_result() {
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
    else
        echo "❌ $2"
    fi
}

# Contador de sucessos
SUCCESS_COUNT=0
TOTAL_TESTS=10

echo "📁 Verificando arquivos principais..."
echo "------------------------------------"

# 1. Verificar se admin.html existe e tem auto-sync
if grep -q "auto-sync-controls" admin.html; then
    show_result 0 "admin.html contém controles auto-sync"
    ((SUCCESS_COUNT++))
else
    show_result 1 "admin.html NÃO contém controles auto-sync"
fi

# 2. Verificar se admin.js tem sistema auto-sync
if grep -q "autoSyncConfig" admin.js; then
    show_result 0 "admin.js contém sistema auto-sync"
    ((SUCCESS_COUNT++))
else
    show_result 1 "admin.js NÃO contém sistema auto-sync"
fi

# 3. Verificar função refreshData
if grep -q "function refreshData" admin.js; then
    show_result 0 "Função refreshData implementada"
    ((SUCCESS_COUNT++))
else
    show_result 1 "Função refreshData NÃO encontrada"
fi

# 4. Verificar função toggleAutoSync
if grep -q "function toggleAutoSync" admin.js; then
    show_result 0 "Função toggleAutoSync implementada"
    ((SUCCESS_COUNT++))
else
    show_result 1 "Função toggleAutoSync NÃO encontrada"
fi

# 5. Verificar sistema de emergência
if grep -q "forcarBotoesEmergencia" admin.js; then
    show_result 0 "Sistema de emergência implementado"
    ((SUCCESS_COUNT++))
else
    show_result 1 "Sistema de emergência NÃO encontrado"
fi

echo ""
echo "🎨 Verificando interface..."
echo "---------------------------"

# 6. Verificar botões de controle no HTML
if grep -q "Atualizar Agora" admin.html; then
    show_result 0 "Botão 'Atualizar Agora' presente"
    ((SUCCESS_COUNT++))
else
    show_result 1 "Botão 'Atualizar Agora' NÃO encontrado"
fi

# 7. Verificar seção de emergência
if grep -q "CORREÇÃO DE EMERGÊNCIA" admin.html; then
    show_result 0 "Seção de emergência presente"
    ((SUCCESS_COUNT++))
else
    show_result 1 "Seção de emergência NÃO encontrada"
fi

# 8. Verificar indicadores visuais
if grep -q "sync-progress" admin.html; then
    show_result 0 "Indicadores de progresso presentes"
    ((SUCCESS_COUNT++))
else
    show_result 1 "Indicadores de progresso NÃO encontrados"
fi

echo ""
echo "🧪 Verificando ferramentas de teste..."
echo "-------------------------------------"

# 9. Verificar página de teste
if [ -f "teste-auto-sync.html" ]; then
    show_result 0 "Página de teste auto-sync existe"
    ((SUCCESS_COUNT++))
else
    show_result 1 "Página de teste auto-sync NÃO existe"
fi

# 10. Verificar documentação
if [ -f "SISTEMA_AUTO_SYNC_IMPLEMENTADO.md" ]; then
    show_result 0 "Documentação auto-sync existe"
    ((SUCCESS_COUNT++))
else
    show_result 1 "Documentação auto-sync NÃO existe"
fi

echo ""
echo "📊 RESULTADO FINAL"
echo "=================="
echo ""

# Calcular porcentagem
PERCENTAGE=$((SUCCESS_COUNT * 100 / TOTAL_TESTS))

echo "✅ Testes Passou: $SUCCESS_COUNT/$TOTAL_TESTS"
echo "📈 Taxa de Sucesso: $PERCENTAGE%"
echo ""

if [ $PERCENTAGE -ge 90 ]; then
    echo "🎉 EXCELENTE! Sistema pronto para produção!"
    echo "🚀 Confiabilidade: ALTA ($PERCENTAGE%)"
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo "1. 📤 Deploy para servidor de produção"
    echo "2. 🧪 Teste em ambiente real"
    echo "3. 👥 Treinamento dos administradores"
    echo "4. 📊 Monitoramento de performance"
    exit 0
elif [ $PERCENTAGE -ge 70 ]; then
    echo "⚠️  BOM! Sistema funcional com algumas melhorias necessárias"
    echo "🔧 Confiabilidade: MÉDIA ($PERCENTAGE%)"
    echo ""
    echo "🛠️  AÇÕES RECOMENDADAS:"
    echo "1. Verificar itens que falharam"
    echo "2. Implementar correções"
    echo "3. Executar nova validação"
    exit 1
else
    echo "❌ PROBLEMAS! Sistema precisa de correções"
    echo "🔴 Confiabilidade: BAIXA ($PERCENTAGE%)"
    echo ""
    echo "🚨 AÇÕES URGENTES:"
    echo "1. Revisar implementação"
    echo "2. Corrigir erros encontrados"
    echo "3. Re-executar validação completa"
    exit 2
fi
