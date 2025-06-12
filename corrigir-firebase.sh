#!/bin/bash

# Script de correção completa para problemas de gravação Firebase
echo "🔧 Correção Completa - Firebase não está gravando"
echo "================================================="
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

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Verificar se Firebase está configurado
CONFIG_FILE="netlify-deploy/firebase-config.js"

if ! [ -f "$CONFIG_FILE" ] || grep -q "SUA_API_KEY_AQUI" "$CONFIG_FILE"; then
    print_error "Firebase não está configurado!"
    print_info "Execute: ./configure-firebase.sh"
    exit 1
fi

print_ok "Firebase configurado com chaves reais"

# Extrair Project ID
PROJECT_ID=$(grep 'projectId:' "$CONFIG_FILE" | sed 's/.*projectId: *"//' | sed 's/".*//')
print_info "Project ID: $PROJECT_ID"

echo ""
echo "🔍 DIAGNÓSTICO DOS PROBLEMAS:"
echo "============================"
echo ""

echo "1️⃣  REGRAS DE SEGURANÇA"
echo "   Status: ❌ Provavelmente restritivas"
echo "   Solução: Aplicar regras personalizadas"
echo ""

echo "2️⃣  AUTENTICAÇÃO ANÔNIMA"
echo "   Status: ❓ Precisa verificar"
echo "   Solução: Ativar no Firebase Console"
echo ""

echo "3️⃣  DOMÍNIOS AUTORIZADOS"
echo "   Status: ❓ Precisa verificar"
echo "   Solução: Adicionar localhost"
echo ""

echo "4️⃣  LOGS DE DEBUG"
echo "   Status: ✅ Adicionados ao código"
echo "   Solução: Verificar console do navegador"
echo ""

echo "🚀 PLANO DE CORREÇÃO:"
echo "===================="
echo ""

print_step "Passo 1: Aplicar Regras de Segurança"
echo ""
echo "No Firebase Console que acabou de abrir:"
echo "https://console.firebase.google.com/project/$PROJECT_ID/firestore/rules"
echo ""
echo "Substitua TODO o conteúdo por estas regras:"
echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ COPIE EXATAMENTE ESTE CONTEÚDO:                         │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""

cat firestore.rules

echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ DEPOIS DE COLAR, CLIQUE EM 'PUBLICAR'                  │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""

read -p "Regras aplicadas no Firebase Console? (y/n): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Aplique as regras primeiro!"
    exit 1
fi

print_ok "Regras aplicadas!"
echo ""

print_step "Passo 2: Verificar Authentication"
echo ""
echo "Acesse: https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
echo ""
echo "Certifique-se de que estão ATIVADOS:"
echo "✅ Anonymous"
echo "✅ Email/Password"
echo ""

read -p "Authentication configurado? (y/n): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Configure Authentication antes de continuar"
fi

echo ""

print_step "Passo 3: Verificar Domínios Autorizados"
echo ""
echo "Acesse: https://console.firebase.google.com/project/$PROJECT_ID/authentication/settings"
echo ""
echo "Na seção 'Authorized domains', adicione:"
echo "✅ localhost"
echo "✅ sua-url.netlify.app (se já fez deploy)"
echo ""

read -p "Domínios configurados? (y/n): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Configure domínios autorizados"
fi

echo ""

print_step "Passo 4: Teste Completo"
echo ""
print_info "Iniciando teste com logs detalhados..."

# Verificar se arquivo de teste existe
if [ ! -f "netlify-deploy/test-firebase.html" ]; then
    print_info "Criando arquivo de teste..."
    # Executar testar-firebase.sh em background para criar o arquivo
    timeout 3s ./testar-firebase.sh &>/dev/null || true
fi

echo ""
echo "🧪 TESTE MANUAL:"
echo "==============="
echo ""
echo "1. Abra um novo terminal"
echo "2. Execute: cd netlify-deploy && python3 -m http.server 8000"
echo "3. Acesse: http://localhost:8000"
echo "4. Tente fazer uma compra"
echo "5. Pressione F12 → Console"
echo "6. Verifique se aparece:"
echo "   ✅ '🔥 Firebase conectado com sucesso!'"
echo "   ✅ '✅ Compra salva no Firebase: purchase_xxxxx'"
echo ""

echo "🔍 VERIFICAR DADOS NO FIREBASE:"
echo "=============================="
echo ""
echo "1. Acesse: https://console.firebase.google.com/project/$PROJECT_ID/firestore/data"
echo "2. Procure pela coleção 'purchases'"
echo "3. Deve aparecer documentos com as compras"
echo ""

echo "🆘 SE AINDA NÃO FUNCIONAR:"
echo "=========================="
echo ""
echo "1. Verifique erros no console (F12)"
echo "2. Execute: ./diagnosticar-firebase.sh"
echo "3. Procure mensagens em vermelho no console"
echo "4. Certifique-se de que todos os passos foram seguidos"
echo ""

echo "📞 POSSÍVEIS ERROS E SOLUÇÕES:"
echo "=============================="
echo ""
echo "❌ 'Firebase: Missing or insufficient permissions'"
echo "   → Regras do Firestore não foram aplicadas corretamente"
echo ""
echo "❌ 'Firebase: Unauthorized domain'"
echo "   → Domínio não está na lista de autorizados"
echo ""
echo "❌ 'FirebaseDB is not defined'"
echo "   → Arquivo firebase-config.js não carregou"
echo ""
echo "❌ 'Request failed with status 403'"
echo "   → Problema de autenticação ou regras"
echo ""

read -p "Deseja abrir todas as URLs necessárias? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]] && command -v xdg-open &> /dev/null; then
    print_info "Abrindo URLs importantes..."
    
    # Firestore Rules
    xdg-open "https://console.firebase.google.com/project/$PROJECT_ID/firestore/rules" &
    sleep 2
    
    # Authentication
    xdg-open "https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers" &
    sleep 2
    
    # Firestore Data
    xdg-open "https://console.firebase.google.com/project/$PROJECT_ID/firestore/data" &
    sleep 2
    
    print_ok "URLs abertas!"
fi

echo ""
print_ok "Correção concluída!"
echo ""
print_info "PRÓXIMOS PASSOS:"
echo "1. Aplicar regras no Firebase Console"
echo "2. Testar aplicação localmente"
echo "3. Verificar se dados aparecem no Firestore"
echo "4. Se funcionar, fazer deploy final"

echo ""
print_warning "LEMBRE-SE: Depois de cada mudança no Firebase, aguarde 1-2 minutos para propagar!"
