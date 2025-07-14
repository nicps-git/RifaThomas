#!/bin/bash

echo "🚀 === VALIDAÇÃO FINAL ANTES DO DEPLOY NETLIFY ==="
echo "================================================="

cd /home/nicps/Documents/Projetos/RifaThomas

echo ""
echo "✅ 1. ESTRUTURA DO PROJETO"
echo "Arquivos em netlify-deploy: $(ls netlify-deploy/ | wc -l)"
if [ "$(ls netlify-deploy/ | wc -l)" -eq 11 ]; then
    echo "✅ Quantidade correta de arquivos (11)"
else
    echo "❌ Quantidade incorreta de arquivos"
    exit 1
fi

echo ""
echo "✅ 2. ARQUIVOS ESSENCIAIS"
required_files=(
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

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file AUSENTE"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo "❌ Arquivos essenciais ausentes!"
    exit 1
fi

echo ""
echo "✅ 3. CONFIGURAÇÕES NETLIFY"
if [ -f ".netlify.toml" ]; then
    echo "✅ .netlify.toml existe"
    if grep -q 'publish = "netlify-deploy"' .netlify.toml; then
        echo "✅ Publish directory configurado"
    else
        echo "❌ Publish directory incorreto"
    fi
else
    echo "❌ .netlify.toml ausente"
    exit 1
fi

if [ -f ".nvmrc" ]; then
    echo "✅ .nvmrc existe"
else
    echo "❌ .nvmrc ausente"
fi

echo ""
echo "✅ 4. SINTAXE JAVASCRIPT"
syntax_ok=true
for jsfile in netlify-deploy/*.js; do
    if [ -f "$jsfile" ]; then
        if node -c "$jsfile" 2>/dev/null; then
            echo "✅ $(basename $jsfile)"
        else
            echo "❌ $(basename $jsfile) - ERRO DE SINTAXE"
            syntax_ok=false
        fi
    fi
done

if [ "$syntax_ok" = false ]; then
    echo "❌ Erros de sintaxe encontrados!"
    exit 1
fi

echo ""
echo "✅ 5. GIT STATUS"
if git status --porcelain | grep -q .; then
    echo "❌ Há mudanças não commitadas"
    echo "Execute: git add . && git commit -m 'Deploy final' && git push"
    exit 1
else
    echo "✅ Repositório limpo"
fi

echo ""
echo "🎉 === VALIDAÇÃO CONCLUÍDA COM SUCESSO ==="
echo "=========================================="
echo ""
echo "🚀 PRONTO PARA DEPLOY NO NETLIFY!"
echo ""
echo "📋 Configurações para o Netlify Dashboard:"
echo "  Build command: echo 'Static site - no build needed'"
echo "  Publish directory: netlify-deploy"
echo "  Node.js version: 18"
echo ""
echo "🔗 Após o deploy, testar:"
echo "  - Site principal"
echo "  - Página admin (/admin)"
echo "  - Login (/login)"
echo "  - Sorteio (/sorteio)"
echo ""
echo "✅ Tudo validado e pronto!"
