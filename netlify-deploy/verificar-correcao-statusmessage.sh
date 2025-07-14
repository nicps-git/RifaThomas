#!/bin/bash

# Script para verificar a correção do erro "statusMessage is not defined"
# e validar outras variáveis potencialmente não definidas

echo "🔧 === VERIFICAÇÃO DA CORREÇÃO STATUSMESSAGE ==="
echo
echo "📁 Diretório de trabalho: $(pwd)"
echo "📅 Data/Hora: $(date)"
echo

# Definir arquivo alvo
ADMIN_FILE="/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/admin.js"

if [ ! -f "$ADMIN_FILE" ]; then
    echo "❌ Arquivo admin.js não encontrado: $ADMIN_FILE"
    exit 1
fi

echo "✅ Arquivo encontrado: $ADMIN_FILE"
echo

# 1. Verificar se o erro "statusMessage" foi corrigido
echo "🔍 1. Verificando correção do statusMessage..."
echo

# Procurar por referências antigas (problemáticas)
OLD_REFS=$(grep -n "statusMessage\.join" "$ADMIN_FILE" 2>/dev/null || true)
if [ -n "$OLD_REFS" ]; then
    echo "❌ Ainda existem referências problemáticas ao statusMessage:"
    echo "$OLD_REFS"
else
    echo "✅ Nenhuma referência problemática ao statusMessage encontrada"
fi

# Procurar por referências novas (corretas)
NEW_REFS=$(grep -n "statusMessages\.join" "$ADMIN_FILE" 2>/dev/null || true)
if [ -n "$NEW_REFS" ]; then
    echo "✅ Referências corretas ao statusMessages encontradas:"
    echo "$NEW_REFS"
else
    echo "⚠️ Nenhuma referência ao statusMessages encontrada"
fi

echo

# 2. Verificar se a variável statusMessages é definida
echo "🔍 2. Verificando definição da variável statusMessages..."
echo

DEFINITION=$(grep -n "const statusMessages" "$ADMIN_FILE" 2>/dev/null || true)
if [ -n "$DEFINITION" ]; then
    echo "✅ Definição da variável statusMessages encontrada:"
    echo "$DEFINITION"
else
    echo "❌ Definição da variável statusMessages não encontrada"
fi

echo

# 3. Verificar outras variáveis potencialmente não definidas
echo "🔍 3. Procurando outras variáveis potencialmente não definidas..."
echo

# Lista de padrões suspeitos
SUSPICIOUS_PATTERNS=(
    "\.join\(" 
    "\.push\("
    "\.length"
    "\.forEach\("
    "\.map\("
    "\.filter\("
)

for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
    echo "   Procurando padrão: $pattern"
    MATCHES=$(grep -n "$pattern" "$ADMIN_FILE" | head -5)
    if [ -n "$MATCHES" ]; then
        echo "      Encontradas $(echo "$MATCHES" | wc -l) ocorrências (mostrando primeiras 5):"
        echo "$MATCHES" | sed 's/^/         /'
    else
        echo "      Nenhuma ocorrência encontrada"
    fi
    echo
done

# 4. Verificar função saveConfiguration específica
echo "🔍 4. Analisando função saveConfiguration..."
echo

# Extrair apenas a função saveConfiguration
SAVE_CONFIG_START=$(grep -n "async function saveConfiguration" "$ADMIN_FILE" | cut -d: -f1)
if [ -n "$SAVE_CONFIG_START" ]; then
    echo "✅ Função saveConfiguration encontrada na linha $SAVE_CONFIG_START"
    
    # Procurar o fim da função (próxima função ou fim do arquivo)
    SAVE_CONFIG_END=$(tail -n +$((SAVE_CONFIG_START + 1)) "$ADMIN_FILE" | grep -n "^async function\|^function\|^}" | head -1 | cut -d: -f1)
    if [ -n "$SAVE_CONFIG_END" ]; then
        SAVE_CONFIG_END=$((SAVE_CONFIG_START + SAVE_CONFIG_END))
        echo "   Função termina aproximadamente na linha $SAVE_CONFIG_END"
        
        # Extrair a função e verificar variáveis
        echo "   Verificando variáveis na função..."
        FUNCTION_CONTENT=$(sed -n "${SAVE_CONFIG_START},${SAVE_CONFIG_END}p" "$ADMIN_FILE")
        
        # Verificar statusMessages
        if echo "$FUNCTION_CONTENT" | grep -q "const statusMessages"; then
            echo "   ✅ statusMessages é definido na função"
        else
            echo "   ❌ statusMessages não é definido na função"
        fi
        
        # Verificar uso de statusMessages
        if echo "$FUNCTION_CONTENT" | grep -q "statusMessages\.join"; then
            echo "   ✅ statusMessages.join() é usado corretamente"
        else
            echo "   ❌ statusMessages.join() não é usado"
        fi
        
    else
        echo "   ⚠️ Não foi possível determinar o fim da função"
    fi
else
    echo "❌ Função saveConfiguration não encontrada"
fi

echo

# 5. Gerar relatório de correção
echo "📋 === RELATÓRIO DE CORREÇÃO ==="
echo

# Verificar se a correção foi bem-sucedida
if grep -q "const statusMessages.*=.*\[" "$ADMIN_FILE" && \
   grep -q "statusMessages\.join" "$ADMIN_FILE" && \
   ! grep -q "statusMessage\.join" "$ADMIN_FILE"; then
    
    echo "🎉 CORREÇÃO BEM-SUCEDIDA!"
    echo "   ✅ Variável statusMessages definida"
    echo "   ✅ Uso correto de statusMessages.join()"
    echo "   ✅ Referências problemáticas removidas"
    
else
    echo "❌ CORREÇÃO INCOMPLETA!"
    echo "   Verifique os itens acima para identificar problemas restantes"
fi

echo

# 6. Criar backup da correção
echo "💾 6. Criando backup da correção..."
BACKUP_DIR="/home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/backups"
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/admin-statusmessage-corrigido-$(date +%Y%m%d_%H%M%S).js"
cp "$ADMIN_FILE" "$BACKUP_FILE"
echo "✅ Backup criado: $BACKUP_FILE"

echo

# 7. Sugestões de teste
echo "🧪 === SUGESTÕES DE TESTE ==="
echo
echo "Para validar a correção, execute os seguintes testes:"
echo
echo "1. Abrir o arquivo de teste:"
echo "   firefox /home/nicps/Documents/Projetos/RifaThomas/netlify-deploy/teste-correcao-statusmessage.html"
echo
echo "2. Testar salvamento de configurações no admin real:"
echo "   - Acesse a página admin.html"
echo "   - Tente alterar a data do sorteio"
echo "   - Clique em 'Salvar Configurações'"
echo "   - Verifique se não há erro de 'statusMessage is not defined'"
echo
echo "3. Verificar logs do console do navegador:"
echo "   - Abrir DevTools (F12)"
echo "   - Aba Console"
echo "   - Procurar por erros relacionados a statusMessage"
echo

echo "✅ Verificação completa!"
echo "📋 Para mais detalhes, revise os itens acima."
