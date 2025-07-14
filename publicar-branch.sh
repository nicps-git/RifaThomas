#!/bin/bash

echo "🚀 PUBLICANDO BRANCH RIFATOMAHAS-IMPROVEMENTS"
echo "============================================="

# Navegar para o diretório do projeto
cd /home/nicps/Documents/Projetos/RifaThomas

echo "📍 Diretório atual: $(pwd)"

echo ""
echo "1. Verificando status do repositório..."
git status

echo ""
echo "2. Verificando branch atual..."
git branch --show-current

echo ""
echo "3. Verificando commits a serem enviados..."
git log --oneline -5

echo ""
echo "4. Verificando configuração do remote..."
git remote -v

echo ""
echo "5. Configurando remote se necessário..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/nicps-git/RifaThomas.git

echo ""
echo "6. Verificando remote configurado..."
git remote -v

echo ""
echo "7. Fazendo fetch para sincronizar..."
git fetch origin

echo ""
echo "8. Publicando a branch rifatomahas-improvements..."
git push -u origin rifatomahas-improvements

echo ""
echo "============================================="
echo "✅ BRANCH PUBLICADA COM SUCESSO!"
echo ""
echo "🔗 Acesse: https://github.com/nicps-git/RifaThomas/tree/rifatomahas-improvements"
echo ""
echo "Para criar um Pull Request:"
echo "🔗 https://github.com/nicps-git/RifaThomas/compare/main...rifatomahas-improvements"
echo ""
echo "Branch contém as melhorias dos botões de confirmação do admin!"
echo "============================================="
