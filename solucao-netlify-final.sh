#!/bin/bash

echo "✅ === SOLUÇÃO FINAL NETLIFY - ULTRA SIMPLES ==="
echo "Data: $(date)"
echo ""

cd /home/nicps/Documents/Projetos/RifaThomas

echo "🔧 Aplicando configuração ultra-simples para Netlify..."

# 1. Configuração .netlify.toml mínima
cat > .netlify.toml << 'EOF'
[build]
  publish = "netlify-deploy"

[build.environment]
  NODE_VERSION = "18"
EOF

echo "✅ .netlify.toml atualizado (configuração mínima)"

# 2. Verificar se todos os arquivos essenciais existem
echo ""
echo "🔍 Verificando arquivos essenciais..."
files=(
    "netlify-deploy/index.html"
    "netlify-deploy/admin.html"
    "netlify-deploy/login.html"
    "netlify-deploy/sorteio.html"
    "netlify-deploy/styles.css"
    "netlify-deploy/admin.css"
    "netlify-deploy/script.js"
    "netlify-deploy/admin.js"
    "netlify-deploy/sorteio.js"
    "netlify-deploy/firebase-config.js"
    "netlify-deploy/_redirects"
)

all_good=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file AUSENTE"
        all_good=false
    fi
done

if [ "$all_good" = true ]; then
    echo ""
    echo "✅ Todos os arquivos essenciais presentes!"
else
    echo ""
    echo "❌ Alguns arquivos essenciais estão ausentes!"
    exit 1
fi

# 3. Verificar sintaxe JavaScript
echo ""
echo "🔍 Verificando sintaxe JavaScript..."
for jsfile in netlify-deploy/*.js; do
    if [ -f "$jsfile" ]; then
        filename=$(basename "$jsfile")
        if node -c "$jsfile" 2>/dev/null; then
            echo "✅ $filename"
        else
            echo "❌ $filename - ERRO DE SINTAXE"
            all_good=false
        fi
    fi
done

# 4. Contar arquivos finais
echo ""
echo "📊 Estrutura final:"
echo "Total de arquivos: $(ls netlify-deploy/ | wc -l)"
ls -la netlify-deploy/

if [ "$all_good" = true ]; then
    echo ""
    echo "🎉 === CONFIGURAÇÃO APLICADA COM SUCESSO ==="
    echo "============================================"
    echo ""
    echo "📋 Configuração Netlify Dashboard:"
    echo "Build command: (deixar vazio - será detectado automaticamente)"
    echo "Publish directory: netlify-deploy"
    echo "Node.js version: 18"
    echo ""
    echo "🚀 Pronto para deploy!"
else
    echo ""
    echo "❌ Corrija os problemas identificados antes do deploy"
    exit 1
fi
