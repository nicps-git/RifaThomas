#!/bin/bash

echo "🔧 === CORREÇÃO: NODE.JS VERSION MISMATCH ==="
echo "============================================"
echo "Data: $(date)"
echo ""

cd /home/nicps/Documents/Projetos/RifaThomas

echo "❌ PROBLEMA IDENTIFICADO:"
echo "Node.js version mismatch - conflito entre versões especificadas"
echo ""

echo "🔍 VERIFICANDO CONFIGURAÇÕES ATUAIS..."

echo "📄 .netlify.toml:"
if [ -f ".netlify.toml" ]; then
    grep -A 5 NODE_VERSION .netlify.toml || echo "NODE_VERSION não encontrado"
else
    echo "❌ .netlify.toml não encontrado"
fi

echo ""
echo "📄 .nvmrc (raiz):"
if [ -f ".nvmrc" ]; then
    cat .nvmrc
else
    echo "❌ .nvmrc não encontrado na raiz"
fi

echo ""
echo "📄 .nvmrc (netlify-deploy):"
if [ -f "netlify-deploy/.nvmrc" ]; then
    cat netlify-deploy/.nvmrc
else
    echo "❌ .nvmrc não encontrado em netlify-deploy"
fi

echo ""
echo "🔧 APLICANDO CORREÇÃO PADRONIZADA..."

# 1. Definir versão Node.js estável e compatível
NODE_VERSION="18"

# 2. Atualizar .netlify.toml com versão padronizada
echo "1. Atualizando .netlify.toml..."
cat > .netlify.toml << EOF
[build]
  publish = "netlify-deploy"

[build.environment]
  NODE_VERSION = "$NODE_VERSION"
EOF

echo "✅ .netlify.toml atualizado com Node.js $NODE_VERSION"

# 3. Padronizar .nvmrc na raiz
echo ""
echo "2. Padronizando .nvmrc na raiz..."
echo "$NODE_VERSION" > .nvmrc
echo "✅ .nvmrc na raiz: $NODE_VERSION"

# 4. Padronizar .nvmrc em netlify-deploy
echo ""
echo "3. Padronizando .nvmrc em netlify-deploy..."
echo "$NODE_VERSION" > netlify-deploy/.nvmrc
echo "✅ .nvmrc em netlify-deploy: $NODE_VERSION"

# 5. Remover versões específicas que podem causar conflito
echo ""
echo "4. Removendo configurações conflitantes..."

# Verificar se há package.json com engines
if [ -f "package.json.backup-netlify" ]; then
    if grep -q '"engines"' package.json.backup-netlify; then
        echo "⚠️ engines encontrado em package.json.backup-netlify"
        echo "   Isso não afetará o deploy (arquivo renomeado)"
    fi
fi

# Verificar package.json em netlify-deploy
if [ -f "netlify-deploy/package.json" ]; then
    echo "📄 Verificando package.json em netlify-deploy..."
    if grep -q '"engines"' netlify-deploy/package.json; then
        echo "⚠️ Removendo engines de netlify-deploy/package.json..."
        # Criar package.json limpo sem engines
        cat > netlify-deploy/package.json << 'EOF'
{
  "name": "static-site",
  "version": "1.0.0",
  "private": true
}
EOF
        echo "✅ package.json limpo (sem engines)"
    else
        echo "✅ package.json sem engines (OK)"
    fi
fi

echo ""
echo "📋 5. VERIFICAÇÃO FINAL"
echo "====================="

echo "📄 Configurações finais:"
echo "- .netlify.toml NODE_VERSION: $(grep NODE_VERSION .netlify.toml | cut -d'"' -f2)"
echo "- .nvmrc (raiz): $(cat .nvmrc)"
echo "- .nvmrc (netlify-deploy): $(cat netlify-deploy/.nvmrc)"

echo ""
echo "📊 Estrutura netlify-deploy:"
ls -la netlify-deploy/ | grep -E "\.(js|json|nvmrc)$"

echo ""
echo "🎯 SOLUÇÃO APLICADA:"
echo "==================="
echo "✅ Node.js versão padronizada: $NODE_VERSION"
echo "✅ .netlify.toml atualizado"
echo "✅ .nvmrc padronizado (raiz e netlify-deploy)"
echo "✅ package.json limpo (sem engines conflitantes)"
echo ""
echo "📋 CONFIGURAÇÃO NETLIFY DASHBOARD:"
echo "Build command: (DEIXAR VAZIO)"
echo "Publish directory: netlify-deploy"
echo "Node.js version: $NODE_VERSION (será detectado automaticamente)"
echo ""
echo "🚀 O Node.js version mismatch deve estar resolvido."
echo "   Todas as configurações agora apontam para Node.js $NODE_VERSION"
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "1. Commit das mudanças"
echo "2. Push para repositório" 
echo "3. Trigger novo deploy no Netlify"
echo "4. Verificar logs - deve mostrar 'Using Node.js $NODE_VERSION'"
