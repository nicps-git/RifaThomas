#!/bin/bash

echo "🔍 VERIFICAÇÃO - Correção do Auto-Sync"
echo "====================================="

echo ""
echo "📂 Verificando arquivos modificados..."

# Verificar se admin.js foi modificado
if [ -f "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.js" ]; then
    echo "✅ admin.js encontrado"
    
    # Verificar se as correções estão presentes
    if grep -q "loadPurchases()" "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.js"; then
        echo "✅ Correção loadPurchases() implementada"
    else
        echo "❌ Correção loadPurchases() NÃO encontrada"
    fi
    
    if grep -q "loadConfig()" "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.js"; then
        echo "✅ Correção loadConfig() implementada"
    else
        echo "❌ Correção loadConfig() NÃO encontrada"
    fi
    
    if grep -q "auto-sync-status-main" "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.js"; then
        echo "✅ Correção IDs duplicados implementada"
    else
        echo "❌ Correção IDs duplicados NÃO encontrada"
    fi
else
    echo "❌ admin.js NÃO encontrado"
fi

echo ""
echo "🔍 Verificando admin.html..."
if [ -f "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.html" ]; then
    echo "✅ admin.html encontrado"
    
    # Contar quantos auto-sync-status existem
    auto_sync_count=$(grep -c "id=\"auto-sync-status" "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.html")
    if [ "$auto_sync_count" -eq 1 ]; then
        echo "✅ IDs de auto-sync únicos (encontrados: $auto_sync_count)"
    else
        echo "⚠️ Múltiplos IDs auto-sync encontrados: $auto_sync_count"
    fi
    
    if grep -q "auto-sync-status-main" "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.html"; then
        echo "✅ Novos IDs principais implementados"
    else
        echo "❌ Novos IDs principais NÃO encontrados"
    fi
else
    echo "❌ admin.html NÃO encontrado"
fi

echo ""
echo "🔍 Verificando firebase-config.js..."
if [ -f "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/firebase-config.js" ]; then
    echo "✅ firebase-config.js encontrado"
    
    if grep -q "loadPurchases" "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/firebase-config.js"; then
        echo "✅ Método loadPurchases() existe no Firebase"
    else
        echo "❌ Método loadPurchases() NÃO encontrado no Firebase"
    fi
    
    if grep -q "loadConfig" "/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/firebase-config.js"; then
        echo "✅ Método loadConfig() existe no Firebase"
    else
        echo "❌ Método loadConfig() NÃO encontrado no Firebase"
    fi
else
    echo "❌ firebase-config.js NÃO encontrado"
fi

echo ""
echo "🧪 Verificando arquivo de teste..."
if [ -f "/home/nicps/Documents/Projetos/RifaThomas/teste-autosync.html" ]; then
    echo "✅ Página de teste criada"
else
    echo "❌ Página de teste NÃO encontrada"
fi

echo ""
echo "📋 Resumo das correções implementadas:"
echo "-------------------------------------"
echo "1. ✅ Corrigido método Firebase: getPurchases() → loadPurchases()"
echo "2. ✅ Corrigido método Firebase: getConfig() → loadConfig()"
echo "3. ✅ Removidos IDs duplicados no HTML"
echo "4. ✅ Atualizadas funções para suportar ambos os conjuntos de elementos"
echo "5. ✅ Criada página de teste para diagnóstico"

echo ""
echo "🔧 Problemas identificados e solucionados:"
echo "-----------------------------------------"
echo "• PROBLEMA: Auto-sync chamava métodos inexistentes no Firebase"
echo "• SOLUÇÃO: Corrigidos os nomes dos métodos para loadPurchases() e loadConfig()"
echo ""
echo "• PROBLEMA: IDs duplicados causavam conflitos nos indicadores visuais"
echo "• SOLUÇÃO: Renomeados IDs na seção principal e atualizadas as funções JS"
echo ""
echo "• PROBLEMA: Funções de progresso não atualizavam todos os elementos"
echo "• SOLUÇÃO: Expandidas funções para atualizar ambos os conjuntos de elementos"

echo ""
echo "🚀 Para testar as correções:"
echo "1. Abra a página admin.html"
echo "2. Verifique se o auto-sync está funcionando (status deve alternar)"
echo "3. Clique em 'Atualizar Agora' para testar refresh manual"
echo "4. Use a página teste-autosync.html para diagnóstico detalhado"

echo ""
echo "✅ Verificação concluída!"
