#!/bin/bash

echo "🔍 === DIAGNÓSTICO COMPLETO NETLIFY DEPLOY ==="
echo "=============================================="
echo
echo "📅 Data: $(date)"
echo "📁 Diretório: $(pwd)"
echo

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }

echo "🔍 1. VERIFICANDO ESTRUTURA DO PROJETO"
echo "======================================"

# Verificar arquivos essenciais
essential_files=(
    "package.json"
    ".netlify.toml"
    ".nvmrc"
    "netlify-deploy/index.html"
    "netlify-deploy/admin.html"
    "netlify-deploy/styles.css"
    "netlify-deploy/script.js"
    "netlify-deploy/admin.js"
    "netlify-deploy/firebase-config.js"
)

echo "📂 Verificando arquivos essenciais..."
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "$file existe"
    else
        log_error "$file NÃO EXISTE"
    fi
done

echo
echo "🔍 2. VERIFICANDO PACKAGE.JSON"
echo "=============================="

if [ -f "package.json" ]; then
    log_info "Conteúdo do package.json:"
    echo "------------------------"
    cat package.json | jq . 2>/dev/null || cat package.json
    echo "------------------------"
    
    # Verificar dependências problemáticas
    if grep -q "@fortawesome/fontawesome-free" package.json; then
        log_error "Dependência problemática @fortawesome/fontawesome-free encontrada"
    else
        log_success "Sem dependência @fortawesome/fontawesome-free"
    fi
    
    if grep -q "@firebasegen" package.json; then
        log_error "Dependência local @firebasegen encontrada (pode causar problemas)"
    else
        log_success "Sem dependências locais problemáticas"
    fi
    
    # Verificar scripts
    if grep -q '"build":.*echo.*Static site' package.json; then
        log_success "Build script configurado para site estático"
    else
        log_warning "Build script pode não estar otimizado"
    fi
else
    log_error "package.json não encontrado"
fi

echo
echo "🔍 3. VERIFICANDO .NETLIFY.TOML"
echo "==============================="

if [ -f ".netlify.toml" ]; then
    log_success ".netlify.toml existe"
    log_info "Conteúdo:"
    echo "------------------------"
    cat .netlify.toml
    echo "------------------------"
else
    log_error ".netlify.toml não existe - CRIANDO..."
    cat > .netlify.toml << 'EOF'
