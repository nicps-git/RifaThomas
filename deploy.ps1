# 🚀 Script de Deploy - Rifa Chá Thomas
# PowerShell script para deploy automatizado no Firebase

Write-Host "🚀 Iniciando deploy da Rifa Thomas..." -ForegroundColor Cyan

# Verificar se Firebase CLI está instalado
try {
    firebase --version
    Write-Host "✅ Firebase CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI não encontrado. Instale com: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

# Verificar se está logado no Firebase
$loginCheck = firebase projects:list 2>&1
if ($loginCheck -like "*not logged in*" -or $loginCheck -like "*Error*") {
    Write-Host "🔑 Fazendo login no Firebase..." -ForegroundColor Yellow
    firebase login
}

# Verificar se o projeto está configurado
if (!(Test-Path "firebase.json")) {
    Write-Host "⚙️ Inicializando projeto Firebase..." -ForegroundColor Yellow
    firebase init
}

# Build do projeto (verificações)
Write-Host "🔧 Verificando arquivos..." -ForegroundColor Yellow

$requiredFiles = @(
    "index.html",
    "admin.html", 
    "login.html",
    "firebase-config.js",
    "script.js",
    "admin.js",
    "styles.css",
    "admin.css"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file não encontrado" -ForegroundColor Red
        exit 1
    }
}

# Deploy para Firebase
Write-Host "🚀 Fazendo deploy..." -ForegroundColor Cyan
firebase deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "📱 Acesse sua rifa online:" -ForegroundColor Cyan
    
    # Obter URL do projeto
    $projectId = (Get-Content firebase.json | ConvertFrom-Json).hosting.target
    if ($projectId) {
        Write-Host "🌐 https://$projectId.web.app" -ForegroundColor Blue
    }
    
    Write-Host "🔧 Painel Admin: /admin.html" -ForegroundColor Yellow
    Write-Host "🔑 Login Admin: /login.html" -ForegroundColor Yellow
} else {
    Write-Host "❌ Erro no deploy. Verifique as mensagens acima." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Teste a rifa online" -ForegroundColor White
Write-Host "2. Crie a primeira conta admin em /login.html" -ForegroundColor White
Write-Host "3. Configure os dados no painel admin" -ForegroundColor White
Write-Host "4. Compartilhe o link da rifa!" -ForegroundColor White