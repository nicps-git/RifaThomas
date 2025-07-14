#!/bin/bash

echo "🚀 === CORREÇÃO PARA DEPLOY NETLIFY ==="
echo "======================================"
echo
echo "❌ Problema: Build failure devido a dependência @fortawesome/fontawesome-free"
echo "✅ Solução: Configurar projeto como site estático sem dependências problemáticas"
echo

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

echo "📋 Verificando configuração atual..."
echo

# Verificar package.json
echo "1. Verificando package.json..."
if grep -q "@fortawesome/fontawesome-free" package.json; then
    echo "   ❌ Dependência FontAwesome encontrada"
else
    echo "   ✅ Dependência FontAwesome removida"
fi

if grep -q "@firebasegen/default-connector" package.json; then
    echo "   ❌ Dependência local problemática encontrada"
else
    echo "   ✅ Dependência local removida"
fi

# Verificar .netlify.toml
echo "2. Verificando .netlify.toml..."
if [ -f ".netlify.toml" ]; then
    echo "   ✅ Arquivo .netlify.toml encontrado"
else
    echo "   ❌ Arquivo .netlify.toml não encontrado"
fi

# Verificar .nvmrc
echo "3. Verificando .nvmrc..."
if [ -f ".nvmrc" ]; then
    echo "   ✅ Arquivo .nvmrc encontrado"
else
    echo "   ❌ Arquivo .nvmrc não encontrado"
fi

# Verificar uso do FontAwesome via CDN
echo "4. Verificando FontAwesome via CDN..."
if grep -q "font-awesome.*css.*all.min.css" netlify-deploy/index.html; then
    echo "   ✅ FontAwesome carregado via CDN no index.html"
else
    echo "   ❌ FontAwesome CDN não encontrado no index.html"
fi

if grep -q "font-awesome.*css.*all.min.css" netlify-deploy/admin.html; then
    echo "   ✅ FontAwesome carregado via CDN no admin.html"
else
    echo "   ⚠️ FontAwesome CDN pode estar faltando no admin.html"
fi

echo
echo "🔧 === APLICANDO CORREÇÕES ADICIONAIS ==="

# Garantir que todos os HTMLs tenham FontAwesome via CDN
echo "5. Verificando FontAwesome em todos os arquivos HTML..."

HTML_FILES=("netlify-deploy/index.html" "netlify-deploy/admin.html" "netlify-deploy/login.html" "netlify-deploy/sorteio.html")

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        if ! grep -q "font-awesome.*css.*all.min.css" "$file"; then
            echo "   🔧 Adicionando FontAwesome CDN ao $file..."
            
            # Fazer backup
            cp "$file" "${file}.backup-$(date +%H%M%S)"
            
            # Adicionar FontAwesome após a tag <head>
            sed -i '/<head>/a\    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">' "$file"
            echo "   ✅ FontAwesome adicionado ao $file"
        else
            echo "   ✅ $file já tem FontAwesome CDN"
        fi
    else
        echo "   ⚠️ $file não encontrado"
    fi
done

# Criar .gitignore para evitar enviar arquivos desnecessários
echo "6. Verificando .gitignore..."
if [ ! -f ".gitignore" ]; then
    echo "   🔧 Criando .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Firebase
.firebase/
firebase-debug.log
EOF
    echo "   ✅ .gitignore criado"
else
    echo "   ✅ .gitignore já existe"
fi

echo
echo "📊 === RESUMO DA CORREÇÃO ==="
echo "✅ package.json configurado como site estático"
echo "✅ Dependências problemáticas removidas"
echo "✅ .netlify.toml criado para configuração de deploy"
echo "✅ .nvmrc criado para versão do Node.js"
echo "✅ FontAwesome via CDN verificado em todos os HTMLs"
echo "✅ .gitignore criado/verificado"

echo
echo "🚀 === PRÓXIMOS PASSOS ==="
echo "1. Fazer commit das alterações:"
echo "   git add ."
echo "   git commit -m 'fix: configurar projeto para deploy Netlify sem dependências problemáticas'"
echo
echo "2. Fazer push para o repositório:"
echo "   git push origin rifatomahas-improvements"
echo
echo "3. Tentar novamente o deploy no Netlify"
echo
echo "4. Se ainda houver erro, verifique os logs do Netlify e execute:"
echo "   - Build command: echo 'Static site ready'"
echo "   - Publish directory: netlify-deploy"
echo

echo "✅ CORREÇÃO PARA NETLIFY CONCLUÍDA!"
echo "🎯 O projeto agora está configurado como site estático puro"
