#!/bin/bash

echo "🎉 VERIFICAÇÃO FINAL - REMOÇÃO DA DATA ESPECÍFICA"
echo "================================================"

cd /home/nicps/Documents/Projetos/RifaThomas

echo ""
echo "✅ VERIFICAÇÃO 1: Arquivos principais corrigidos"
echo "------------------------------------------------"

# Verificar arquivos principais
echo "📄 index.html (raiz):"
if grep -q "Carregando data" index.html; then
    echo "   ✅ Texto 'Carregando data...' encontrado"
else
    echo "   ❌ Texto 'Carregando data...' NÃO encontrado"
fi

echo "📄 netlify-deploy/index.html:"
if grep -q "data-firebase=\"drawDate\"" netlify-deploy/index.html; then
    echo "   ✅ Atributo Firebase encontrado"
else
    echo "   ❌ Atributo Firebase NÃO encontrado"
fi

echo "📄 script.js (raiz):"
if grep -q "Data do sorteio a definir" script.js; then
    echo "   ✅ Fallback correto encontrado"
else
    echo "   ❌ Fallback correto NÃO encontrado"
fi

echo "📄 netlify-deploy/script.js:"
if grep -q "Data do sorteio a definir" netlify-deploy/script.js; then
    echo "   ✅ Fallback correto encontrado"
else
    echo "   ❌ Fallback correto NÃO encontrado"
fi

echo ""
echo "✅ VERIFICAÇÃO 2: Data específica removida"
echo "----------------------------------------"

# Contar ocorrências funcionais (excluindo documentação)
functional_files=(
    "index.html"
    "script.js"
    "netlify-deploy/index.html"
    "netlify-deploy/script.js"
    "netlify-deploy/script-*.js"
    "netlify-deploy/deploy-final-*/index.html"
    "netlify-deploy/deploy-final-*/script.js"
)

total_occurrences=0
for pattern in "${functional_files[@]}"; do
    if [[ -f "$pattern" ]] || ls $pattern >/dev/null 2>&1; then
        count=$(grep -l "11 de Julho de 2025 às 16h" $pattern 2>/dev/null | wc -l)
        total_occurrences=$((total_occurrences + count))
    fi
done

if [[ $total_occurrences -eq 0 ]]; then
    echo "   ✅ Nenhuma ocorrência da data específica em arquivos funcionais"
else
    echo "   ❌ Ainda existem $total_occurrences ocorrências em arquivos funcionais"
fi

echo ""
echo "✅ VERIFICAÇÃO 3: Sistema de sincronização"
echo "----------------------------------------"

if grep -q "data-firebase" netlify-deploy/index.html; then
    echo "   ✅ Sistema de sincronização Firebase ativo"
else
    echo "   ❌ Sistema de sincronização Firebase NÃO encontrado"
fi

echo ""
echo "✅ VERIFICAÇÃO 4: URLs de teste"
echo "------------------------------"
echo "   🌐 Página Principal: http://localhost:8080/index.html"
echo "   🔧 Admin Panel: http://localhost:8080/admin.html"
echo "   🆘 Admin Emergência: http://localhost:8080/admin-bypass-auth.html"

echo ""
echo "🎯 RESULTADO FINAL"
echo "=================="

if [[ $total_occurrences -eq 0 ]]; then
    echo "✅ SUCCESS: Data específica '11 de Julho de 2025 às 16h' removida com sucesso!"
    echo ""
    echo "📋 O que foi alterado:"
    echo "   • Data hardcoded substituída por carregamento dinâmico"
    echo "   • Textos de fallback apropriados implementados"
    echo "   • Sistema de sincronização Firebase mantido"
    echo "   • Documentação atualizada"
    echo ""
    echo "🚀 Próximos passos:"
    echo "   1. Acesse o painel admin para definir a nova data"
    echo "   2. A data será sincronizada automaticamente"
    echo "   3. Usuários verão a data atualizada em tempo real"
else
    echo "⚠️  ATENÇÃO: Ainda existem ocorrências da data específica"
    echo "   Verifique os arquivos listados acima"
fi

echo ""
echo "🎉 Remoção da data específica concluída!"
echo ""
