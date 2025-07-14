#!/bin/bash

echo "=== DIAGNÓSTICO FINAL NETLIFY ==="
echo "Data: $(date)"
echo ""

cd /home/nicps/Documents/Projetos/RifaThomas

echo "1. ESTRUTURA LIMPA DO PROJETO:"
echo "------------------------------"
echo "netlify-deploy/ contém:"
ls -la netlify-deploy/
echo ""

echo "2. CONFIGURAÇÕES NETLIFY:"
echo "-------------------------"
echo "=== .netlify.toml ==="
cat .netlify.toml
echo ""

echo "=== package.json (build) ==="
grep -A 3 '"build"' package.json
echo ""

echo "3. VERIFICAÇÃO TÉCNICA:"
echo "----------------------"
echo "Node.js: $(node --version 2>/dev/null || echo 'Não instalado')"
echo "NPM: $(npm --version 2>/dev/null || echo 'Não instalado')"
echo ""

echo "4. SINTAXE DOS ARQUIVOS:"
echo "-----------------------"
for jsfile in netlify-deploy/*.js; do
    if [ -f "$jsfile" ]; then
        filename=$(basename "$jsfile")
        if node -c "$jsfile" 2>/dev/null; then
            echo "✓ $filename - Sintaxe OK"
        else
            echo "❌ $filename - ERRO na sintaxe"
        fi
    fi
done
echo ""

echo "5. TESTE LOCAL:"
echo "--------------"
cd netlify-deploy
echo "Iniciando servidor na porta 8001..."
python3 -m http.server 8001 > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

if curl -s http://localhost:8001 > /dev/null 2>&1; then
    echo "✓ Servidor local funcionando"
    echo "  - Site: http://localhost:8001"
    echo "  - Admin: http://localhost:8001/admin.html"
else
    echo "❌ Servidor local com problemas"
fi

kill $SERVER_PID 2>/dev/null
cd ..
echo ""

echo "6. CONFIGURAÇÃO NETLIFY RECOMENDADA:"
echo "------------------------------------"
echo "Build settings no Netlify Dashboard:"
echo "  - Build command: echo 'Static site - no build needed'"
echo "  - Publish directory: netlify-deploy"
echo "  - Node.js version: 18 (especificado em .nvmrc)"
echo ""

echo "7. PRÓXIMOS PASSOS:"
echo "------------------"
echo "a) Commit e push das mudanças:"
echo "   git add ."
echo "   git commit -m 'Deploy limpo netlify-deploy'"
echo "   git push origin main"
echo ""
echo "b) No Netlify, verificar configurações:"
echo "   - Site Settings > Build & deploy"
echo "   - Deploy settings > Build settings"
echo "   - Environment variables (se necessário)"
echo ""
echo "c) Se erro persistir, copiar LOGS COMPLETOS do deploy:"
echo "   - Deploy log completo"
echo "   - Error details"
echo "   - Build log"
echo ""

echo "DIAGNÓSTICO CONCLUÍDO"
echo "===================="
