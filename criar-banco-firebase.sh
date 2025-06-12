#!/bin/bash

# Script para guiar criação do banco Firebase
echo "🔥 Criação do Banco Firebase para Rifa Thomas"
echo "============================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🎯 Sua aplicação precisa de um banco Firestore para funcionar!"
echo ""
echo "📊 O que será armazenado:"
echo "========================"
echo "• Compras de rifas (purchases)"
echo "• Dados de administradores (admins)"
echo "• Configurações da rifa (config)"
echo "• Resultados do sorteio (draw)"
echo "• Reservas temporárias (reservations)"
echo ""

print_step "Passo 1: Acessar Firebase Console"
echo "1. Vou abrir o Firebase Console para você"
echo "2. Faça login com sua conta Google"
echo "3. Crie um novo projeto ou selecione 'rifa-cha-thomas'"
echo ""

read -p "Pressione Enter para abrir Firebase Console..."

# Abrir Firebase Console
if command -v xdg-open &> /dev/null; then
    xdg-open "https://console.firebase.google.com/"
else
    echo "Acesse: https://console.firebase.google.com/"
fi

echo ""
print_step "Passo 2: Criar Projeto Firebase"
echo "1. Se não existe, clique em 'Criar um projeto'"
echo "2. Nome do projeto: 'rifa-cha-thomas'"
echo "3. Desative Google Analytics (não é necessário)"
echo "4. Clique em 'Criar projeto'"
echo ""

read -p "Projeto criado? Pressione Enter para continuar..."

echo ""
print_step "Passo 3: Ativar Firestore Database"
echo "1. No menu lateral, clique em 'Firestore Database'"
echo "2. Clique em 'Criar banco de dados'"
echo "3. Escolha 'Iniciar no modo de produção'"
echo "4. Selecione localização: 'southamerica-east1' (São Paulo)"
echo "5. Clique em 'Concluído'"
echo ""

read -p "Firestore criado? Pressione Enter para continuar..."

echo ""
print_step "Passo 4: Configurar Regras de Segurança"
echo "1. No Firestore, vá na aba 'Regras'"
echo "2. Substitua o conteúdo pelas regras personalizadas"
echo ""

# Verificar se arquivo de regras existe
if [ -f "firestore.rules" ]; then
    print_success "Arquivo firestore.rules encontrado!"
    echo ""
    echo "🔒 Regras que devem ser aplicadas:"
    echo "================================="
    echo ""
    
    # Mostrar as regras
    cat firestore.rules | head -20
    echo "... (arquivo completo: firestore.rules)"
    echo ""
    
    print_warning "COPIE o conteúdo de firestore.rules e cole no Firebase Console"
    
    read -p "Abrir arquivo firestore.rules? (y/n): " -r
    if [[ $REPLY =~ ^[Yy]$ ]] && command -v xdg-open &> /dev/null; then
        xdg-open "firestore.rules"
    fi
else
    print_error "Arquivo firestore.rules não encontrado!"
fi

echo ""
read -p "Regras aplicadas? Pressione Enter para continuar..."

echo ""
print_step "Passo 5: Ativar Authentication"
echo "1. No menu lateral, clique em 'Authentication'"
echo "2. Vá na aba 'Sign-in method'"
echo "3. Ative 'Email/password' (para admins)"
echo "4. Ative 'Anonymous' (para usuários normais)"
echo "5. Salve as configurações"
echo ""

read -p "Authentication ativado? Pressione Enter para continuar..."

echo ""
print_step "Passo 6: Obter Configurações do Projeto"
echo "1. Vá em ⚙️ 'Configurações do projeto'"
echo "2. Na aba 'Geral', role até 'Seus aplicativos'"
echo "3. Clique no ícone '</>' (Adicionar app da Web)"
echo "4. Nome do app: 'Rifa Thomas Web'"
echo "5. NÃO marque 'Configurar Firebase Hosting'"
echo "6. Copie as configurações do firebaseConfig"
echo ""

read -p "Configurações copiadas? Pressione Enter para continuar..."

echo ""
print_success "Banco Firebase criado com sucesso!"
echo ""
echo "🚀 Próximos passos:"
echo "=================="
echo "1. Execute: ./configure-firebase.sh (para configurar as chaves)"
echo "2. Execute: ./deploy-final.sh (para fazer deploy)"
echo ""

echo "📊 Estrutura do banco que será criada automaticamente:"
echo "====================================================="
echo ""
echo "📁 purchases/     # Compras realizadas"
echo "📁 admins/        # Dados dos administradores"
echo "📁 config/        # Configurações da rifa"
echo "📁 draw/          # Resultados do sorteio"
echo "📁 reservations/  # Reservas temporárias (15 min)"
echo ""

echo "🔐 Configurações importantes aplicadas:"
echo "======================================"
echo "✅ Firestore Database ativado"
echo "✅ Authentication configurado"
echo "✅ Regras de segurança aplicadas"
echo "✅ Projeto configurado para produção"
echo ""

print_warning "LEMBRE-SE: Depois do deploy, configure os domínios autorizados!"
echo "No Authentication → Settings → Authorized domains"
echo "Adicione: localhost + seu-site.netlify.app"
echo ""

# Verificar próximo passo
if grep -q "SUA_API_KEY_AQUI" "netlify-deploy/firebase-config.js" 2>/dev/null; then
    print_step "Próximo passo: Configurar as chaves"
    echo "Execute: ./configure-firebase.sh"
else
    print_step "Próximo passo: Fazer deploy"
    echo "Execute: ./deploy-final.sh"
fi

echo ""
print_success "Script concluído! Banco Firebase pronto para uso! 🎉"
