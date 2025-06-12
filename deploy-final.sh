#!/bin/bash

# Deploy otimizado para Netlify + Firebase
echo "🚀 Deploy Rifa Thomas: Netlify + Firebase"
echo "========================================"
echo ""

# Verificar se Firebase está configurado
CONFIG_FILE="netlify-deploy/firebase-config.js"

if grep -q "SUA_API_KEY_AQUI" "$CONFIG_FILE"; then
    echo "❌ Firebase não está configurado!"
    echo "Execute primeiro: ./configure-firebase.sh"
    exit 1
fi

echo "✅ Firebase configurado!"
echo ""

# Preparar deploy
echo "📦 Preparando arquivos para deploy..."

# Verificar arquivos essenciais
essential_files=("index.html" "styles.css" "script.js" "firebase-config.js" "_redirects")
missing_files=()

for file in "${essential_files[@]}"; do
    if [ ! -f "netlify-deploy/$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Arquivos essenciais faltando em netlify-deploy/:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    
    echo ""
    echo "🔧 Copiando arquivos faltantes..."
    for file in "${missing_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "netlify-deploy/"
            echo "   ✅ $file copiado"
        fi
    done
fi

# Verificar se é deploy inicial ou atualização
if [ -f ".netlify/state.json" ]; then
    DEPLOY_TYPE="atualização"
else
    DEPLOY_TYPE="deploy inicial"
fi

echo ""
echo "📊 Informações do Deploy:"
echo "========================"
echo "Tipo: $DEPLOY_TYPE"
echo "Site: rifa-cha-thomas.netlify.app"
echo "Pasta: netlify-deploy/"
echo ""

echo "📄 Arquivos incluídos:"
ls -la netlify-deploy/ | grep -E '\.(html|css|js)$' | awk '{print "   " $9 " (" $5 " bytes)"}'

echo ""
echo "🌐 Opções de Deploy:"
echo "==================="
echo ""
echo "1️⃣  Drag & Drop (Simples):"
echo "   • Acesse: https://app.netlify.com/sites/rifa-cha-thomas"
echo "   • Vá na aba 'Deploys'"
echo "   • Arraste a pasta 'netlify-deploy' para fazer upload"
echo ""

echo "2️⃣  Netlify CLI (Automático):"
if command -v netlify &> /dev/null; then
    echo "   ✅ Netlify CLI detectado!"
    echo ""
    read -p "   Fazer deploy automático via CLI? (y/n): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "🚀 Fazendo deploy..."
        
        # Login se necessário
        if ! netlify status &> /dev/null; then
            echo "🔐 Fazendo login no Netlify..."
            netlify login
        fi
        
        # Deploy
        netlify deploy --dir=netlify-deploy --prod --site=rifa-cha-thomas
        
        echo ""
        echo "✅ Deploy concluído!"
        echo "🌐 Site: https://rifa-cha-thomas.netlify.app"
    fi
else
    echo "   ❌ Netlify CLI não instalado"
    echo "   Para instalar: npm install -g netlify-cli"
fi

echo ""
echo "🔐 IMPORTANTE - Configurar domínios autorizados:"
echo "=============================================="
echo "Após o deploy, configure os domínios no Firebase:"
echo ""
echo "1. Acesse: https://console.firebase.google.com/"
echo "2. Vá em Authentication → Settings → Authorized domains"
echo "3. Adicione:"
echo "   • localhost (para desenvolvimento)"
echo "   • rifa-cha-thomas.netlify.app"
echo "   • Seu domínio personalizado (se houver)"
echo ""

echo "🧪 Testando configuração local..."
echo "================================"
echo ""
read -p "Deseja testar localmente antes do deploy? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🌐 Iniciando servidor local..."
    echo "Acesse: http://localhost:8000"
    echo "Pressione Ctrl+C para parar"
    echo ""
    
    cd netlify-deploy
    python3 -m http.server 8000
fi

echo ""
echo "🎉 Deploy preparado!"
echo ""
echo "📋 Checklist final:"
echo "=================="
echo "☐ Firebase configurado com chaves reais"
echo "☐ Deploy feito no Netlify"
echo "☐ Domínios autorizados configurados no Firebase"
echo "☐ Site testado e funcionando"
echo ""

# Abrir URLs importantes
read -p "Abrir links importantes? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]] && command -v xdg-open &> /dev/null; then
    echo "🌐 Abrindo links..."
    xdg-open "https://app.netlify.com/sites/rifa-cha-thomas"
    sleep 2
    xdg-open "https://console.firebase.google.com/"
fi

echo ""
echo "✨ Sucesso! Seu projeto está pronto para produção!"
