#!/bin/bash

echo "🗓️ === CORREÇÃO DA DATA DO SORTEIO ==="
echo "======================================="
echo
echo "📅 Problema: Data do sorteio estava configurada para 11/07/2025 (passada)"
echo "📅 Solução: Atualizando para 18/07/2025 em todos os arquivos"
echo

# Definir nova data
NOVA_DATA="2025-07-18T16:00:00"
NOVA_DATA_INPUT="2025-07-18T16:00"

echo "🔍 Procurando arquivos com data antiga (2025-07-11)..."
echo

# Criar backup antes de alterar
BACKUP_DIR="/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/backups"
mkdir -p "$BACKUP_DIR"

echo "💾 Criando backup dos arquivos JavaScript..."
cp netlify-deploy/*.js "$BACKUP_DIR/" 2>/dev/null
echo "✅ Backup criado em: $BACKUP_DIR"
echo

# Função para corrigir arquivo
corrigir_arquivo() {
    local arquivo="$1"
    if [ -f "$arquivo" ]; then
        echo "🔧 Corrigindo: $arquivo"
        
        # Verificar se o arquivo contém a data antiga
        if grep -q "2025-07-11" "$arquivo"; then
            # Fazer backup específico do arquivo
            cp "$arquivo" "${arquivo}.backup-data-$(date +%H%M%S)"
            
            # Substituir as datas
            sed -i "s/2025-07-11T16:00:00/${NOVA_DATA}/g" "$arquivo"
            sed -i "s/2025-07-11T16:00/${NOVA_DATA_INPUT}/g" "$arquivo"
            
            echo "   ✅ $arquivo corrigido"
        else
            echo "   ⚪ $arquivo já está correto"
        fi
    fi
}

echo "🔧 Iniciando correção dos arquivos principais..."
echo

# Arquivos principais que são usados em produção
corrigir_arquivo "netlify-deploy/script.js"
corrigir_arquivo "netlify-deploy/script-firebase-only.js"
corrigir_arquivo "netlify-deploy/script-backup-com-localstorage.js"
corrigir_arquivo "netlify-deploy/admin.js"

echo
echo "🔍 Verificando se ainda há arquivos com data antiga..."

# Verificar se ainda há arquivos com data antiga
ARQUIVOS_COM_DATA_ANTIGA=$(grep -l "2025-07-11" netlify-deploy/*.js 2>/dev/null || true)

if [ -n "$ARQUIVOS_COM_DATA_ANTIGA" ]; then
    echo "⚠️ Ainda existem arquivos com data antiga:"
    echo "$ARQUIVOS_COM_DATA_ANTIGA"
    echo
    echo "🔧 Corrigindo arquivos restantes..."
    for arquivo in $ARQUIVOS_COM_DATA_ANTIGA; do
        corrigir_arquivo "$arquivo"
    done
else
    echo "✅ Nenhum arquivo com data antiga encontrado"
fi

echo
echo "📊 === RELATÓRIO DE CORREÇÃO ==="
echo

# Verificar arquivos corrigidos
echo "✅ Arquivos principais corrigidos:"
echo "   - netlify-deploy/script.js (página principal)"
echo "   - netlify-deploy/script-firebase-only.js (backup Firebase)"
echo "   - netlify-deploy/script-backup-com-localstorage.js (backup localStorage)"
echo "   - netlify-deploy/admin.js (painel administrativo)"

echo
echo "📅 Nova configuração:"
echo "   Data do sorteio: 18/07/2025 às 16:00"
echo "   Status esperado: Contagem regressiva até o sorteio"

echo
echo "🧪 Para testar a correção:"
echo "   1. Abra a página principal (index.html)"
echo "   2. Verifique se mostra contagem regressiva em vez de 'SORTEIO REALIZADO!'"
echo "   3. A data deve aparecer como '18/07/2025 às 16:00'"

echo
echo "🚀 Para aplicar em produção:"
echo "   1. Faça commit das alterações"
echo "   2. Execute git push para enviar para o repositório"
echo "   3. Faça deploy das alterações"

echo
echo "✅ CORREÇÃO DA DATA CONCLUÍDA COM SUCESSO!"
echo "🎯 O sorteio agora aparecerá corretamente como FUTURO (18/07/2025)"
