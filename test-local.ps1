# 🧪 Servidor de Teste Local - Rifa Thomas
# PowerShell script para testar localmente antes do deploy

Write-Host "🚀 Iniciando servidor local da Rifa Thomas..." -ForegroundColor Cyan

# Verificar se Python está instalado
try {
    python --version
    Write-Host "✅ Python encontrado" -ForegroundColor Green
    $usePython = $true
} catch {
    Write-Host "⚠️ Python não encontrado, tentando Node.js..." -ForegroundColor Yellow
    $usePython = $false
}

# Tentar Node.js se Python não estiver disponível
if (-not $usePython) {
    try {
        node --version
        Write-Host "✅ Node.js encontrado" -ForegroundColor Green
        $useNode = $true
    } catch {
        Write-Host "❌ Nem Python nem Node.js encontrados" -ForegroundColor Red
        Write-Host "Instale Python (python.org) ou Node.js (nodejs.org)" -ForegroundColor Yellow
        exit 1
    }
}

# Verificar arquivos essenciais
$requiredFiles = @("index.html", "firebase-config.js", "script.js")
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Arquivo $file não encontrado" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📁 Servindo arquivos do diretório atual..." -ForegroundColor Green
Write-Host "🌐 Acesse: http://localhost:8000" -ForegroundColor Blue
Write-Host "🔧 Admin: http://localhost:8000/admin.html" -ForegroundColor Yellow
Write-Host "🔑 Login: http://localhost:8000/login.html" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "⏹️ Para parar o servidor, pressione Ctrl+C" -ForegroundColor Gray

# Iniciar servidor
if ($usePython) {
    python -m http.server 8000
} else {
    npx http-server -p 8000
}
