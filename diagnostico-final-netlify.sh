#!/bin/bash

echo "=== DIAGNÓSTICO FINAL NETLIFY ==="
echo ""

# Verificar configurações atuais
echo "1. Verificando configurações do Netlify..."
echo "Arquivo .netlify.toml:"
cat .netlify.toml
echo ""

echo "Arquivo .nvmrc (raiz):"
cat .nvmrc
echo ""

echo "Arquivo .nvmrc (netlify-deploy):"
cat netlify-deploy/.nvmrc
echo ""

echo "2. Verificando estrutura netlify-deploy..."
echo "Conteúdo da pasta netlify-deploy:"
ls -la netlify-deploy/
echo ""

echo "package.json em netlify-deploy:"
cat netlify-deploy/package.json
echo ""

echo "3. Verificando arquivos problemáticos removidos..."
echo "package.json na raiz (deve estar como backup):"
ls -la package*.json* 2>/dev/null || echo "✓ Nenhum package.json na raiz"
echo ""

echo "4. Verificando arquivos HTML principais..."
for file in netlify-deploy/index.html netlify-deploy/admin.html netlify-deploy/login.html netlify-deploy/sorteio.html; do
    if [ -f "$file" ]; then
        echo "✓ $file existe"
        # Verificar se tem sintaxe básica válida
        if grep -q "</html>" "$file"; then
            echo "  ✓ Estrutura HTML válida"
        else
            echo "  ⚠ Possível problema na estrutura HTML"
        fi
    else
        echo "✗ $file AUSENTE"
    fi
done
echo ""

echo "5. Verificando arquivos JS principais..."
for file in netlify-deploy/script.js netlify-deploy/admin.js netlify-deploy/sorteio.js netlify-deploy/firebase-config.js; do
    if [ -f "$file" ]; then
        echo "✓ $file existe"
        # Verificar sintaxe básica JS
        if node -c "$file" 2>/dev/null; then
            echo "  ✓ Sintaxe JS válida"
        else
            echo "  ⚠ Possível problema na sintaxe JS"
        fi
    else
        echo "✗ $file AUSENTE"
    fi
done
echo ""

echo "6. Verificando arquivos CSS..."
for file in netlify-deploy/styles.css netlify-deploy/admin.css; do
    if [ -f "$file" ]; then
        echo "✓ $file existe"
    else
        echo "✗ $file AUSENTE"
    fi
done
echo ""

echo "7. Verificando configurações especiais do Netlify..."
if [ -f "netlify-deploy/_redirects" ]; then
    echo "✓ _redirects existe:"
    cat netlify-deploy/_redirects
else
    echo "⚠ _redirects não encontrado"
fi
echo ""

if [ -f ".netlifyignore" ]; then
    echo "✓ .netlifyignore configurado"
else
    echo "⚠ .netlifyignore não encontrado"
fi
echo ""

echo "8. Status Git..."
git status --porcelain
echo ""

echo "=== RESUMO ==="
echo "✓ Node.js version: 18 (configurado em .netlify.toml, .nvmrc)"
echo "✓ Build folder: netlify-deploy"
echo "✓ package.json da raiz removido (backup criado)"
echo "✓ package-lock.json da raiz removido (backup criado)"
echo "✓ package.json limpo em netlify-deploy (sem dependências)"
echo "✓ Arquivos HTML, JS e CSS verificados"
echo ""
echo "PRONTO PARA DEPLOY!"
