# 🚀 Deploy Docker - Rifa Thomas
# Script automatizado para build e deploy

Write-Host "🐳 Deploy Docker - Rifa Chá Thomas" -ForegroundColor Cyan

# Verificar se Docker está instalado e rodando
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado. Execute: .\install-docker.ps1" -ForegroundColor Red
    exit 1
}

# Verificar se Docker está rodando
try {
    docker ps | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Abra Docker Desktop" -ForegroundColor Red
    Write-Host "💡 Aguardando Docker iniciar..." -ForegroundColor Yellow
    Start-Sleep 10
}

# Parar container existente se houver
Write-Host "🧹 Limpando containers anteriores..." -ForegroundColor Yellow
docker stop rifa-thomas-app 2>$null
docker rm rifa-thomas-app 2>$null

# Build da imagem
Write-Host "🔨 Construindo imagem Docker..." -ForegroundColor Cyan
docker build -t rifa-thomas .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build da imagem" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Imagem construída com sucesso!" -ForegroundColor Green

# Executar container
Write-Host "🚀 Iniciando container..." -ForegroundColor Cyan
docker run -d -p 3000:80 --name rifa-thomas-app rifa-thomas

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao iniciar container" -ForegroundColor Red
    exit 1
}

# Aguardar container inicializar
Write-Host "⏳ Aguardando container inicializar..." -ForegroundColor Yellow
Start-Sleep 5

# Verificar se container está rodando
$containerStatus = docker ps --filter "name=rifa-thomas-app" --format "table {{.Status}}"
if ($containerStatus -like "*Up*") {
    Write-Host "✅ Container está rodando!" -ForegroundColor Green
} else {
    Write-Host "❌ Container não está rodando" -ForegroundColor Red
    Write-Host "📋 Logs do container:" -ForegroundColor Yellow
    docker logs rifa-thomas-app
    exit 1
}

# Testar se aplicação responde
Write-Host "🧪 Testando aplicação..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Aplicação respondendo!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Aplicação pode estar iniciando ainda..." -ForegroundColor Yellow
}

# Abrir navegador
Write-Host "🌐 Abrindo navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

# Informações finais
Write-Host "" -ForegroundColor White
Write-Host "🎉 Deploy Docker concluído com sucesso!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📱 URLs da aplicação:" -ForegroundColor Cyan
Write-Host "🏠 Rifa Principal: http://localhost:3000" -ForegroundColor Blue
Write-Host "👨‍💼 Painel Admin: http://localhost:3000/admin" -ForegroundColor Blue
Write-Host "🔑 Login Admin: http://localhost:3000/login" -ForegroundColor Blue
Write-Host "" -ForegroundColor White
Write-Host "🔧 Comandos úteis:" -ForegroundColor Cyan
Write-Host "Ver logs: docker logs -f rifa-thomas-app" -ForegroundColor White
Write-Host "Parar: docker stop rifa-thomas-app" -ForegroundColor White
Write-Host "Reiniciar: docker restart rifa-thomas-app" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🌍 Para deploy na internet:" -ForegroundColor Yellow
Write-Host "1. Railway.app - Deploy gratuito" -ForegroundColor White
Write-Host "2. DigitalOcean - VPS $5/mês" -ForegroundColor White
Write-Host "3. Google Cloud Run - Pay per use" -ForegroundColor White

# Mostrar status final
Write-Host "" -ForegroundColor White
Write-Host "📊 Status do container:" -ForegroundColor Cyan
docker ps --filter "name=rifa-thomas-app" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
