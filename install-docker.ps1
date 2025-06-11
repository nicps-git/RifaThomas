# 🐳 Instalação Docker - Rifa Thomas
# Script PowerShell para instalar Docker Desktop no Windows

Write-Host "🐳 Instalando Docker Desktop para Windows..." -ForegroundColor Cyan

# Verificar se já está instalado
try {
    docker --version
    Write-Host "✅ Docker já está instalado!" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "⚙️ Docker não encontrado, iniciando instalação..." -ForegroundColor Yellow
}

# Verificar se Winget está disponível
try {
    winget --version
    Write-Host "✅ Winget encontrado, instalando via Winget..." -ForegroundColor Green
    
    # Instalar Docker Desktop via Winget
    winget install Docker.DockerDesktop
    
    Write-Host "✅ Docker Desktop instalado!" -ForegroundColor Green
    Write-Host "🔄 Reinicie o computador e execute novamente" -ForegroundColor Yellow
    
} catch {
    Write-Host "⚠️ Winget não disponível, instalação manual necessária" -ForegroundColor Yellow
    
    # Download manual
    $dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    $installerPath = "$env:TEMP\DockerDesktopInstaller.exe"
    
    Write-Host "📥 Baixando Docker Desktop..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $dockerUrl -OutFile $installerPath
    
    Write-Host "🚀 Executando instalador..." -ForegroundColor Cyan
    Start-Process -FilePath $installerPath -Wait
    
    Write-Host "✅ Instalação concluída!" -ForegroundColor Green
}

Write-Host "" -ForegroundColor White
Write-Host "📋 Próximos passos após instalação:" -ForegroundColor Cyan
Write-Host "1. Reiniciar o computador" -ForegroundColor White
Write-Host "2. Abrir Docker Desktop" -ForegroundColor White
Write-Host "3. Aceitar os termos de uso" -ForegroundColor White
Write-Host "4. Executar: .\deploy-docker.ps1" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🎯 Alternativas sem Docker:" -ForegroundColor Yellow
Write-Host "- Railway.app (deploy gratuito)" -ForegroundColor White
Write-Host "- Netlify.com (arraste e solte)" -ForegroundColor White
Write-Host "- Vercel.com (GitHub deploy)" -ForegroundColor White

# Abrir página de download como backup
Start-Process "https://www.docker.com/products/docker-desktop/"
