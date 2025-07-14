#!/bin/bash

echo "=== Limpando diretório netlify-deploy para deploy ==="

cd /home/nicps/Documents/Projetos/RifaThomas

# Backup do diretório atual
if [ -d "netlify-deploy-backup-$(date +%Y%m%d)" ]; then
    rm -rf "netlify-deploy-backup-$(date +%Y%m%d)"
fi
cp -r netlify-deploy "netlify-deploy-backup-$(date +%Y%m%d)"

echo "✓ Backup criado: netlify-deploy-backup-$(date +%Y%m%d)"

# Lista de arquivos essenciais para manter
ESSENTIAL_FILES=(
    "index.html"
    "admin.html"  
    "login.html"
    "sorteio.html"
    "styles.css"
    "admin.css"
    "script.js"
    "admin.js"
    "sorteio.js"
    "firebase-config.js"
    "_redirects"
)

# Criar diretório temporário limpo
mkdir -p netlify-deploy-clean

# Copiar apenas arquivos essenciais
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "netlify-deploy/$file" ]; then
        cp "netlify-deploy/$file" "netlify-deploy-clean/"
        echo "✓ Copiado: $file"
    else
        echo "⚠ Arquivo não encontrado: $file"
    fi
done

# Substituir o diretório original
rm -rf netlify-deploy
mv netlify-deploy-clean netlify-deploy

echo ""
echo "=== Conteúdo final do netlify-deploy ==="
ls -la netlify-deploy/

echo ""
echo "=== Verificando sintaxe dos arquivos JavaScript ==="

# Verificar sintaxe JavaScript
for jsfile in netlify-deploy/*.js; do
    if [ -f "$jsfile" ]; then
        echo "Verificando: $(basename $jsfile)"
        node -c "$jsfile" && echo "✓ OK" || echo "✗ ERRO na sintaxe"
    fi
done

echo ""
echo "=== Verificando referências nos HTMLs ==="

# Verificar se todos os arquivos referenciados existem
for htmlfile in netlify-deploy/*.html; do
    if [ -f "$htmlfile" ]; then
        echo "Verificando referências em: $(basename $htmlfile)"
        
        # Verificar CSS
        grep -o 'href="[^"]*\.css"' "$htmlfile" | sed 's/href="//;s/"//' | while read cssfile; do
            if [ -f "netlify-deploy/$cssfile" ]; then
                echo "  ✓ CSS: $cssfile"
            else
                echo "  ✗ CSS não encontrado: $cssfile"
            fi
        done
        
        # Verificar JS
        grep -o 'src="[^"]*\.js"' "$htmlfile" | sed 's/src="//;s/"//' | while read jsfile; do
            if [[ $jsfile == http* ]] || [[ $jsfile == https* ]] || [[ $jsfile == //* ]]; then
                echo "  ✓ JS externo: $jsfile"
            elif [ -f "netlify-deploy/$jsfile" ]; then
                echo "  ✓ JS: $jsfile"
            else
                echo "  ✗ JS não encontrado: $jsfile"
            fi
        done
    fi
done

echo ""
echo "=== Limpeza concluída! ==="
echo "Arquivos mantidos em netlify-deploy:"
echo "$(ls netlify-deploy/ | wc -l) arquivos"
echo ""
echo "Backup disponível em: netlify-deploy-backup-$(date +%Y%m%d)"
