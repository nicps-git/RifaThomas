#!/bin/bash

echo "🧪 Testando sincronização de contatos - Workflow completo"
echo "============================================================="

# Navegar para o diretório correto
cd /home/nicps/Documents/Projetos/RifaThomas/netlify-deploy

echo ""
echo "📋 Verificando arquivos necessários..."

# Verificar se os arquivos existem
files=("index.html" "admin.html" "admin.js" "script.js" "firebase-config.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANDO"
    fi
done

echo ""
echo "🔍 Verificando elementos de sincronização..."

# Verificar data attributes na página principal
echo "📄 Verificando index.html:"
if grep -q "data-contact-phone" index.html; then
    echo "  ✅ data-contact-phone encontrado"
else
    echo "  ❌ data-contact-phone NÃO encontrado"
fi

if grep -q "data-contact-email" index.html; then
    echo "  ✅ data-contact-email encontrado"
else
    echo "  ❌ data-contact-email NÃO encontrado"
fi

if grep -q "data-pix-key" index.html; then
    echo "  ✅ data-pix-key encontrado"
else
    echo "  ❌ data-pix-key NÃO encontrado"
fi

echo ""
echo "⚙️ Verificando admin.html:"
if grep -q "config-contact-email" admin.html; then
    echo "  ✅ Campo config-contact-email encontrado"
else
    echo "  ❌ Campo config-contact-email NÃO encontrado"
fi

echo ""
echo "🔧 Verificando admin.js:"
if grep -q "contactEmail" admin.js; then
    echo "  ✅ Referências a contactEmail encontradas"
else
    echo "  ❌ Referências a contactEmail NÃO encontradas"
fi

echo ""
echo "⚡ Verificando script.js:"
if grep -q "applyConfigurationToUI" script.js; then
    echo "  ✅ Função applyConfigurationToUI encontrada"
else
    echo "  ❌ Função applyConfigurationToUI NÃO encontrada"
fi

if grep -q "data-contact-email" script.js; then
    echo "  ✅ Sincronização de email implementada"
else
    echo "  ❌ Sincronização de email NÃO implementada"
fi

echo ""
echo "📊 Resumo da Validação:"
echo "============================================================="

# Contar sucessos
success_count=0
total_checks=7

# Verificações
checks=()
if grep -q "data-contact-phone" index.html; then ((success_count++)); fi
if grep -q "data-contact-email" index.html; then ((success_count++)); fi
if grep -q "data-pix-key" index.html; then ((success_count++)); fi
if grep -q "config-contact-email" admin.html; then ((success_count++)); fi
if grep -q "contactEmail" admin.js; then ((success_count++)); fi
if grep -q "applyConfigurationToUI" script.js; then ((success_count++)); fi
if grep -q "data-contact-email" script.js; then ((success_count++)); fi

echo "✅ Verificações passadas: $success_count/$total_checks"

if [ $success_count -eq $total_checks ]; then
    echo "🎉 TODOS OS TESTES PASSARAM! Sincronização implementada corretamente."
    echo ""
    echo "🔄 Próximos passos para testar:"
    echo "  1. Abrir admin.html no navegador"
    echo "  2. Alterar telefone, email e PIX"
    echo "  3. Salvar configuração"
    echo "  4. Verificar se mudanças aparecem em index.html"
    echo ""
else
    echo "⚠️ Alguns testes falharam. Verifique os itens marcados com ❌"
fi

echo ""
echo "📂 Arquivos de teste disponíveis:"
echo "  - test-contact-sync.html (teste básico)"
echo "  - validate-contact-sync.html (validação completa)"
echo ""
echo "🌐 Para abrir no navegador:"
echo "  - file://$(pwd)/admin.html"
echo "  - file://$(pwd)/index.html"
echo "  - file://$(pwd)/validate-contact-sync.html"
