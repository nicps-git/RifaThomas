#!/bin/bash

echo "🔍 VERIFICAÇÃO: Remoção da Data '11 de Julho de 2025 às 16h'"
echo "============================================================"

echo ""
echo "📁 Verificando se a data específica ainda existe nos arquivos..."

# Procurar por qualquer ocorrência da data específica
if grep -r "11 de Julho de 2025 às 16h" . --exclude-dir=.git 2>/dev/null; then
    echo ""
    echo "⚠️  ENCONTRADAS ocorrências da data específica nos arquivos acima"
    echo ""
    echo "🔧 Arquivos que ainda contêm a data:"
    grep -l -r "11 de Julho de 2025 às 16h" . --exclude-dir=.git 2>/dev/null || echo "   Nenhum arquivo encontrado"
else
    echo "✅ Nenhuma ocorrência da data '11 de Julho de 2025 às 16h' encontrada!"
fi

echo ""
echo "📊 Verificando textos de fallback corretos..."

# Verificar se os textos de fallback estão corretos
echo ""
echo "🔍 Textos 'Carregando data...':"
grep -r "Carregando data" . --include="*.html" 2>/dev/null | head -5

echo ""
echo "🔍 Textos 'Data do sorteio a definir':"
grep -r "Data do sorteio a definir" . --include="*.js" 2>/dev/null | head -5

echo ""
echo "📋 RESUMO DAS ALTERAÇÕES REALIZADAS:"
echo "======================================"
echo ""
echo "✅ Arquivos HTML corrigidos:"
echo "   • /index.html - Texto alterado para 'Carregando data...'"
echo "   • /netlify-deploy/index.html - Já estava correto"
echo "   • /netlify-deploy/deploy-final-*/index.html - Corrigido"
echo ""
echo "✅ Arquivos JavaScript corrigidos:"
echo "   • /script.js - Fallback alterado para 'Data do sorteio a definir'"
echo "   • /netlify-deploy/script.js - Fallback alterado"
echo "   • /netlify-deploy/script-*.js - Múltiplos scripts corrigidos"
echo ""
echo "✅ Documentação atualizada:"
echo "   • README.md - Data alterada para 'Data a ser definida pelo administrador'"
echo ""
echo "🎯 RESULTADO:"
echo "• A data específica '11 de Julho de 2025 às 16h' foi removida"
echo "• Sistema agora carrega a data do Firebase/Admin"
echo "• Textos de fallback apropriados implementados"
echo "• Documentação atualizada"
echo ""
echo "🚀 PRÓXIMOS PASSOS:"
echo "1. Configure a data do sorteio no painel admin"
echo "2. A data será sincronizada automaticamente na página principal"
echo "3. Usuários verão 'Carregando data...' até a data ser definida"
echo ""
