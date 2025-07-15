#!/bin/bash

echo "🔍 === DIAGNÓSTICO: PROBLEMA SALVAMENTO CONFIGURAÇÕES ==="
echo "====================================================="
echo "PROBLEMA: Campos PIX, email e telefone não salvam"
echo "FUNCIONA: Apenas data do sorteio"
echo ""

cd /home/nicps/Documents/Projetos/RifaThomas

echo "1. 📋 VERIFICANDO CÓDIGO DE SALVAMENTO..."
echo ""

echo "Função saveConfiguration em admin.js:"
grep -A 20 "async function saveConfiguration" netlify-deploy/admin.js | head -20

echo ""
echo "2. 🔥 VERIFICANDO FUNÇÃO saveConfig no Firebase..."
echo ""

echo "Função saveConfig em firebase-config.js:"
grep -A 15 "async saveConfig(config)" netlify-deploy/firebase-config.js | head -15

echo ""
echo "3. 🔍 VERIFICANDO IDs DOS CAMPOS NO HTML..."
echo ""

echo "Verificando se os IDs dos campos existem no admin.html:"
echo ""

# Verificar campos específicos que não funcionam
campos_problema=("config-pix-key" "config-contact-email" "config-contact-phone")
campos_funciona=("config-draw-date")

echo "❌ CAMPOS COM PROBLEMA:"
for campo in "${campos_problema[@]}"; do
    if grep -q "id=\"$campo\"" netlify-deploy/admin.html; then
        echo "  ✅ $campo - ID encontrado no HTML"
    else
        echo "  ❌ $campo - ID NÃO encontrado no HTML"
    fi
done

echo ""
echo "✅ CAMPOS QUE FUNCIONAM:"
for campo in "${campos_funciona[@]}"; do
    if grep -q "id=\"$campo\"" netlify-deploy/admin.html; then
        echo "  ✅ $campo - ID encontrado no HTML"
    else
        echo "  ❌ $campo - ID NÃO encontrado no HTML"
    fi
done

echo ""
echo "4. 🔧 CRIANDO VERSÃO CORRIGIDA DO ADMIN.JS..."
echo ""

# Backup do arquivo atual
cp netlify-deploy/admin.js netlify-deploy/admin.js.backup-problema-salvar

echo "✅ Backup criado: admin.js.backup-problema-salvar"

echo ""
echo "5. 📊 ANÁLISE POSSÍVEIS CAUSAS:"
echo "==============================="
echo ""
echo "CAUSA 1: IDs dos campos não existem no HTML"
echo "CAUSA 2: Campos são criados dinamicamente e não existem quando saveConfiguration executa"
echo "CAUSA 3: Função loadConfiguration recarrega dados antigos após salvar"
echo "CAUSA 4: Problema nas regras do Firestore para campos específicos"
echo "CAUSA 5: JavaScript não consegue acessar os valores dos campos"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "=================="
echo "1. Verificar se os campos existem no DOM quando saveConfiguration executa"
echo "2. Adicionar logs detalhados para cada campo"
echo "3. Verificar se loadConfiguration está sobrepondo valores salvos"
echo "4. Testar salvamento direto no Firebase sem recarregar"
