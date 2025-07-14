#!/bin/bash

echo "🚀 === NETLIFY BUILD SCRIPT PARA SITE ESTÁTICO ==="
echo "Data: $(date)"
echo ""

# Verificar se estamos no diretório correto
echo "📂 Diretório atual: $(pwd)"
echo "📂 Conteúdo da raiz:"
ls -la

echo ""
echo "📂 Verificando netlify-deploy:"
if [ -d "netlify-deploy" ]; then
    echo "✅ Diretório netlify-deploy encontrado"
    echo "📄 Arquivos:"
    ls -la netlify-deploy/
else
    echo "❌ Diretório netlify-deploy não encontrado!"
    exit 1
fi

echo ""
echo "🔍 Verificando arquivos essenciais:"
required_files=(
    "netlify-deploy/index.html"
    "netlify-deploy/admin.html"
    "netlify-deploy/script.js"
    "netlify-deploy/admin.js"
    "netlify-deploy/firebase-config.js"
    "netlify-deploy/styles.css"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file AUSENTE"
        exit 1
    fi
done

echo ""
echo "✅ === BUILD CONCLUÍDO COM SUCESSO ==="
echo "Site estático pronto para deploy!"
echo "Publish directory: netlify-deploy"
