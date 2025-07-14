#!/bin/bash

echo "🔍 === DIAGNÓSTICO AVANÇADO NETLIFY - IDENTIFICAR ARQUIVO/PACKAGE AUSENTE ==="
echo "========================================================================"
echo "Data: $(date)"
echo ""

cd /home/nicps/Documents/Projetos/RifaThomas

echo "📋 1. VERIFICAÇÃO COMPLETA DE DEPENDÊNCIAS E REFERÊNCIAS"
echo "======================================================="

echo ""
echo "🔍 Verificando referências em todos os arquivos HTML..."

# Função para verificar se arquivo/URL existe
check_reference() {
    local file="$1"
    local ref="$2"
    
    if [[ $ref == http* ]] || [[ $ref == https* ]] || [[ $ref == //* ]]; then
        echo "  📡 EXTERNO: $ref"
        # Testar se URL externa está acessível
        if curl -s --head "$ref" >/dev/null 2>&1; then
            echo "    ✅ URL acessível"
        else
            echo "    ⚠️ URL pode estar inacessível"
        fi
    elif [[ $ref == data:* ]]; then
        echo "  📊 DATA URL: ${ref:0:50}..."
    else
        # Verificar arquivo local
        local full_path="netlify-deploy/$ref"
        if [ -f "$full_path" ]; then
            echo "  ✅ LOCAL: $ref ($(wc -c < "$full_path") bytes)"
        else
            echo "  ❌ AUSENTE: $ref"
            echo "    🚨 ARQUIVO NÃO ENCONTRADO: $full_path"
        fi
    fi
}

# Verificar todos os HTMLs
for htmlfile in netlify-deploy/*.html; do
    if [ -f "$htmlfile" ]; then
        filename=$(basename "$htmlfile")
        echo ""
        echo "📄 Analisando: $filename"
        echo "-----------------------------------"
        
        # CSS references
        echo "🎨 CSS References:"
        grep -o 'href="[^"]*"' "$htmlfile" | sed 's/href="//;s/"//' | while read ref; do
            if [[ $ref == *.css ]]; then
                check_reference "$filename" "$ref"
            fi
        done
        
        # JavaScript references
        echo "⚙️ JavaScript References:"
        grep -o 'src="[^"]*\.js[^"]*"' "$htmlfile" | sed 's/src="//;s/"//' | while read ref; do
            check_reference "$filename" "$ref"
        done
        
        # Image references
        echo "🖼️ Image References:"
        grep -o 'src="[^"]*\.\(jpg\|jpeg\|png\|gif\|svg\|webp\|ico\)[^"]*"' "$htmlfile" | sed 's/src="//;s/"//' | while read ref; do
            check_reference "$filename" "$ref"
        done
        
        # Font references
        echo "🔤 Font References:"
        grep -o 'href="[^"]*\.\(woff\|woff2\|ttf\|otf\|eot\)[^"]*"' "$htmlfile" | sed 's/href="//;s/"//' | while read ref; do
            check_reference "$filename" "$ref"
        done
    fi
done

echo ""
echo "📋 2. VERIFICAÇÃO DE IMPORTS E REQUIRES EM JAVASCRIPT"
echo "===================================================="

for jsfile in netlify-deploy/*.js; do
    if [ -f "$jsfile" ]; then
        filename=$(basename "$jsfile")
        echo ""
        echo "📄 Analisando: $filename"
        echo "-----------------------------------"
        
        # ES6 imports
        if grep -q "import.*from" "$jsfile"; then
            echo "📦 ES6 Imports encontrados:"
            grep "import.*from" "$jsfile" | while read line; do
                echo "  🔍 $line"
            done
        fi
        
        # Require statements
        if grep -q "require(" "$jsfile"; then
            echo "📦 Require statements encontrados:"
            grep "require(" "$jsfile" | while read line; do
                echo "  🔍 $line"
            done
        fi
        
        # Firebase imports específicos
        if grep -q "firebase" "$jsfile"; then
            echo "🔥 Firebase references:"
            grep -n "firebase" "$jsfile" | head -5 | while read line; do
                echo "  🔍 $line"
            done
        fi
    fi
done

echo ""
echo "📋 3. VERIFICAÇÃO DE CONFIGURAÇÕES NETLIFY"
echo "=========================================="

echo "📄 .netlify.toml:"
if [ -f ".netlify.toml" ]; then
    cat .netlify.toml
else
    echo "❌ .netlify.toml não encontrado"
fi

echo ""
echo "📄 .netlifyignore:"
if [ -f ".netlifyignore" ]; then
    echo "✅ .netlifyignore existe"
    echo "Primeiras 10 linhas:"
    head -10 .netlifyignore
else
    echo "❌ .netlifyignore não encontrado"
fi

echo ""
echo "📄 package.json em netlify-deploy:"
if [ -f "netlify-deploy/package.json" ]; then
    cat netlify-deploy/package.json
else
    echo "❌ package.json não encontrado em netlify-deploy"
fi

echo ""
echo "📋 4. VERIFICAÇÃO DE SINTAXE E ESTRUTURA"
echo "======================================="

for jsfile in netlify-deploy/*.js; do
    if [ -f "$jsfile" ]; then
        filename=$(basename "$jsfile")
        echo "🔍 Verificando sintaxe: $filename"
        if node -c "$jsfile" 2>/dev/null; then
            echo "  ✅ Sintaxe OK"
        else
            echo "  ❌ ERRO DE SINTAXE:"
            node -c "$jsfile" 2>&1 | head -3
        fi
    fi
done

echo ""
echo "📋 5. TESTE DE SERVIDOR LOCAL"
echo "============================"

cd netlify-deploy
echo "🚀 Iniciando servidor local para teste..."
python3 -m http.server 8002 > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

echo "🔍 Testando páginas principais..."
test_page() {
    local page="$1"
    local url="http://localhost:8002/$page"
    
    if curl -s "$url" >/dev/null 2>&1; then
        echo "  ✅ $page - Carrega OK"
    else
        echo "  ❌ $page - ERRO no carregamento"
    fi
}

test_page ""
test_page "admin.html"
test_page "login.html"
test_page "sorteio.html"
test_page "styles.css"
test_page "script.js"

kill $SERVER_PID 2>/dev/null
cd ..

echo ""
echo "📋 6. LISTA FINAL DE ARQUIVOS EM NETLIFY-DEPLOY"
echo "=============================================="
echo "Total de arquivos: $(ls netlify-deploy/ | wc -l)"
echo ""
ls -la netlify-deploy/

echo ""
echo "📋 7. POSSÍVEIS PROBLEMAS IDENTIFICADOS"
echo "======================================"

# Verificar problemas comuns
echo "🔍 Verificando problemas comuns..."

# Arquivo .env ou configurações
if grep -r "process\.env" netlify-deploy/ 2>/dev/null; then
    echo "⚠️ Uso de process.env encontrado - pode precisar de environment variables"
fi

# Imports relativos problemáticos
if grep -r "import.*\.\/" netlify-deploy/ 2>/dev/null; then
    echo "⚠️ Imports relativos encontrados - verificar se arquivos existem"
fi

# Referências ao node_modules
if grep -r "node_modules" netlify-deploy/ 2>/dev/null; then
    echo "⚠️ Referências a node_modules encontradas"
fi

echo ""
echo "🎯 === RESUMO DO DIAGNÓSTICO ==="
echo "=============================="
echo "✅ Estrutura básica verificada"
echo "✅ Sintaxe JavaScript verificada" 
echo "✅ Servidor local testado"
echo "✅ Configurações Netlify verificadas"
echo ""
echo "📋 Para resolver o erro, verifique:"
echo "1. Logs completos do Netlify (se disponíveis)"
echo "2. Environment variables necessárias"
echo "3. Arquivos ausentes identificados acima"
echo "4. URLs externas inacessíveis"
echo ""
echo "💡 Próximo passo: Copie os logs COMPLETOS do erro do Netlify"
echo "   para identificação precisa do problema."