[build]
  publish = "netlify-deploy"
  command = "echo 'Static site - no build needed'"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/*.js"
  [headers.values]
    Content-Type = "application/javascript"

[[headers]]
  for = "/*.css"
  [headers.values]
    Content-Type = "text/css"

[[redirects]]
  from = "/admin"
  to = "/admin.html"
  status = 200

[[redirects]]
  from = "/sorteio"
  to = "/sorteio.html"
  status = 200
EOF
    log_success ".netlify.toml criado"
fi

echo
echo "🔍 4. VERIFICANDO .NVMRC"
echo "========================"

if [ -f ".nvmrc" ]; then
    log_success ".nvmrc existe"
    log_info "Versão do Node: $(cat .nvmrc)"
else
    log_error ".nvmrc não existe - CRIANDO..."
    echo "18" > .nvmrc
    log_success ".nvmrc criado com Node.js 18"
fi

echo
echo "🔍 5. VERIFICANDO DIRETÓRIO NETLIFY-DEPLOY"
echo "=========================================="

if [ -d "netlify-deploy" ]; then
    log_success "Diretório netlify-deploy existe"
    
    # Contar arquivos
    file_count=$(find netlify-deploy -type f | wc -l)
    log_info "Total de arquivos: $file_count"
    
    # Verificar tamanho
    dir_size=$(du -sh netlify-deploy | cut -f1)
    log_info "Tamanho do diretório: $dir_size"
    
    # Listar arquivos principais
    echo "📁 Estrutura do diretório de deploy:"
    ls -la netlify-deploy/ | head -20
    
else
    log_error "Diretório netlify-deploy NÃO EXISTE"
    log_warning "Criando diretório e copiando arquivos..."
    
    mkdir -p netlify-deploy
    
    # Copiar arquivos essenciais
    files_to_copy=("index.html" "admin.html" "login.html" "sorteio.html" "styles.css" "script.js" "admin.js" "firebase-config.js")
    
    for file in "${files_to_copy[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" netlify-deploy/
            log_success "Copiado: $file"
        else
            log_warning "Arquivo não encontrado: $file"
        fi
    done
fi

echo
echo "🔍 6. VERIFICANDO FONTAWESOME"
echo "============================="

# Verificar uso do FontAwesome em arquivos HTML
html_files=("netlify-deploy/index.html" "netlify-deploy/admin.html" "netlify-deploy/login.html" "netlify-deploy/sorteio.html")

for file in "${html_files[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "font-awesome.*css.*all.min.css" "$file"; then
            log_success "$file tem FontAwesome CDN"
        else
            log_warning "$file SEM FontAwesome CDN - ADICIONANDO..."
            
            # Backup
            cp "$file" "${file}.backup-$(date +%H%M%S)"
            
            # Adicionar FontAwesome
            if grep -q "<head>" "$file"; then
                sed -i '/<head>/a\    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">' "$file"
                log_success "FontAwesome adicionado ao $file"
            else
                log_error "Tag <head> não encontrada em $file"
            fi
        fi
    else
        log_error "$file não existe"
    fi
done

echo
echo "🔍 7. VERIFICANDO FIREBASE CONFIG"
echo "================================="

if [ -f "netlify-deploy/firebase-config.js" ]; then
    log_success "firebase-config.js existe"
    
    # Verificar se tem configurações básicas
    if grep -q "apiKey" netlify-deploy/firebase-config.js && grep -q "projectId" netlify-deploy/firebase-config.js; then
        log_success "Configurações Firebase parecem válidas"
    else
        log_warning "Configurações Firebase podem estar incompletas"
    fi
else
    log_error "firebase-config.js não encontrado"
fi

echo
echo "🔍 8. VERIFICANDO SINTAXE DOS ARQUIVOS"
echo "======================================"

# Verificar sintaxe JavaScript
js_files=("netlify-deploy/script.js" "netlify-deploy/admin.js" "netlify-deploy/firebase-config.js")

for file in "${js_files[@]}"; do
    if [ -f "$file" ]; then
        if command_exists node; then
            if node -c "$file" 2>/dev/null; then
                log_success "$file - sintaxe válida"
            else
                log_error "$file - ERRO DE SINTAXE"
                node -c "$file"
            fi
        else
            log_info "$file - Node.js não disponível para verificação"
        fi
    fi
done

# Verificar sintaxe HTML
html_files=("netlify-deploy/index.html" "netlify-deploy/admin.html")

for file in "${html_files[@]}"; do
    if [ -f "$file" ]; then
        # Verificações básicas de HTML
        if grep -q "<!DOCTYPE html>" "$file" && grep -q "<html" "$file" && grep -q "</html>" "$file"; then
            log_success "$file - estrutura HTML válida"
        else
            log_warning "$file - estrutura HTML pode estar incompleta"
        fi
    fi
done

echo
echo "🔍 9. SIMULANDO BUILD LOCAL"
echo "=========================="

log_info "Executando comando de build..."
npm run build 2>&1 || echo "Build executado (exit code: $?)"

echo
echo "🔍 10. VERIFICANDO PERMISSIONS E ENCODING"
echo "========================================="

# Verificar permissões
log_info "Verificando permissões dos arquivos..."
if [ -d "netlify-deploy" ]; then
    find netlify-deploy -type f -not -perm 644 | while read file; do
        log_warning "Permissão não padrão: $file ($(stat -c '%a' "$file"))"
    done
    
    # Corrigir permissões
    find netlify-deploy -type f -exec chmod 644 {} \;
    log_success "Permissões corrigidas para 644"
fi

# Verificar encoding
log_info "Verificando encoding dos arquivos..."
for file in netlify-deploy/*.html netlify-deploy/*.js netlify-deploy/*.css; do
    if [ -f "$file" ]; then
        encoding=$(file -b --mime-encoding "$file" 2>/dev/null || echo "unknown")
        if [ "$encoding" = "utf-8" ] || [ "$encoding" = "us-ascii" ]; then
            log_success "$file - encoding: $encoding"
        else
            log_warning "$file - encoding: $encoding (pode causar problemas)"
        fi
    fi
done

echo
echo "📊 === RESUMO DO DIAGNÓSTICO ==="
echo "==============================="

# Contadores
total_files=$(find netlify-deploy -type f 2>/dev/null | wc -l)
html_files_count=$(find netlify-deploy -name "*.html" 2>/dev/null | wc -l)
js_files_count=$(find netlify-deploy -name "*.js" 2>/dev/null | wc -l)
css_files_count=$(find netlify-deploy -name "*.css" 2>/dev/null | wc -l)

echo "📁 Total de arquivos: $total_files"
echo "📄 Arquivos HTML: $html_files_count"
echo "⚙️ Arquivos JavaScript: $js_files_count"
echo "🎨 Arquivos CSS: $css_files_count"

echo
echo "🎯 === CONFIGURAÇÃO RECOMENDADA NETLIFY ==="
echo "==========================================="
echo "Build command: echo 'Static site ready'"
echo "Publish directory: netlify-deploy"
echo "Node version: 18"
echo "Build environment: Production"

echo
echo "🚀 === PRÓXIMOS PASSOS ==="
echo "========================="
echo "1. Fazer commit das alterações (se houver):"
echo "   git add ."
echo "   git commit -m 'fix: otimizar configuração para Netlify deploy'"
echo
echo "2. Fazer push:"
echo "   git push origin rifatomahas-improvements"
echo
echo "3. No Netlify Dashboard:"
echo "   - Build command: echo 'Static site ready'"
echo "   - Publish directory: netlify-deploy"
echo "   - Node version: 18"
echo
echo "4. Se ainda falhar, verificar logs completos no Netlify"

echo
echo "✅ DIAGNÓSTICO CONCLUÍDO!"
echo "📋 Verifique os itens marcados com ❌ acima"
