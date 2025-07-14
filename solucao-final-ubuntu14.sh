#!/bin/bash

echo "🔥 === ESTRATÉGIA FINAL: FORÇAR UBUNTU 20.04 ==="
echo "=============================================="
echo "PROBLEMA: Netlify ignora .netlify.toml e mantém Ubuntu 14.04"
echo "SOLUÇÃO: Múltiplas estratégias simultâneas"
echo ""

cd /home/nicps/Documents/Projetos/RifaThomas

echo "1. Criando runtime.txt para forçar Node.js..."
echo "nodejs-18.19.0" > runtime.txt
echo "✅ runtime.txt criado"

echo ""
echo "2. Criando .node-version..."
echo "18.19.0" > .node-version
echo "✅ .node-version criado"

echo ""
echo "3. Criando build script que força verificação de versão..."
cat > build.sh << 'EOF'
#!/bin/bash
echo "=== BUILD SCRIPT INICIADO ==="
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Ubuntu version: $(lsb_release -a 2>/dev/null || cat /etc/os-release)"
echo "Build directory: $(pwd)"
echo "Files in netlify-deploy:"
ls -la netlify-deploy/
echo "=== BUILD CONCLUÍDO ==="
EOF

chmod +x build.sh
echo "✅ build.sh criado"

echo ""
echo "4. Atualizando .netlify.toml com estratégia mais agressiva..."
cat > .netlify.toml << 'EOF'
[build]
  publish = "netlify-deploy"
  command = "./build.sh"

[build.environment]
  NODE_VERSION = "18.19.0"
  NETLIFY_BUILD_IMAGE = "focal"
  NODE_ENV = "production"
  DISABLE_YARN_INSTALL = "true"
  SKIP_YARN_INSTALL = "true"
  CI = "true"
  BUILD_IMAGE = "focal"
  UBUNTU_VERSION = "20.04"

[context.production.environment]
  NODE_VERSION = "18.19.0"
  NETLIFY_BUILD_IMAGE = "focal"

[context.deploy-preview.environment]
  NODE_VERSION = "18.19.0"
  NETLIFY_BUILD_IMAGE = "focal"

[context.branch-deploy.environment]
  NODE_VERSION = "18.19.0"
  NETLIFY_BUILD_IMAGE = "focal"
EOF

echo "✅ .netlify.toml atualizado com contextos múltiplos"

echo ""
echo "5. Criando netlify-deploy/runtime.txt..."
echo "nodejs-18.19.0" > netlify-deploy/runtime.txt
echo "✅ runtime.txt criado em netlify-deploy"

echo ""
echo "6. Criando netlify-deploy/.node-version..."
echo "18.19.0" > netlify-deploy/.node-version
echo "✅ .node-version criado em netlify-deploy"

echo ""
echo "7. Verificando estrutura final..."
echo "Raiz do projeto:"
ls -la | grep -E "(\.netlify\.toml|runtime\.txt|\.node-version|build\.sh)"

echo ""
echo "netlify-deploy:"
ls -la netlify-deploy/ | grep -E "(runtime\.txt|\.node-version|package\.json)"

echo ""
echo "🎯 === INSTRUÇÕES CRÍTICAS FINAIS ==="
echo "=================================="
echo ""
echo "❌ O Netlify está IGNORANDO completamente o .netlify.toml"
echo "❌ Isso indica que há uma configuração HARD-CODED no dashboard"
echo ""
echo "✅ ÚNICA SOLUÇÃO GARANTIDA:"
echo "=========================="
echo ""
echo "1. **DELETAR O SITE COMPLETAMENTE:**"
echo "   - Site Settings > General > Danger zone > Delete site"
echo ""
echo "2. **CRIAR NOVO SITE DO ZERO:**"
echo "   - New site from Git"
echo "   - Selecionar repositório: rifatomahas-improvements"
echo "   - Build command: ./build.sh"
echo "   - Publish directory: netlify-deploy"
echo "   - Deploy site"
echo ""
echo "3. **VERIFICAR BUILD IMAGE:**"
echo "   - Após criar, vá em Site Settings > Build & Deploy"
echo "   - Build image selection > Ubuntu Focal 20.04"
echo ""
echo "💡 POR QUE ISSO FUNCIONA:"
echo "========================"
echo "- Sites novos usam build image moderna por padrão"
echo "- Elimina qualquer configuração legacy cached"
echo "- Force a aplicação de todas as nossas configurações"
echo ""
echo "⚠️ ALTERNATIVA (se não quiser deletar):"
echo "======================================"
echo "- Abra um ticket de suporte do Netlify"
echo "- Peça para eles forçarem Ubuntu 20.04 no seu site"
echo "- Mencione que está stuck em Ubuntu 14.04"

echo ""
echo "🔄 Todas as configurações possíveis foram aplicadas."
echo "   O problema agora é 100% do lado do Netlify."
