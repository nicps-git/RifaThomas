#!/bin/bash

# Script para testar conexão com Firebase
echo "🧪 Teste de Conexão Firebase"
echo "============================"
echo ""

# Verificar se firebase-config.js está configurado
CONFIG_FILE="netlify-deploy/firebase-config.js"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Arquivo firebase-config.js não encontrado!"
    echo "Execute primeiro: ./criar-banco-firebase.sh"
    exit 1
fi

if grep -q "SUA_API_KEY_AQUI" "$CONFIG_FILE"; then
    echo "❌ Firebase não está configurado!"
    echo "Execute: ./configure-firebase.sh"
    exit 1
fi

echo "✅ Configuração Firebase detectada!"
echo ""

echo "🌐 Iniciando servidor de teste..."
echo "================================"
echo ""

# Criar arquivo de teste simples
cat > netlify-deploy/test-firebase.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste Firebase - Rifa Thomas</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
        }
        .test-box { 
            border: 1px solid #ddd; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 5px;
        }
        .success { border-color: #4CAF50; background: #f8fff8; }
        .error { border-color: #f44336; background: #fff8f8; }
        .pending { border-color: #ff9800; background: #fff8f0; }
        button { 
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
        }
        button:hover { background: #0056b3; }
        #log { 
            background: #f8f9fa; 
            border: 1px solid #dee2e6; 
            padding: 15px; 
            border-radius: 5px; 
            max-height: 300px; 
            overflow-y: auto; 
            font-family: monospace; 
        }
    </style>
</head>
<body>
    <h1>🔥 Teste de Conexão Firebase</h1>
    <p>Este página testa se o Firebase está configurado corretamente.</p>

    <div id="firebase-status" class="test-box pending">
        <h3>📡 Status da Conexão</h3>
        <p id="connection-status">Testando conexão...</p>
    </div>

    <div id="auth-status" class="test-box pending">
        <h3>🔐 Status da Autenticação</h3>
        <p id="auth-status-text">Testando autenticação...</p>
    </div>

    <div id="firestore-status" class="test-box pending">
        <h3>💾 Status do Firestore</h3>
        <p id="firestore-status-text">Testando Firestore...</p>
    </div>

    <div class="test-box">
        <h3>🧪 Testes Manuais</h3>
        <button onclick="testFirestoreWrite()">Testar Escrita no Firestore</button>
        <button onclick="testFirestoreRead()">Testar Leitura do Firestore</button>
        <button onclick="testAuth()">Testar Autenticação Anônima</button>
        <button onclick="clearLog()">Limpar Log</button>
    </div>

    <div class="test-box">
        <h3>📋 Log de Testes</h3>
        <div id="log"></div>
    </div>

    <script src="firebase-config.js"></script>
    <script>
        function log(message, type = 'info') {
            const logDiv = document.getElementById('log');
            const timestamp = new Date().toLocaleTimeString();
            const colors = {
                info: '#007bff',
                success: '#28a745',
                error: '#dc3545',
                warning: '#ffc107'
            };
            logDiv.innerHTML += `<div style="color: ${colors[type]}; margin: 5px 0;">
                [${timestamp}] ${message}
            </div>`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }

        function updateStatus(elementId, success, message) {
            const element = document.getElementById(elementId);
            element.className = `test-box ${success ? 'success' : 'error'}`;
            element.querySelector('p').textContent = message;
        }

        // Testar inicialização do Firebase
        function testFirebaseInit() {
            try {
                if (typeof firebase !== 'undefined' || typeof FirebaseDB !== 'undefined') {
                    updateStatus('firebase-status', true, '✅ Firebase inicializado com sucesso!');
                    log('Firebase inicializado corretamente', 'success');
                    testAuthentication();
                    testFirestore();
                } else {
                    throw new Error('Firebase não foi inicializado');
                }
            } catch (error) {
                updateStatus('firebase-status', false, `❌ Erro: ${error.message}`);
                log(`Erro na inicialização: ${error.message}`, 'error');
            }
        }

        // Testar autenticação
        function testAuthentication() {
            if (typeof FirebaseDB !== 'undefined' && FirebaseDB.initAuth) {
                FirebaseDB.initAuth()
                    .then(() => {
                        updateStatus('auth-status', true, '✅ Autenticação funcionando!');
                        log('Autenticação anônima bem-sucedida', 'success');
                    })
                    .catch(error => {
                        updateStatus('auth-status', false, `❌ Erro: ${error.message}`);
                        log(`Erro na autenticação: ${error.message}`, 'error');
                    });
            } else {
                updateStatus('auth-status', false, '❌ FirebaseDB não disponível');
                log('FirebaseDB não está disponível', 'error');
            }
        }

        // Testar Firestore
        function testFirestore() {
            if (typeof FirebaseDB !== 'undefined' && FirebaseDB.getConfig) {
                FirebaseDB.getConfig()
                    .then(result => {
                        if (result.success || result.error === 'Configuração não encontrada') {
                            updateStatus('firestore-status', true, '✅ Firestore conectado!');
                            log('Firestore funcionando corretamente', 'success');
                        } else {
                            throw new Error(result.error);
                        }
                    })
                    .catch(error => {
                        updateStatus('firestore-status', false, `❌ Erro: ${error.message}`);
                        log(`Erro no Firestore: ${error.message}`, 'error');
                    });
            } else {
                updateStatus('firestore-status', false, '❌ FirebaseDB não disponível');
                log('FirebaseDB não está disponível', 'error');
            }
        }

        // Teste manual de escrita
        function testFirestoreWrite() {
            if (typeof FirebaseDB === 'undefined') {
                log('FirebaseDB não disponível', 'error');
                return;
            }

            const testData = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Teste de escrita no Firestore'
            };

            log('Testando escrita no Firestore...', 'info');

            FirebaseDB.saveConfig(testData)
                .then(result => {
                    if (result.success) {
                        log('✅ Escrita no Firestore bem-sucedida!', 'success');
                    } else {
                        log(`❌ Erro na escrita: ${result.error}`, 'error');
                    }
                })
                .catch(error => {
                    log(`❌ Erro na escrita: ${error.message}`, 'error');
                });
        }

        // Teste manual de leitura
        function testFirestoreRead() {
            if (typeof FirebaseDB === 'undefined') {
                log('FirebaseDB não disponível', 'error');
                return;
            }

            log('Testando leitura do Firestore...', 'info');

            FirebaseDB.getConfig()
                .then(result => {
                    if (result.success) {
                        log('✅ Leitura do Firestore bem-sucedida!', 'success');
                        log(`Dados lidos: ${JSON.stringify(result.data, null, 2)}`, 'info');
                    } else {
                        log(`ℹ️ Nenhum dado encontrado: ${result.error}`, 'warning');
                    }
                })
                .catch(error => {
                    log(`❌ Erro na leitura: ${error.message}`, 'error');
                });
        }

        // Teste manual de autenticação
        function testAuth() {
            if (typeof FirebaseDB === 'undefined') {
                log('FirebaseDB não disponível', 'error');
                return;
            }

            log('Testando autenticação anônima...', 'info');

            FirebaseDB.initAuth()
                .then(user => {
                    log(`✅ Usuário autenticado: ${user.uid}`, 'success');
                })
                .catch(error => {
                    log(`❌ Erro na autenticação: ${error.message}`, 'error');
                });
        }

        function clearLog() {
            document.getElementById('log').innerHTML = '';
        }

        // Iniciar testes quando a página carregar
        window.addEventListener('load', () => {
            setTimeout(testFirebaseInit, 1000);
        });
    </script>
</body>
</html>
EOF

echo "✅ Arquivo de teste criado: netlify-deploy/test-firebase.html"
echo ""

echo "🚀 Iniciando servidor local..."
echo "=============================="
echo ""
echo "📍 URLs de teste:"
echo "• Aplicação: http://localhost:8000"
echo "• Teste Firebase: http://localhost:8000/test-firebase.html"
echo ""
echo "🔍 O que verificar:"
echo "• Console do navegador (F12) sem erros"
echo "• Conexão com Firebase funciona"
echo "• Autenticação anônima funciona"
echo "• Escrita/leitura no Firestore funciona"
echo ""
echo "⏹️  Pressione Ctrl+C para parar o servidor"
echo ""

cd netlify-deploy
python3 -m http.server 8000
