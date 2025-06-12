#!/bin/bash

echo "🔍 VERIFICANDO DADOS EXISTENTES"
echo "================================"

# Criar um pequeno script para verificar localStorage via navegador
cat << 'EOF' > /tmp/check_localStorage.html
<!DOCTYPE html>
<html>
<head><title>Check localStorage</title></head>
<body>
<h2>Dados do localStorage:</h2>
<div id="output"></div>
<script>
function checkData() {
    const purchases = localStorage.getItem('purchases');
    const rifaData = localStorage.getItem('rifaData');
    const config = localStorage.getItem('config');
    
    let output = '<h3>purchases:</h3>';
    if (purchases) {
        const data = JSON.parse(purchases);
        output += `<p>Total: ${data.length} compras</p>`;
        output += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } else {
        output += '<p>Nenhum dado encontrado</p>';
    }
    
    output += '<h3>rifaData:</h3>';
    if (rifaData) {
        output += `<pre>${JSON.stringify(JSON.parse(rifaData), null, 2)}</pre>`;
    } else {
        output += '<p>Nenhum dado encontrado</p>';
    }
    
    output += '<h3>config:</h3>';
    if (config) {
        output += `<pre>${JSON.stringify(JSON.parse(config), null, 2)}</pre>`;
    } else {
        output += '<p>Nenhum dado encontrado</p>';
    }
    
    document.getElementById('output').innerHTML = output;
}
checkData();
</script>
</body>
</html>
EOF

echo "✅ Arquivo de verificação criado: /tmp/check_localStorage.html"
echo ""
echo "📋 Para verificar dados do localStorage:"
echo "1. Abra: http://localhost:8000/../../../tmp/check_localStorage.html"
echo "2. Ou execute o diagnóstico Firebase: http://localhost:8000/teste-firebase-diagnostico.html"
echo ""
echo "🔍 Verificando se há dados armazenados localmente no projeto..."

# Verificar se existem arquivos de backup com dados
if [ -f "purchases-backup.json" ]; then
    echo "✅ Encontrado: purchases-backup.json"
    echo "📊 Conteúdo:"
    head -n 5 purchases-backup.json
    echo "..."
else
    echo "❌ Não encontrado: purchases-backup.json"
fi

# Verificar se admin tem dados
if [ -d "netlify-deploy" ]; then
    echo ""
    echo "🔍 Verificando pasta netlify-deploy..."
    
    if ls netlify-deploy/*.html | grep -q admin; then
        echo "✅ Admin pages encontradas:"
        ls netlify-deploy/admin*.html | head -3
    fi
fi

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Abra o teste Firebase: http://localhost:8000/teste-firebase-diagnostico.html"
echo "2. Execute todos os testes na ordem"
echo "3. Se Firebase funcionar, migre dados do localStorage para Firebase"
echo "4. Configure página principal para usar dados do Firebase"
