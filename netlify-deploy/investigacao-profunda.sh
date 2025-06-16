#!/bin/bash

echo "🚨 INVESTIGAÇÃO PROFUNDA - Por que os botões somem?"
echo "=================================================="

echo ""
echo "1. Verificando se há outras definições de createActionButtons..."
grep -n "createActionButtons.*=" netlify-deploy/admin.js
echo ""

echo "2. Verificando se há redefinições da função..."
grep -A10 -B5 "createActionButtons.*function" netlify-deploy/admin.js
echo ""

echo "3. Procurando por qualquer outro createActionButtons no código..."
find netlify-deploy/ -name "*.js" -exec grep -l "createActionButtons" {} \;
echo ""

echo "4. Verificando se há algum innerHTML ou replace que pode estar apagando botões..."
grep -n "innerHTML.*=" netlify-deploy/admin.js | head -5
echo ""

echo "5. Verificando se há algum event listener ou delegation que pode estar conflitando..."
grep -n "addEventListener\|onclick\|handleGlobal" netlify-deploy/admin.js | head -5
echo ""

echo "6. Procurando por qualquer código que possa estar limpando ou resetando a tabela..."
grep -n "table.*innerHTML\|tbody.*innerHTML\|clear\|reset\|empty" netlify-deploy/admin.js
echo ""

echo "7. Verificando se há algum script externo que pode estar interferindo..."
ls -la netlify-deploy/*.js | grep -v admin.js
echo ""

echo "8. Buscando por possíveis reinicializações de DOM..."
grep -n "load.*Purchase\|refresh\|render.*table" netlify-deploy/admin.js | head -5
echo ""

echo "=================================================="
echo "✅ Investigação concluída!"
