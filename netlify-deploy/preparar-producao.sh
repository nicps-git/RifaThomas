#!/bin/bash

# Script para remover elementos de debug e preparar para produção
echo "🚀 PREPARANDO PARA PRODUÇÃO - RIFA THOMAS"
echo "========================================"

# Verificar se estamos no diretório correto
if [ ! -f "index.html" ] || [ ! -f "script.js" ]; then
    echo "❌ Erro: Execute este script no diretório netlify-deploy"
    exit 1
fi

echo "✅ Diretório correto detectado"
echo ""

# Fazer backup antes das alterações
backup_dir="backup-antes-producao-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
cp index.html script.js "$backup_dir/"
echo "✅ Backup criado em: $backup_dir"

echo ""
echo "🧹 REMOVENDO ELEMENTOS DE DEBUG:"
echo "--------------------------------"

# Remover botão debug do HTML
if grep -q "debugRifaNumbers()" index.html; then
    # Comentar a linha do botão debug
    sed -i 's/.*debugRifaNumbers().*/<!-- DEBUG BUTTON REMOVIDO PARA PRODUÇÃO -->/' index.html
    echo "✅ Botão debug removido do HTML"
else
    echo "ℹ️ Botão debug já foi removido"
fi

# Remover área de notificação debug se não necessária (comentar apenas)
if grep -q "notification-area" index.html; then
    sed -i 's/.*notification-area.*/<!-- ÁREA DE NOTIFICAÇÃO DEBUG (comentada para produção) -->/' index.html
    echo "✅ Área de notificação debug comentada"
fi

# Reduzir logs no JavaScript (manter apenas logs essenciais)
echo ""
echo "🔇 CONFIGURANDO LOGS PARA PRODUÇÃO:"
echo "----------------------------------"

# Criar versão de produção do script.js com logs reduzidos
cp script.js script-development.js
echo "✅ Backup de desenvolvimento salvo como script-development.js"

# Comentar console.log não essenciais (manter apenas os importantes)
sed -i 's/^[[:space:]]*console\.log.*Debug:/\/\/ &/' script.js
sed -i 's/^[[:space:]]*console\.log.*🔧:/\/\/ &/' script.js
sed -i 's/^[[:space:]]*console\.log.*debug:/\/\/ &/' script.js

echo "✅ Logs de debug comentados (logs essenciais mantidos)"

echo ""
echo "📊 OTIMIZANDO PARA PRODUÇÃO:"
echo "----------------------------"

# Verificar se existem TODOs ou FIXMEs
todo_count=$(grep -c "TODO\|FIXME\|XXX" *.js *.html 2>/dev/null || echo "0")
if [ "$todo_count" -gt 0 ]; then
    echo "⚠️ Encontrados $todo_count comentários TODO/FIXME/XXX"
    echo "   Revise antes do deploy final"
else
    echo "✅ Nenhum TODO/FIXME pendente encontrado"
fi

# Verificar tamanho dos arquivos
echo ""
echo "📏 TAMANHOS DOS ARQUIVOS:"
for file in index.html script.js admin.js styles.css; do
    if [ -f "$file" ]; then
        size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
        echo "   $file: ${size} bytes"
    fi
done

echo ""
echo "🔒 CONFIGURAÇÕES DE SEGURANÇA:"
echo "------------------------------"

# Verificar se há chaves de API expostas
if grep -q "AIza\|firebase.*apiKey" *.js *.html 2>/dev/null; then
    echo "⚠️ ATENÇÃO: Possíveis chaves de API detectadas"
    echo "   Verifique se estão configuradas corretamente para produção"
else
    echo "✅ Nenhuma chave de API exposta detectada"
fi

echo ""
echo "🚀 CHECKLIST FINAL PARA DEPLOY:"
echo "==============================="

checklist=(
    "✅ Backup realizado"
    "✅ Elementos debug removidos"
    "✅ Logs de produção configurados"
    "⚠️ Testar funcionalidade após remoção debug"
    "⚠️ Configurar Firebase para produção"
    "⚠️ Configurar domínio personalizado (se aplicável)"
    "⚠️ Configurar SSL/HTTPS"
    "⚠️ Testar em diferentes dispositivos"
)

for item in "${checklist[@]}"; do
    echo "$item"
done

echo ""
echo "📝 COMANDOS ÚTEIS:"
echo "=================="
echo "# Restaurar versão de desenvolvimento:"
echo "cp script-development.js script.js"
echo ""
echo "# Testar versão de produção:"
echo "python3 -m http.server 8080"
echo ""
echo "# Deploy no Netlify (se configurado):"
echo "netlify deploy --prod"

echo ""
echo "✨ PREPARAÇÃO PARA PRODUÇÃO CONCLUÍDA!"
echo ""
echo "⚠️ IMPORTANTE: Teste a aplicação antes do deploy final"
echo "   Alguns elementos debug foram removidos e podem afetar a funcionalidade"
echo ""
echo "🔗 Teste em: http://localhost:8080"
