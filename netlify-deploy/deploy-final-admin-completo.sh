#!/bin/bash
# Script de Deploy Final - Rifa Thomas Admin Completo
# Data: 12/06/2025
# Status: PRONTO PARA PRODUÇÃO

echo "🚀 DEPLOY FINAL - RIFA THOMAS ADMIN"
echo "==================================="
echo ""

# Configurar cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    case $2 in
        "success") echo -e "${GREEN}✅ $1${NC}" ;;
        "error") echo -e "${RED}❌ $1${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $1${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $1${NC}" ;;
        *) echo "📋 $1" ;;
    esac
}

print_status "Iniciando deploy do sistema admin corrigido..." "info"
echo ""

# Verificar se está no diretório correto
if [ ! -f "admin.html" ] || [ ! -f "admin.js" ]; then
    print_status "ERRO: Execute este script no diretório netlify-deploy" "error"
    exit 1
fi

print_status "Diretório correto verificado" "success"

# Listar arquivos principais
echo ""
print_status "📁 ARQUIVOS PRINCIPAIS PARA DEPLOY:" "info"
main_files=(
    "index.html"
    "login.html" 
    "admin.html"
    "script.js"
    "admin.js"
    "firebase-config.js"
    "styles.css"
    "admin.css"
    "_redirects"
)

for file in "${main_files[@]}"; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        print_status "  $file ($size)" "success"
    else
        print_status "  $file - FALTANDO!" "error"
    fi
done

# Verificar sintaxe dos arquivos JavaScript
echo ""
print_status "🔍 VERIFICANDO SINTAXE JAVASCRIPT:" "info"

js_files=("admin.js" "firebase-config.js" "script.js")
js_errors=0

for js_file in "${js_files[@]}"; do
    if [ -f "$js_file" ]; then
        if node -c "$js_file" 2>/dev/null; then
            print_status "  $js_file - Sintaxe OK" "success"
        else
            print_status "  $js_file - ERRO DE SINTAXE!" "error"
            js_errors=$((js_errors + 1))
        fi
    fi
done

if [ $js_errors -gt 0 ]; then
    print_status "FALHA: Corrija os erros de sintaxe antes do deploy" "error"
    exit 1
fi

# Verificar configurações críticas
echo ""
print_status "⚙️  VERIFICANDO CONFIGURAÇÕES:" "info"

# Verificar credenciais admin
if grep -q "admin@rifathomas.com" firebase-config.js; then
    print_status "  Email admin configurado" "success"
else
    print_status "  Email admin não encontrado" "warning"
fi

# Verificar estrutura do Firebase
if grep -q "apiKey.*AIza" firebase-config.js; then
    print_status "  Configuração Firebase presente" "success"
else
    print_status "  Configuração Firebase pode estar incompleta" "warning"
fi

# Verificar funções críticas
critical_functions=("confirmDonation" "rejectDonation" "loadParticipants" "saveConfiguration")
missing_functions=0

for func in "${critical_functions[@]}"; do
    if grep -q "function $func\|async function $func" admin.js; then
        print_status "  Função $func() encontrada" "success"
    else
        print_status "  Função $func() não encontrada!" "error"
        missing_functions=$((missing_functions + 1))
    fi
done

if [ $missing_functions -gt 0 ]; then
    print_status "FALHA: Funções críticas estão faltando" "error"
    exit 1
fi

# Verificar _redirects para Netlify
echo ""
print_status "🌐 VERIFICANDO CONFIGURAÇÃO NETLIFY:" "info"

if [ -f "_redirects" ]; then
    print_status "  Arquivo _redirects presente" "success"
    if grep -q "/admin.*admin.html" _redirects; then
        print_status "  Redirecionamento admin configurado" "success"
    else
        print_status "  Redirecionamento admin não encontrado" "warning"
    fi
else
    print_status "  Criando arquivo _redirects..." "info"
    cat > _redirects << EOF
# Netlify redirects for Rifa Thomas
/admin    /admin.html    200
/login    /login.html    200
/*        /index.html    200
EOF
    print_status "  Arquivo _redirects criado" "success"
fi

# Preparar informações de deploy
echo ""
print_status "📦 PREPARANDO DEPLOY:" "info"

# Criar arquivo de informações de build
cat > build-info.json << EOF
{
    "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "2.0.0-admin-complete",
    "description": "Sistema admin completo da Rifa Thomas",
    "features": [
        "Painel administrativo completo",
        "Confirmação de doações",
        "Gestão de participantes", 
        "Sistema de configurações",
        "Exportação de dados",
        "Sistema de sorteio"
    ],
    "credentials": {
        "admin_email": "admin@rifathomas.com",
        "admin_password": "casaVERDE123"
    },
    "status": "PRODUCTION_READY"
}
EOF

print_status "  Arquivo build-info.json criado" "success"

# Contar arquivos para deploy
total_files=$(find . -maxdepth 1 -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "_redirects" \) | wc -l)
total_size=$(du -sh . | cut -f1)

print_status "  Total de arquivos: $total_files" "info"
print_status "  Tamanho total: $total_size" "info"

# Instruções finais
echo ""
print_status "🎯 INSTRUÇÕES DE DEPLOY:" "info"
echo ""
echo "1️⃣  NETLIFY (Recomendado):"
echo "   - Faça upload desta pasta para Netlify"
echo "   - Configure domínio personalizado se necessário"
echo "   - Teste o acesso admin em: [seu-dominio]/admin"
echo ""
echo "2️⃣  FIREBASE HOSTING:"
echo "   - Execute: firebase deploy"
echo "   - Configure regras de hosting se necessário"
echo ""
echo "3️⃣  SERVIDOR PRÓPRIO:"
echo "   - Faça upload de todos os arquivos"
echo "   - Configure servidor web (Apache/Nginx)"
echo "   - Garanta HTTPS para segurança"
echo ""

# Checklist final
echo ""
print_status "✅ CHECKLIST FINAL DE DEPLOY:" "info"
echo ""
echo "☐ Arquivos principais presentes"
echo "☐ Sintaxe JavaScript válida"
echo "☐ Configuração Firebase correta"
echo "☐ Credenciais admin configuradas"
echo "☐ Funções críticas implementadas"
echo "☐ Arquivo _redirects configurado"
echo ""

# Credenciais finais
print_status "🔐 CREDENCIAIS DE ACESSO:" "info"
echo ""
echo "Email: admin@rifathomas.com"
echo "Senha: casaVERDE123"
echo ""
echo "URL de acesso admin: [seu-dominio]/admin"
echo "URL de login: [seu-dominio]/login"
echo ""

# URLs de teste úteis
print_status "🧪 FERRAMENTAS DE TESTE INCLUÍDAS:" "info"
echo ""
echo "- teste-admin-funcionalidades.html (Teste completo)"
echo "- debug-admin-completo.html (Debug detalhado)"
echo "- STATUS_FINAL_ADMIN_COMPLETO.md (Documentação)"
echo ""

# Status final
echo ""
print_status "🚀 SISTEMA PRONTO PARA DEPLOY!" "success"
print_status "Status: PRODUÇÃO | Versão: 2.0.0 | Data: $(date)" "success"
echo ""
print_status "💡 Dica: Execute o teste local antes do deploy final:" "info"
print_status "python3 -m http.server 8000" "info"
print_status "Acesse: http://localhost:8000/admin" "info"

echo ""
print_status "✅ Deploy script finalizado com sucesso!" "success"
