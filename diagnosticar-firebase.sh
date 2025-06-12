#!/bin/bash

# Script de diagnóstico para problemas do Firebase
echo "🔍 Diagnóstico Firebase - Rifa Thomas"
echo "===================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_ok() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar arquivos de configuração
echo "📁 Verificando Arquivos de Configuração:"
echo "========================================"

CONFIG_FILE="netlify-deploy/firebase-config.js"

if [ -f "$CONFIG_FILE" ]; then
    print_ok "Arquivo firebase-config.js encontrado"
    
    # Verificar se está configurado
    if grep -q "SUA_API_KEY_AQUI" "$CONFIG_FILE"; then
        print_error "Firebase não está configurado! Execute: ./configure-firebase.sh"
        exit 1
    else
        print_ok "Firebase configurado com chaves reais"
    fi
else
    print_error "Arquivo firebase-config.js não encontrado!"
    exit 1
fi

# Verificar regras do Firestore
if [ -f "firestore.rules" ]; then
    print_ok "Regras de segurança encontradas"
else
    print_warning "Arquivo firestore.rules não encontrado"
fi

echo ""
echo "🔥 Problemas Comuns de Gravação no Firebase:"
echo "============================================"

echo ""
echo "1️⃣  PROBLEMA: Regras de Segurança"
echo "   • Firestore bloqueia escritas por padrão"
echo "   • Solução: Aplicar regras personalizadas"
echo ""

echo "2️⃣  PROBLEMA: Autenticação"
echo "   • Firebase exige usuário autenticado"
echo "   • Solução: Inicializar auth anônima"
echo ""

echo "3️⃣  PROBLEMA: Domínios Autorizados"
echo "   • Firebase só aceita domínios configurados"
echo "   • Solução: Adicionar localhost + netlify.app"
echo ""

echo "4️⃣  PROBLEMA: Quota/Permissões"
echo "   • Projeto pode ter atingido limites"
echo "   • Solução: Verificar console Firebase"
echo ""

echo "🧪 Testes Recomendados:"
echo "======================"
echo ""

read -p "Deseja executar teste automático? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Iniciando servidor de teste..."
    echo ""
    
    # Verificar se arquivo de teste existe
    if [ ! -f "netlify-deploy/test-firebase.html" ]; then
        print_warning "Criando arquivo de teste..."
        ./testar-firebase.sh &
        TEST_PID=$!
        sleep 2
        kill $TEST_PID 2>/dev/null
    fi
    
    echo "📍 URLs de teste:"
    echo "• Principal: http://localhost:8000"
    echo "• Diagnóstico: http://localhost:8000/test-firebase.html"
    echo ""
    echo "🔍 O que verificar no navegador (F12 → Console):"
    echo "• 🔥 Firebase conectado com sucesso!"
    echo "• ✅ Compra salva no Firebase"
    echo "• ❌ Erros de CORS ou autenticação"
    echo ""
    echo "⏹️  Pressione Ctrl+C para parar"
    
    cd netlify-deploy
    python3 -m http.server 8000
else
    echo ""
    echo "🔧 Verificações Manuais:"
    echo "======================="
    echo ""
    echo "1. Abra o console Firebase:"
    echo "   https://console.firebase.google.com/"
    echo ""
    echo "2. Verifique se o projeto 'rifa-cha-thomas' existe"
    echo ""
    echo "3. Confirme serviços ativados:"
    echo "   ✅ Authentication (Anonymous + Email/Password)"
    echo "   ✅ Firestore Database"
    echo ""
    echo "4. Verifique regras do Firestore:"
    echo "   • Vá em Firestore → Regras"
    echo "   • Deve permitir write: if request.auth != null"
    echo ""
    echo "5. Confirme domínios autorizados:"
    echo "   • Authentication → Settings → Authorized domains"
    echo "   • Deve incluir: localhost"
    echo ""
    echo "6. Teste local:"
    echo "   • Execute: ./testar-firebase.sh"
    echo "   • Verifique console do navegador"
fi

echo ""
echo "📋 Soluções Rápidas:"
echo "==================="
echo ""
echo "🔧 Se nada grava no banco:"
echo "1. Execute: ./testar-firebase.sh"
echo "2. Abra F12 → Console e procure erros"
echo "3. Verifique se aparece '🔥 Firebase conectado'"
echo "4. Teste fazer uma compra e veja se aparece '✅ Compra salva'"
echo ""

echo "🔐 Se erro de permissão:"
echo "1. Vá ao Firebase Console"
echo "2. Firestore → Regras"
echo "3. Copie o conteúdo de firestore.rules"
echo "4. Publique as regras"
echo ""

echo "🌐 Se erro de domínio:"
echo "1. Firebase Console → Authentication"
echo "2. Settings → Authorized domains"
echo "3. Adicione: localhost"
echo ""

echo "💾 Verificar dados salvos:"
echo "1. Firebase Console → Firestore"
echo "2. Procure coleção 'purchases'"
echo "3. Deve aparecer documentos das compras"
echo ""

print_info "Para mais ajuda, execute: ./testar-firebase.sh"
