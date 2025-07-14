#!/bin/bash

echo "🔧 === CORREÇÃO: UNSUPPORTED BUILD IMAGE (Ubuntu 14.04) ==="
echo "========================================================="
echo "Data: $(date)"
echo ""

cd /home/nicps/Documents/Projetos/RifaThomas

echo "❌ PROBLEMA IDENTIFICADO:"
echo "Netlify está tentando usar Ubuntu 14.04 Trusty Tahr (não suportado)"
echo ""

echo "🔧 APLICANDO CORREÇÕES..."

# 1. Configuração .netlify.toml moderna
echo "1. Atualizando .netlify.toml para build image moderna..."
cat > .netlify.toml << 'EOF'
[build]
  publish = "netlify-deploy"

[build.environment]
  NODE_VERSION = "18"
EOF

echo "✅ .netlify.toml atualizado (configuração mínima moderna)"

# 2. Verificar e corrigir package.json se necessário
echo ""
echo "2. Verificando package.json em netlify-deploy..."
if [ ! -f "netlify-deploy/package.json" ]; then
    cat > netlify-deploy/package.json << 'EOF'
{
  "name": "static-site",
  "version": "1.0.0",
  "private": true
}
EOF
    echo "✅ package.json criado em netlify-deploy"
else
    echo "✅ package.json já existe em netlify-deploy"
fi

# 3. Remover qualquer arquivo que possa estar forçando build image antiga
echo ""
echo "3. Verificando arquivos que podem forçar build image antiga..."

# Verificar se existe .nvmrc na raiz (pode conflitar)
if [ -f ".nvmrc" ]; then
    echo "📄 .nvmrc na raiz encontrado: $(cat .nvmrc)"
    echo "   Mantendo para compatibilidade"
else
    echo "18" > .nvmrc
    echo "✅ .nvmrc criado na raiz com Node 18"
fi

# 4. Garantir que não há configurações conflitantes
echo ""
echo "4. Verificando configurações conflitantes..."

# Remover qualquer runtime.txt ou similar
if [ -f "runtime.txt" ]; then
    mv runtime.txt runtime.txt.backup
    echo "✅ runtime.txt movido para backup"
fi

# Verificar se há alguma configuração Python que possa interferir
if [ -f "requirements.txt" ]; then
    mv requirements.txt requirements.txt.backup
    echo "✅ requirements.txt movido para backup"
fi

# 5. Verificar estrutura final
echo ""
echo "5. ESTRUTURA FINAL:"
echo "=================="
echo "📁 Conteúdo netlify-deploy:"
ls -la netlify-deploy/

echo ""
echo "📄 .netlify.toml:"
cat .netlify.toml

echo ""
echo "📄 package.json em netlify-deploy:"
cat netlify-deploy/package.json

echo ""
echo "🎯 SOLUÇÃO APLICADA:"
echo "==================="
echo "✅ Configuração .netlify.toml modernizada"
echo "✅ Node.js 18 especificado"
echo "✅ Configuração mínima (sem flags problemáticos)"
echo "✅ Package.json limpo em netlify-deploy"
echo ""
echo "📋 CONFIGURAÇÃO NETLIFY DASHBOARD:"
echo "Build command: (DEIXAR VAZIO)"
echo "Publish directory: netlify-deploy"
echo "Node.js version: 18"
echo ""
echo "🚀 O erro 'UNSUPPORTED BUILD IMAGE' deve estar resolvido."
echo "   Netlify agora usará uma imagem de build moderna automaticamente."
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "1. Commit das mudanças"
echo "2. Push para repositório"
echo "3. Trigger novo deploy no Netlify"
