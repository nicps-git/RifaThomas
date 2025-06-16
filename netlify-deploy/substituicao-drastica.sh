#!/bin/bash

echo "🚨 SUBSTITUIÇÃO DRÁSTICA - Forçar Aparição dos Botões"
echo "====================================================="

cd /home/nicps/Documents/Projetos/RifaThomas/netlify-deploy

echo "⚡ Vou substituir temporariamente a função por uma versão que FORÇA botões"

# Fazer backup da versão atual
cp admin.js admin.js.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup criado: admin.js.backup.$(date +%Y%m%d_%H%M%S)"

# Criar substituição temporária
cat > substituicao_temporaria.js << 'EOF'
// ===== SUBSTITUIÇÃO TEMPORÁRIA - FUNÇÃO FORÇADA =====
function createActionButtons(purchase) {
    console.log('🚨 FUNÇÃO FORÇADA ATIVA para:', purchase.id);
    
    // RETORNO HARD-CODED para garantir que aparecem botões
    const botoesForcados = `
        <button onclick="alert('Editar clicado para: ${purchase.id}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
            ✏️ Editar
        </button>
        <button onclick="alert('Debug clicado para: ${purchase.id}')" style="background: #6c757d; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
            🔍 Debug  
        </button>
        <button onclick="alert('Confirmar clicado para: ${purchase.id}')" style="background: #28a745; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
            ✅ Confirmar
        </button>
        <button onclick="alert('Rejeitar clicado para: ${purchase.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
            ❌ Rejeitar
        </button>
    `;
    
    console.log('🚨 RETORNANDO BOTÕES FORÇADOS (', botoesForcados.length, 'chars)');
    return botoesForcados;
}
// ===== FIM DA SUBSTITUIÇÃO TEMPORÁRIA =====
EOF

echo ""
echo "📝 Aplicando substituição temporária..."

# Encontrar a função atual e substituir
python3 << 'PYTHON_SCRIPT'
import re

# Ler o arquivo admin.js
with open('admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Ler a substituição
with open('substituicao_temporaria.js', 'r', encoding='utf-8') as f:
    substituicao = f.read()

# Padrão para encontrar a função createActionButtons
pattern = r'// Criar botões.*?function createActionButtons\(purchase\) \{.*?return buttonsHtml;\s*\}'

# Substituir
new_content = re.sub(pattern, substituicao, content, flags=re.DOTALL)

# Salvar
with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Substituição aplicada com sucesso!")
PYTHON_SCRIPT

# Limpar arquivo temporário
rm substituicao_temporaria.js

echo ""
echo "🎯 TESTE AGORA:"
echo "=============="

# Abrir admin
echo "🔧 Abrindo página admin para teste IMEDIATO..."
if [[ -f "admin.html" ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "admin.html"
    elif command -v open &> /dev/null; then
        open "admin.html"
    else
        echo "   ⚠️ Abra manualmente: file://$(pwd)/admin.html"
    fi
fi

echo ""
echo "📋 INSTRUÇÕES IMEDIATAS:"
echo "======================="
echo "1. 🔐 Faça login na página admin"
echo "2. 👀 Agora DEVE aparecer 4 botões em CADA linha:"
echo "   • ✏️ Editar (azul)"
echo "   • 🔍 Debug (cinza)"
echo "   • ✅ Confirmar (verde)"
echo "   • ❌ Rejeitar (vermelho)"
echo "3. 🧪 Clique em qualquer botão - deve mostrar alert"
echo "4. 📝 Se aparecem: o problema era na lógica da função"
echo "5. 📝 Se NÃO aparecem: o problema é em outro lugar"
echo ""
echo "⚡ RESULTADO ESPERADO:"
echo "   - Se botões aparecem = problema era na função"
echo "   - Se não aparecem = problema é estrutural (DOM, CSS, carregamento)"
echo ""
echo "🔄 Para reverter (se necessário):"
echo "   cp admin.js.backup.* admin.js"
echo ""
echo "🚨 FUNÇÃO TEMPORÁRIA APLICADA! TESTE AGORA!"
