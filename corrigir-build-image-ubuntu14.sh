#!/bin/bash

echo "🔄 === CORREÇÃO CRITICAL: BUILD IMAGE UBUNTU 14.04 ==="
echo "=================================================="
echo "PROBLEMA: Netlify ainda está usando Ubuntu 14.04 (Trusty Tahr)"
echo "SOLUÇÃO: Forçar build image moderna"
echo ""

cd /home/nicps/Documents/Projetos/RifaThomas

echo "1. Atualizando .netlify.toml com build image explícita..."
cat > .netlify.toml << 'EOF'
[build]
  publish = "netlify-deploy"
  command = ""

[build.environment]
  NODE_VERSION = "18"
  NETLIFY_BUILD_IMAGE = "focal"
  
[build.processing]
  skip_processing = false
EOF

echo "✅ .netlify.toml atualizado com build image focal"

echo ""
echo "2. Criando netlify.toml alternativo (caso o .netlify.toml não funcione)..."
cp .netlify.toml netlify.toml
echo "✅ netlify.toml criado"

echo ""
echo "3. Verificando configuração no diretório de deploy..."
cat > netlify-deploy/netlify.toml << 'EOF'
[build]
  publish = "."
  command = ""

[build.environment]
  NODE_VERSION = "18"
  NETLIFY_BUILD_IMAGE = "focal"
EOF

echo "✅ netlify.toml criado em netlify-deploy/"

echo ""
echo "4. Criando _headers para forçar configurações modernas..."
cat > netlify-deploy/_headers << 'EOF'
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
EOF

echo "✅ _headers criado"

echo ""
echo "5. Atualizando _redirects para garantir compatibilidade..."
cat > netlify-deploy/_redirects << 'EOF'
/admin /admin.html 200
/login /login.html 200
/sorteio /sorteio.html 200
/* /index.html 200
EOF

echo "✅ _redirects atualizado"

echo ""
echo "📋 CONFIGURAÇÕES APLICADAS:"
echo "========================="
echo "Build Image: Ubuntu 20.04 Focal (moderna)"
echo "Node.js: 18"
echo "Publish: netlify-deploy"
echo "Build command: (vazio)"
echo ""
echo "Arquivos de configuração criados:"
echo "- .netlify.toml (raiz)"
echo "- netlify.toml (raiz - backup)"
echo "- netlify-deploy/netlify.toml"
echo "- netlify-deploy/_headers"
echo "- netlify-deploy/_redirects (atualizado)"

echo ""
echo "🎯 INSTRUÇÕES IMPORTANTES PARA O NETLIFY:"
echo "======================================="
echo "1. Vá para: Site Settings > Build & Deploy > Continuous Deployment"
echo "2. Em 'Build settings':"
echo "   - Build command: (deixe VAZIO)"
echo "   - Publish directory: netlify-deploy"
echo ""
echo "3. Em 'Environment variables', adicione:"
echo "   - NODE_VERSION = 18"
echo "   - NETLIFY_BUILD_IMAGE = focal"
echo ""
echo "4. IMPORTANTE: Se ainda der erro, vá em:"
echo "   Site Settings > Build & Deploy > Build image selection"
echo "   E selecione: 'Ubuntu Focal 20.04 (default)'"

echo ""
echo "🚀 DEPLOY AGORA - Build image forçada para Ubuntu 20.04!"
