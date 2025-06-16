#!/bin/bash

echo "🔍 Verificação Específica - Casos sem Botões"
echo "============================================="

cd /home/nicps/Documents/Projetos/RifaThomas/netlify-deploy

# Verificar se o arquivo debug foi criado
if [[ -f "debug-casos-especificos.html" ]]; then
    echo "✅ Arquivo debug-casos-especificos.html criado com sucesso"
else
    echo "❌ Erro: Arquivo debug não encontrado"
    exit 1
fi

# Abrir a página de debug no navegador
echo "🌐 Abrindo página de debug específico..."
if command -v xdg-open &> /dev/null; then
    xdg-open "debug-casos-especificos.html"
elif command -v open &> /dev/null; then
    open "debug-casos-especificos.html"
else
    echo "⚠️  Não foi possível abrir automaticamente. Abra manualmente:"
    echo "   file://$(pwd)/debug-casos-especificos.html"
fi

echo ""
echo "📋 INSTRUÇÕES:"
echo "1. Na página aberta, clique em 'Analisar Casos Problemáticos'"
echo "2. Verifique se há doações sem botões na seção vermelha"
echo "3. Compare com as doações com botões na seção verde"
echo "4. Use 'Comparar Casos' para ver diferenças específicas"
echo "5. Use 'Testar Lógica dos Botões' para validar a função"
echo ""
echo "🎯 Esta análise vai mostrar EXATAMENTE:"
echo "   - Quais registros não têm botões e por quê"
echo "   - Campos problemáticos em cada caso"
echo "   - Comparação direta entre casos funcionais e não funcionais"
echo "   - Teste da lógica de detecção com casos controlados"
echo ""
echo "✅ Verificação iniciada!"
