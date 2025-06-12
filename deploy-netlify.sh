#!/bin/bash

# Script para deploy no Netlify com Firebase
# Uso: ./deploy-netlify.sh

echo "🚀 Iniciando deploy da Rifa Thomas no Netlify..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar mensagens coloridas
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

# Verificar se estamos no diretório correto
if [ ! -f "firebase-config.js" ]; then
    print_error "Arquivo firebase-config.js não encontrado!"
    print_warning "Execute este script na pasta raiz do projeto"
    exit 1
fi

print_step "Verificando configuração do Firebase..."

# Verificar se firebase-config.js está configurado
if grep -q "SUA_API_KEY_AQUI" firebase-config.js; then
    print_error "Firebase ainda não está configurado!"
    echo ""
    echo "Para configurar:"
    echo "1. Acesse: https://console.firebase.google.com/"
    echo "2. Selecione seu projeto"
    echo "3. Vá em Configurações → Seus aplicativos"
    echo "4. Copie as configurações e substitua em firebase-config.js"
    echo ""
    read -p "Pressione Enter quando terminar a configuração..."
fi

print_step "Preparando arquivos para deploy..."

# Verificar se pasta netlify-deploy existe
if [ ! -d "netlify-deploy" ]; then
    print_warning "Pasta netlify-deploy não encontrada, criando..."
    mkdir netlify-deploy
fi

# Copiar arquivos principais se necessário
files_to_copy=("index.html" "styles.css" "script.js" "admin.html" "admin.css" "admin.js" "login.html" "firebase-config.js")

for file in "${files_to_copy[@]}"; do
    if [ -f "$file" ]; then
        if [ -f "netlify-deploy/$file" ]; then
            # Verificar se arquivo foi modificado
            if ! cmp -s "$file" "netlify-deploy/$file"; then
                print_step "Atualizando $file..."
                cp "$file" "netlify-deploy/"
            fi
        else
            print_step "Copiando $file..."
            cp "$file" "netlify-deploy/"
        fi
    fi
done

print_success "Arquivos preparados!"

print_step "Verificando estrutura do deploy..."

# Verificar arquivos essenciais
required_files=("index.html" "firebase-config.js" "_redirects")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "netlify-deploy/$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_error "Arquivos essenciais estão faltando:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

print_success "Estrutura verificada!"

# Mostrar informações importantes
echo ""
echo "📊 Resumo do deploy:"
echo "==================="
echo "📁 Pasta de deploy: netlify-deploy/"
echo "📄 Arquivos principais:"
ls -la netlify-deploy/ | grep -E '\.(html|css|js)$' | awk '{print "   " $9}'

echo ""
echo "🔥 Próximos passos:"
echo "==================="
echo "1. Acesse: https://app.netlify.com/"
echo "2. Faça login ou crie uma conta"
echo "3. Arraste a pasta 'netlify-deploy' para a área de deploy"
echo "4. Aguarde o deploy ser concluído"
echo ""
echo "🔧 Configurações importantes:"
echo "============================="
echo "• Publish directory: netlify-deploy"
echo "• Build command: (deixe vazio)"
echo ""
echo "🔐 Após o deploy:"
echo "=================="
echo "1. Copie a URL do seu site (ex: https://seu-site.netlify.app)"
echo "2. No Firebase Console → Authentication → Settings → Authorized domains"
echo "3. Adicione a URL do Netlify na lista de domínios autorizados"
echo ""

# Verificar se Netlify CLI está instalado
if command -v netlify &> /dev/null; then
    echo "🚀 Deploy via CLI:"
    echo "=================="
    echo "Se preferir usar a linha de comando:"
    echo "netlify deploy --dir=netlify-deploy --prod"
    echo ""
fi

print_success "Deploy preparado! Siga as instruções acima."

# Abrir pasta no explorer (se disponível)
if command -v xdg-open &> /dev/null; then
    read -p "Deseja abrir a pasta netlify-deploy? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open netlify-deploy/
    fi
fi

echo ""
print_success "Script concluído! 🎉"
