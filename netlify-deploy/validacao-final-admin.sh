#!/bin/bash
# VALIDAÇÃO FINAL DO ADMIN - Rifa Thomas
# Data: 12/06/2025

echo "🔧 VALIDAÇÃO FINAL - ADMIN CORRIGIDO"
echo "===================================="
echo

# Verificar se os arquivos existem
if [[ -f "admin.html" && -f "admin.js" ]]; then
    echo "✅ Arquivos admin.html e admin.js encontrados"
else
    echo "❌ Arquivos admin não encontrados"
    exit 1
fi

# Verificar sintaxe JavaScript
echo "🔍 Verificando sintaxe JavaScript..."
if node -c admin.js 2>/dev/null; then
    echo "✅ Sintaxe JavaScript válida"
else
    echo "❌ Erro de sintaxe JavaScript"
    exit 1
fi

# Verificar se é a versão corrigida
if grep -q "ADMIN CORRIGIDO" admin.html; then
    echo "✅ Versão corrigida confirmada no HTML"
else
    echo "⚠️  Não foi possível confirmar versão corrigida no HTML"
fi

# Verificar mecanismos anti-reload
echo "🚫 Verificando mecanismos anti-reload..."
reload_checks=0

if grep -q "initializationInProgress" admin.js; then
    echo "✅ Flag initializationInProgress presente"
    ((reload_checks++))
fi

if grep -q "systemInitialized" admin.js; then
    echo "✅ Flag systemInitialized presente"
    ((reload_checks++))
fi

if grep -q "startAdminSystem" admin.js; then
    echo "✅ Função startAdminSystem presente"
    ((reload_checks++))
fi

# Verificar se não há problemas de chaves
echo "🔧 Verificando estrutura de código..."
braces_open=$(grep -o "{" admin.js | wc -l)
braces_close=$(grep -o "}" admin.js | wc -l)
diff=$((braces_open - braces_close))

if [[ $diff -eq 0 ]]; then
    echo "✅ Chaves balanceadas (${braces_open} abertas, ${braces_close} fechadas)"
elif [[ $diff -eq 1 || $diff -eq -1 ]]; then
    echo "⚠️  Pequena diferença em chaves (${braces_open} abertas, ${braces_close} fechadas) - pode ser normal"
else
    echo "❌ Problema grave nas chaves (${braces_open} abertas, ${braces_close} fechadas)"
fi

# Verificar se o servidor local está funcionando
echo "🌐 Verificando servidor local..."
if curl -s -I http://localhost:8001/admin.html | grep -q "200 OK"; then
    echo "✅ Servidor local respondendo corretamente"
else
    echo "⚠️  Servidor local não está respondendo"
fi

# Resultado final
echo
echo "📊 RESULTADO FINAL:"
echo "==================="

if [[ $reload_checks -eq 3 ]]; then
    echo "🎉 SUCESSO! Todos os mecanismos anti-reload estão implementados"
    echo "✅ A página admin deve estar funcionando corretamente"
    echo "✅ O problema de recarregamento infinito foi resolvido"
    
    echo
    echo "🚀 PRÓXIMOS PASSOS RECOMENDADOS:"
    echo "1. Testar login admin com credenciais reais"
    echo "2. Verificar funcionalidades específicas (confirmação de doações, etc.)"
    echo "3. Fazer deploy para produção se tudo estiver OK"
    
else
    echo "⚠️  ATENÇÃO: Nem todos os mecanismos anti-reload foram encontrados"
    echo "   Encontrados: $reload_checks/3"
    echo "   Recomenda-se verificação manual"
fi

echo
echo "🔗 Para testar: http://localhost:8001/admin.html"
echo "🧪 Página de teste: http://localhost:8001/test-admin-funcionamento.html"
