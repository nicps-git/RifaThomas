#!/bin/bash

echo "🚨 === SOLUÇÃO DEFINITIVA: NETLIFY UBUNTU 14.04 ==="
echo "================================================"
echo "PROBLEMA: Netlify continua usando Ubuntu 14.04 mesmo com .netlify.toml"
echo "CAUSA: Configuração antiga cached no Netlify"
echo ""

cd /home/nicps/Documents/Projetos/RifaThomas

echo "🔧 APLICANDO SOLUÇÃO DEFINITIVA..."
echo ""

echo "1. Removendo todos os arquivos que podem causar conflito..."
# Remover completamente qualquer vestígio de Node.js/npm da raiz
rm -f package.json.backup-netlify 2>/dev/null || true
rm -f package-lock.json.backup-netlify 2>/dev/null || true
rm -f .nvmrc 2>/dev/null || true
rm -f netlify.toml 2>/dev/null || true

echo "✅ Arquivos conflitantes removidos da raiz"

echo ""
echo "2. Criando configuração FORÇA BRUTA do Netlify..."

# Criar .netlify.toml com configuração mais assertiva
cat > .netlify.toml << 'EOF'
[build]
  publish = "netlify-deploy"
  command = "echo 'Deploy static files only - no build needed'"

[build.environment]
  NODE_VERSION = "18.19.0"
  NETLIFY_BUILD_IMAGE = "focal"
  NODE_ENV = "production"
  DISABLE_YARN_INSTALL = "true"
  SKIP_YARN_INSTALL = "true"
  NPM_CONFIG_PRODUCTION = "false"

[build.processing]
  skip_processing = false
EOF

echo "✅ .netlify.toml criado com configuração força bruta"

echo ""
echo "3. Criando package.json ULTRA MINIMALISTA em netlify-deploy..."
cat > netlify-deploy/package.json << 'EOF'
{
  "private": true
}
EOF

echo "✅ package.json ultra minimalista criado"

echo ""
echo "4. Removendo arquivos desnecessários de netlify-deploy..."
cd netlify-deploy
rm -f .nvmrc 2>/dev/null || true
rm -f netlify.toml 2>/dev/null || true
cd ..

echo "✅ Arquivos desnecessários removidos de netlify-deploy"

echo ""
echo "5. Criando script de build vazio (para forçar build image moderna)..."
cat > build.sh << 'EOF'
#!/bin/bash
echo "Static site - no build needed"
echo "Node.js version: $(node --version)"
echo "Build completed successfully"
EOF
chmod +x build.sh

echo "✅ Script de build vazio criado"

echo ""
echo "6. Atualizando .netlify.toml para usar script de build..."
cat > .netlify.toml << 'EOF'
[build]
  publish = "netlify-deploy"
  command = "./build.sh"

[build.environment]
  NODE_VERSION = "18.19.0"
  NETLIFY_BUILD_IMAGE = "focal"
  NODE_ENV = "production"
EOF

echo "✅ .netlify.toml atualizado com script de build"

echo ""
echo "📋 VERIFICAÇÃO FINAL:"
echo "==================="

echo "Estrutura netlify-deploy:"
ls -la netlify-deploy/ | grep -E '\.(html|js|css)$'

echo ""
echo "Conteúdo .netlify.toml:"
cat .netlify.toml

echo ""
echo "🎯 INSTRUÇÕES CRÍTICAS PARA RESOLVER DEFINITIVAMENTE:"
echo "===================================================="
echo ""
echo "1. **DELETE O SITE COMPLETAMENTE DO NETLIFY E RECRIE:**"
echo "   - Vá em Site Settings > General > Danger zone"
echo "   - Delete site"
echo "   - Crie um novo site do zero"
echo ""
echo "2. **AO CRIAR O NOVO SITE:**"
echo "   - Repository: rifatomahas-improvements branch"
echo "   - Build command: ./build.sh"
echo "   - Publish directory: netlify-deploy"
echo ""
echo "3. **ENVIRONMENT VARIABLES (obrigatório):**"
echo "   - NODE_VERSION = 18.19.0"
echo "   - NETLIFY_BUILD_IMAGE = focal"
echo ""
echo "4. **BUILD IMAGE SELECTION:**"
echo "   - DEVE selecionar 'Ubuntu Focal 20.04'"
echo ""
echo "💡 A recriação do site força o Netlify a usar configurações modernas"
echo "   e elimina qualquer cache de configuração antiga (Ubuntu 14.04)"

echo ""
echo "🚀 ALTERNATIVA RÁPIDA:"
echo "===================="
echo "Se não quiser recriar o site, vá em:"
echo "Site Settings > Build & Deploy > Build image selection"
echo "E FORCE a seleção para 'Ubuntu Focal 20.04 (default)'"
