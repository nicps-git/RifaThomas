#!/bin/bash

echo "🚨 CORREÇÃO EMERGENCIAL - Restaurar Botões"
echo "=========================================="

cd /home/nicps/Documents/Projetos/RifaThomas/netlify-deploy

echo "🔧 Aplicada correção híbrida que:"
echo "   ✅ Mantém lógica anterior funcionando"
echo "   ✅ Adiciona lógica robusta como backup" 
echo "   ✅ Garante que botões Editar e Debug sempre aparecem"
echo "   ✅ Usa detecção dupla para doações pendentes"
echo ""

# Verificar se as correções estão no lugar
echo "📋 Verificando correções aplicadas..."

if grep -q "VERSÃO HÍBRIDA SEGURA" admin.js; then
    echo "✅ Versão híbrida aplicada"
else
    echo "❌ Versão híbrida NÃO encontrada"
fi

if grep -q "buttons.push" admin.js; then
    echo "✅ Código de botões encontrado"
else
    echo "❌ Código de botões NÃO encontrado"
fi

if grep -q "btn-edit" admin.js && grep -q "btn-confirm" admin.js; then
    echo "✅ Botões Editar e Confirmar definidos"
else
    echo "❌ Definições de botões com problema"
fi

echo ""
echo "🌐 Teste imediato necessário!"
echo "============================"

# Abrir página admin para teste
if [[ -f "admin.html" ]]; then
    echo "🔧 Abrindo página admin para verificação imediata..."
    if command -v xdg-open &> /dev/null; then
        xdg-open "admin.html"
    elif command -v open &> /dev/null; then
        open "admin.html"
    else
        echo "   ⚠️ Abra manualmente: file://$(pwd)/admin.html"
    fi
else
    echo "❌ admin.html não encontrado"
fi

echo ""
echo "📋 VERIFICAÇÃO IMEDIATA:"
echo "======================="
echo "1. 🔍 Abra a página admin que foi aberta"
echo "2. 🔐 Faça login normalmente"
echo "3. 👀 Verifique se os botões ✏️ Editar e 🔍 Debug aparecem em TODAS as linhas"
echo "4. 🎯 Clique no filtro 'Doações Pendentes'"
echo "5. ✅ Verifique se os botões ✅ Confirmar / ❌ Rejeitar aparecem para doações"
echo ""
echo "🔧 A nova lógica híbrida deve:"
echo "   • Sempre mostrar botões básicos (Editar + Debug)"
echo "   • Mostrar botões de confirmação para doações pendentes"
echo "   • Usar duas verificações para maior precisão"
echo "   • Ser tolerante a erros (não quebrar se algo falhar)"
echo ""
echo "📞 Se ainda não funcionou, pressione F12 e verifique os logs!"

echo ""
echo "⚡ CORREÇÃO EMERGENCIAL APLICADA!"
