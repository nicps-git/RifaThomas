#!/bin/bash

echo "🔍 === DIAGNÓSTICO ESPECÍFICO: MISSING MODULE ERROR ==="
echo "===================================================="
echo "Data: $(date)"
echo ""

cd /home/nicps/Documents/Projetos/RifaThomas

echo "📋 1. ANÁLISE DETALHADA DE MÓDULOS E IMPORTS"
echo "==========================================="

# Verificar se há algum import/require nos arquivos JavaScript
echo "🔍 Procurando por imports/requires em todos os arquivos JS..."

# Função para analisar um arquivo JS
analyze_js_file() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo ""
    echo "📄 Analisando: $filename"
    echo "----------------------------"
    
    # Verificar imports ES6
    if grep -n "import " "$file" 2>/dev/null; then
        echo "❌ PROBLEMA: ES6 imports encontrados!"
        grep -n "import " "$file"
    fi
    
    # Verificar require statements
    if grep -n "require(" "$file" 2>/dev/null; then
        echo "❌ PROBLEMA: require() statements encontrados!"
        grep -n "require(" "$file"
    fi
    
    # Verificar exports
    if grep -n "export " "$file" 2>/dev/null; then
        echo "❌ PROBLEMA: ES6 exports encontrados!"
        grep -n "export " "$file"
    fi
    
    # Verificar module.exports
    if grep -n "module\.exports" "$file" 2>/dev/null; then
        echo "❌ PROBLEMA: CommonJS exports encontrados!"
        grep -n "module\.exports" "$file"
    fi
    
    # Verificar se usa 'import' em strings (pode ser dinâmico)
    if grep -n "import(" "$file" 2>/dev/null; then
        echo "⚠️ ATENÇÃO: Dynamic imports encontrados!"
        grep -n "import(" "$file"
    fi
}

# Analisar todos os arquivos JS
for jsfile in netlify-deploy/*.js; do
    if [ -f "$jsfile" ]; then
        analyze_js_file "$jsfile"
    fi
done

echo ""
echo "📋 2. VERIFICAÇÃO DE PACKAGE.JSON E DEPENDÊNCIAS"
echo "=============================================="

echo "📄 package.json na raiz:"
if [ -f "package.json" ]; then
    echo "⚠️ PROBLEMA IDENTIFICADO: package.json na raiz contém dependências!"
    echo "Dependências:"
    grep -A 10 '"dependencies"' package.json
else
    echo "✅ Sem package.json na raiz"
fi

echo ""
echo "📄 package.json em netlify-deploy:"
if [ -f "netlify-deploy/package.json" ]; then
    echo "Conteúdo:"
    cat netlify-deploy/package.json
else
    echo "❌ package.json ausente em netlify-deploy"
fi

echo ""
echo "📋 3. VERIFICAÇÃO DE REFERÊNCIAS FIREBASE"
echo "========================================"

echo "🔍 Procurando por referências Firebase que podem causar problemas..."

# Verificar imports do Firebase
for jsfile in netlify-deploy/*.js; do
    if [ -f "$jsfile" ]; then
        filename=$(basename "$jsfile")
        echo ""
        echo "📄 $filename:"
        
        # Verificar se usa Firebase como módulo
        if grep -q "import.*firebase" "$jsfile" || grep -q "require.*firebase" "$jsfile"; then
            echo "❌ PROBLEMA: Usa Firebase como módulo!"
            grep -n "firebase" "$jsfile" | head -3
        elif grep -q "firebase\." "$jsfile"; then
            echo "✅ Usa Firebase global (correto para CDN)"
        fi
    fi
done

echo ""
echo "📋 4. SOLUÇÃO PARA MISSING MODULE ERROR"
echo "====================================="

echo "🔧 Aplicando correções para resolver missing module error..."

# 1. Remover package.json da raiz do contexto de build
echo ""
echo "1. Isolando package.json da raiz..."
if [ -f "package.json" ]; then
    # Renomear temporariamente para que Netlify não o veja
    mv package.json package.json.backup-netlify
    echo "✅ package.json da raiz renomeado para package.json.backup-netlify"
fi

# 2. Garantir que netlify-deploy tem package.json vazio
echo ""
echo "2. Garantindo package.json vazio em netlify-deploy..."
cat > netlify-deploy/package.json << 'EOF'
{
  "name": "static-site",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs"
}
EOF
echo "✅ package.json vazio criado em netlify-deploy"

# 3. Atualizar .netlify.toml para ser ainda mais explícito
echo ""
echo "3. Atualizando .netlify.toml para evitar module resolution..."
cat > .netlify.toml << 'EOF'
[build]
  publish = "netlify-deploy"
  ignore = "git diff --quiet HEAD^ HEAD"

[build.environment]
  NODE_VERSION = "18"
  NPM_CONFIG_PRODUCTION = "false"
  SKIP_YARN_INSTALL = "true"
EOF
echo "✅ .netlify.toml atualizado"

# 4. Criar .nvmrc específico para netlify-deploy
echo ""
echo "4. Criando .nvmrc em netlify-deploy..."
echo "18" > netlify-deploy/.nvmrc
echo "✅ .nvmrc criado em netlify-deploy"

# 5. Verificar se todos os scripts usam Firebase via CDN
echo ""
echo "5. Verificando uso correto do Firebase via CDN..."

check_firebase_usage() {
    local file="$1"
    local filename=$(basename "$file")
    
    if grep -q "import.*firebase" "$file" || grep -q "require.*firebase" "$file"; then
        echo "❌ $filename usa Firebase como módulo - CORRIGIR!"
        return 1
    else
        echo "✅ $filename usa Firebase via CDN (correto)"
        return 0
    fi
}

all_firebase_ok=true
for jsfile in netlify-deploy/*.js; do
    if [ -f "$jsfile" ]; then
        if ! check_firebase_usage "$jsfile"; then
            all_firebase_ok=false
        fi
    fi
done

echo ""
echo "📋 5. VERIFICAÇÃO FINAL"
echo "===================="

echo "🔍 Estrutura final:"
ls -la netlify-deploy/

echo ""
echo "🔍 Sintaxe JavaScript final:"
for jsfile in netlify-deploy/*.js; do
    if [ -f "$jsfile" ]; then
        filename=$(basename "$jsfile")
        if node -c "$jsfile" 2>/dev/null; then
            echo "✅ $filename"
        else
            echo "❌ $filename - ERRO DE SINTAXE"
            node -c "$jsfile"
        fi
    fi
done

echo ""
echo "🎯 === RESULTADO ==="
echo "=================="

if [ "$all_firebase_ok" = true ]; then
    echo "✅ Correções aplicadas com sucesso!"
    echo ""
    echo "📋 CONFIGURAÇÃO NETLIFY ATUALIZADA:"
    echo "Build command: (VAZIO)"
    echo "Publish directory: netlify-deploy"
    echo "Node.js version: 18"
    echo ""
    echo "🚀 Tente o deploy novamente. O missing module error deve estar resolvido."
else
    echo "❌ Problemas de Firebase módulo identificados!"
    echo "   Alguns arquivos ainda usam Firebase como módulo em vez de CDN."
    echo "   Isso pode estar causando o missing module error."
fi

echo ""
echo "💾 Para restaurar package.json original:"
echo "mv package.json.backup-netlify package.json"
