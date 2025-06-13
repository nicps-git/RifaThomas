#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DA SINCRONIZAÇÃO FIREBASE"
echo "================================================"

cd /home/nicps/Documents/Projetos/RifaThomas/netlify-deploy

# Verificar se os arquivos principais existem
echo ""
echo "📂 Verificando arquivos principais..."
files_to_check=("script.js" "firebase-config.js" "admin.js" "index.html")
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANDO"
    fi
done

# Verificar logs de debug implementados
echo ""
echo "🔧 Verificando implementação de debug..."

if grep -q "debugRifaSync" script.js; then
    echo "✅ Funções de debug implementadas"
else
    echo "❌ Funções de debug não encontradas"
fi

if grep -q "PROCESSANDO ATUALIZAÇÃO EM TEMPO REAL" script.js; then
    echo "✅ Logs detalhados implementados"
else
    echo "❌ Logs detalhados não encontrados"
fi

# Verificar listener do Firebase
echo ""
echo "👂 Verificando configuração do listener..."

if grep -q "listenToChanges.*purchases" script.js; then
    echo "✅ Listener configurado no script principal"
else
    echo "❌ Listener não encontrado no script principal"
fi

if grep -q "onSnapshot" firebase-config.js; then
    echo "✅ onSnapshot implementado no firebase-config"
else
    echo "❌ onSnapshot não encontrado no firebase-config"
fi

# Verificar função updateSoldNumbersFromPurchases
echo ""
echo "🔄 Verificando função de atualização..."

if grep -A 10 "updateSoldNumbersFromPurchases" script.js | grep -q "confirmed"; then
    echo "✅ Função processa status 'confirmed'"
else
    echo "❌ Função não processa status 'confirmed'"
fi

# Verificar configuração do admin
echo ""
echo "👨‍💼 Verificando admin..."

if grep -q "updatePurchaseStatus.*confirmed" admin.js; then
    echo "✅ Admin pode confirmar compras"
else
    echo "❌ Admin não pode confirmar compras"
fi

# Criar arquivo de teste HTML para verificar sincronização em tempo real
echo ""
echo "📝 Criando teste de sincronização em tempo real..."

cat > teste-sincronizacao-real-time.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste Sincronização Tempo Real</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .section { border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; }
        .log-area { background: #f8f9fa; padding: 15px; height: 300px; overflow-y: auto; font-family: monospace; font-size: 12px; border: 1px solid #ccc; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        button:disabled { background: #6c757d; cursor: not-allowed; }
        .number-sample { display: flex; gap: 5px; flex-wrap: wrap; margin: 10px 0; }
        .number-badge { padding: 5px 10px; border-radius: 3px; font-weight: bold; }
        .sold { background: #dc3545; color: white; }
        .reserved { background: #ffc107; color: black; }
        .available { background: #28a745; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 Teste de Sincronização em Tempo Real</h1>
        <p>Este teste verifica se as mudanças no admin aparecem imediatamente na página principal.</p>

        <div class="grid">
            <!-- Lado esquerdo: Controles -->
            <div>
                <div class="section">
                    <h3>🎛️ Controles de Teste</h3>
                    <button onclick="initTest()">🚀 Iniciar Teste</button>
                    <button onclick="loadCurrentData()">📊 Carregar Dados</button>
                    <button onclick="startRealTimeListener()">👂 Ativar Listener</button>
                    <button onclick="stopRealTimeListener()">🛑 Parar Listener</button>
                    <button onclick="clearLog()">🗑️ Limpar Log</button>
                </div>

                <div class="section">
                    <h3>📊 Status Atual</h3>
                    <div id="firebase-status" class="status info">Firebase: Não conectado</div>
                    <div id="listener-status" class="status info">Listener: Inativo</div>
                    <div id="data-status" class="status info">Dados: Não carregados</div>
                    
                    <h4>📈 Estatísticas</h4>
                    <p><strong>Total de compras:</strong> <span id="total-purchases">0</span></p>
                    <p><strong>Números vendidos:</strong> <span id="sold-count">0</span></p>
                    <p><strong>Números reservados:</strong> <span id="reserved-count">0</span></p>
                    <p><strong>Última atualização:</strong> <span id="last-update">Nunca</span></p>
                </div>

                <div class="section">
                    <h3>🎯 Simulação Admin</h3>
                    <input type="text" id="purchase-id" placeholder="ID da compra (opcional)">
                    <select id="new-status">
                        <option value="confirmed">Confirmar (vendido)</option>
                        <option value="pending">Pendente</option>
                        <option value="rejected">Rejeitar</option>
                    </select>
                    <button onclick="simulateAdminChange()">🎭 Simular Mudança</button>
                    <div id="simulation-result" class="status info" style="display: none;">Resultado aparecerá aqui</div>
                </div>
            </div>

            <!-- Lado direito: Visualização -->
            <div>
                <div class="section">
                    <h3>🎨 Amostra Visual de Números</h3>
                    <p>Primeiros 20 números para visualizar mudanças:</p>
                    <div id="numbers-sample" class="number-sample">
                        <!-- Será preenchido dinamicamente -->
                    </div>
                    <button onclick="updateNumbersDisplay()">🔄 Atualizar Visual</button>
                </div>

                <div class="section">
                    <h3>📋 Compras Recentes</h3>
                    <div id="recent-purchases" style="max-height: 200px; overflow-y: auto;">
                        <p>Nenhuma compra carregada</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>📝 Log de Eventos</h3>
            <div id="log-area" class="log-area"></div>
        </div>
    </div>

    <!-- Firebase -->
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-compat.js"></script>
    <script src="firebase-config.js"></script>

    <script>
        let listenerUnsubscribe = null;
        let currentPurchases = [];
        let isInitialized = false;

        function log(message, type = 'info') {
            const logArea = document.getElementById('log-area');
            const timestamp = new Date().toLocaleTimeString();
            const colors = {
                info: '#17a2b8',
                success: '#28a745',
                error: '#dc3545',
                warning: '#ffc107'
            };
            
            logArea.innerHTML += `<div style="color: ${colors[type] || colors.info}">[${timestamp}] ${message}</div>`;
            logArea.scrollTop = logArea.scrollHeight;
        }

        function clearLog() {
            document.getElementById('log-area').innerHTML = '';
        }

        function updateStatus(elementId, message, type = 'info') {
            const element = document.getElementById(elementId);
            element.textContent = message;
            element.className = `status ${type}`;
        }

        async function initTest() {
            log('🚀 Iniciando teste de sincronização...', 'info');
            
            try {
                // Aguardar Firebase
                await waitForFirebase();
                updateStatus('firebase-status', 'Firebase: Conectado', 'success');
                log('✅ Firebase conectado', 'success');

                // Autenticar
                const user = await window.FirebaseDB.initAuth();
                log(`✅ Autenticado como: ${user.uid}`, 'success');

                // Carregar dados iniciais
                await loadCurrentData();

                // Ativar listener
                await startRealTimeListener();

                isInitialized = true;
                log('🎉 Teste inicializado com sucesso!', 'success');

            } catch (error) {
                log(`❌ Erro na inicialização: ${error.message}`, 'error');
                updateStatus('firebase-status', 'Firebase: Erro', 'error');
            }
        }

        function waitForFirebase() {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const check = () => {
                    if (typeof window.FirebaseDB !== 'undefined') {
                        resolve();
                    } else if (attempts++ > 100) {
                        reject(new Error('Firebase timeout'));
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        }

        async function loadCurrentData() {
            log('📊 Carregando dados atuais...', 'info');
            
            try {
                const result = await window.FirebaseDB.loadPurchases();
                
                if (result.success) {
                    currentPurchases = result.data;
                    processDataUpdate(currentPurchases, false);
                    updateStatus('data-status', 'Dados: Carregados', 'success');
                    log(`✅ ${result.data.length} compras carregadas`, 'success');
                } else {
                    log(`❌ Erro ao carregar: ${result.error}`, 'error');
                    updateStatus('data-status', 'Dados: Erro', 'error');
                }
            } catch (error) {
                log(`❌ Erro ao carregar dados: ${error.message}`, 'error');
                updateStatus('data-status', 'Dados: Erro', 'error');
            }
        }

        async function startRealTimeListener() {
            log('👂 Ativando listener em tempo real...', 'info');
            
            try {
                if (listenerUnsubscribe) {
                    listenerUnsubscribe();
                    log('🛑 Listener anterior parado', 'info');
                }

                listenerUnsubscribe = window.FirebaseDB.listenToChanges('purchases', (purchases) => {
                    log(`📥 Listener ativado - ${purchases.length} compras recebidas`, 'success');
                    
                    if (JSON.stringify(purchases) !== JSON.stringify(currentPurchases)) {
                        log('🔄 MUDANÇA DETECTADA! Atualizando dados...', 'warning');
                        processDataUpdate(purchases, true);
                        currentPurchases = purchases;
                    } else {
                        log('📊 Dados inalterados', 'info');
                    }
                });

                if (listenerUnsubscribe) {
                    updateStatus('listener-status', 'Listener: Ativo', 'success');
                    log('✅ Listener ativado com sucesso', 'success');
                } else {
                    throw new Error('Falha ao criar listener');
                }

            } catch (error) {
                log(`❌ Erro no listener: ${error.message}`, 'error');
                updateStatus('listener-status', 'Listener: Erro', 'error');
            }
        }

        function stopRealTimeListener() {
            if (listenerUnsubscribe) {
                listenerUnsubscribe();
                listenerUnsubscribe = null;
                updateStatus('listener-status', 'Listener: Parado', 'warning');
                log('🛑 Listener parado', 'warning');
            } else {
                log('⚠️ Nenhum listener ativo', 'warning');
            }
        }

        function processDataUpdate(purchases, isRealTime = false) {
            const soldNumbers = [];
            const reservedNumbers = [];
            
            purchases.forEach(purchase => {
                if (Array.isArray(purchase.numbers)) {
                    if (purchase.status === 'confirmed') {
                        soldNumbers.push(...purchase.numbers);
                    } else if (['pending', 'reserved', 'pending_donation'].includes(purchase.status)) {
                        reservedNumbers.push(...purchase.numbers);
                    }
                }
            });

            // Atualizar estatísticas
            document.getElementById('total-purchases').textContent = purchases.length;
            document.getElementById('sold-count').textContent = soldNumbers.length;
            document.getElementById('reserved-count').textContent = reservedNumbers.length;
            document.getElementById('last-update').textContent = new Date().toLocaleTimeString();

            // Log detalhado
            if (isRealTime) {
                log(`🔄 ATUALIZAÇÃO EM TEMPO REAL:`, 'warning');
                log(`  📈 Vendidos: ${soldNumbers.length} números`, 'success');
                log(`  📈 Reservados: ${reservedNumbers.length} números`, 'info');
                if (soldNumbers.length > 0) {
                    log(`  🔢 Números vendidos: [${soldNumbers.sort((a,b) => a-b).join(', ')}]`, 'success');
                }
            }

            // Atualizar amostra visual
            updateNumbersSample(soldNumbers, reservedNumbers);

            // Atualizar lista de compras
            updateRecentPurchases(purchases.slice(0, 5));
        }

        function updateNumbersSample(soldNumbers, reservedNumbers) {
            const sampleDiv = document.getElementById('numbers-sample');
            sampleDiv.innerHTML = '';

            for (let i = 1; i <= 20; i++) {
                const badge = document.createElement('span');
                badge.className = 'number-badge';
                badge.textContent = i.toString().padStart(3, '0');

                if (soldNumbers.includes(i)) {
                    badge.classList.add('sold');
                } else if (reservedNumbers.includes(i)) {
                    badge.classList.add('reserved');
                } else {
                    badge.classList.add('available');
                }

                sampleDiv.appendChild(badge);
            }
        }

        function updateRecentPurchases(purchases) {
            const recentDiv = document.getElementById('recent-purchases');
            
            if (purchases.length === 0) {
                recentDiv.innerHTML = '<p>Nenhuma compra encontrada</p>';
                return;
            }

            recentDiv.innerHTML = purchases.map(purchase => `
                <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px;">
                    <strong>${purchase.buyerName || 'Nome não informado'}</strong> - 
                    Status: <span style="font-weight: bold; color: ${purchase.status === 'confirmed' ? '#28a745' : '#ffc107'}">${purchase.status}</span><br>
                    Números: [${(purchase.numbers || []).join(', ')}]<br>
                    <small>ID: ${purchase.id}</small>
                </div>
            `).join('');
        }

        async function simulateAdminChange() {
            const purchaseId = document.getElementById('purchase-id').value;
            const newStatus = document.getElementById('new-status').value;
            const resultDiv = document.getElementById('simulation-result');

            if (!isInitialized) {
                log('❌ Teste não inicializado. Clique em "Iniciar Teste" primeiro.', 'error');
                return;
            }

            try {
                let targetPurchase;
                
                if (purchaseId) {
                    targetPurchase = currentPurchases.find(p => p.id === purchaseId);
                    if (!targetPurchase) {
                        throw new Error(`Compra com ID ${purchaseId} não encontrada`);
                    }
                } else {
                    // Encontrar primeira compra pendente
                    targetPurchase = currentPurchases.find(p => p.status !== 'confirmed' && p.status !== 'rejected');
                    if (!targetPurchase) {
                        throw new Error('Nenhuma compra pendente encontrada para simular');
                    }
                }

                log(`🎭 Simulando mudança: ${targetPurchase.id} → ${newStatus}`, 'warning');
                resultDiv.style.display = 'block';
                resultDiv.textContent = 'Processando...';
                resultDiv.className = 'status info';

                const result = await window.FirebaseDB.updatePurchaseStatus(targetPurchase.id, newStatus);

                if (result.success) {
                    log(`✅ Simulação bem-sucedida! Aguardando listener detectar mudança...`, 'success');
                    resultDiv.textContent = `✅ Mudança aplicada: ${targetPurchase.id} → ${newStatus}`;
                    resultDiv.className = 'status success';
                    
                    // Limpar campo
                    document.getElementById('purchase-id').value = '';
                } else {
                    throw new Error(result.error || 'Erro desconhecido');
                }

            } catch (error) {
                log(`❌ Erro na simulação: ${error.message}`, 'error');
                resultDiv.textContent = `❌ Erro: ${error.message}`;
                resultDiv.className = 'status error';
                resultDiv.style.display = 'block';
            }
        }

        // Inicialização automática
        window.addEventListener('load', () => {
            log('🚀 Página carregada. Clique em "Iniciar Teste" para começar.', 'info');
        });

        // Cleanup
        window.addEventListener('beforeunload', () => {
            if (listenerUnsubscribe) {
                listenerUnsubscribe();
            }
        });
    </script>
</body>
</html>
EOF

echo "✅ Arquivo de teste criado: teste-sincronizacao-real-time.html"

# Verificar se há erro de sintaxe no JavaScript
echo ""
echo "🔍 Verificando sintaxe JavaScript..."

if command -v node >/dev/null 2>&1; then
    if node -c script.js 2>/dev/null; then
        echo "✅ script.js - sintaxe válida"
    else
        echo "❌ script.js - erro de sintaxe:"
        node -c script.js
    fi
    
    if node -c firebase-config.js 2>/dev/null; then
        echo "✅ firebase-config.js - sintaxe válida"
    else
        echo "❌ firebase-config.js - erro de sintaxe:"
        node -c firebase-config.js
    fi
else
    echo "⚠️ Node.js não disponível - não foi possível verificar sintaxe"
fi

# Sugestões baseadas no diagnóstico
echo ""
echo "🎯 PRÓXIMOS PASSOS PARA TESTE:"
echo "1. Abra o arquivo teste-sincronizacao-real-time.html no navegador"
echo "2. Clique em 'Iniciar Teste' para conectar com Firebase"
echo "3. Abra o painel admin em outra aba"
echo "4. Confirme uma compra no admin"
echo "5. Observe se a mudança aparece instantaneamente no teste"
echo ""
echo "🔧 Se houver problemas:"
echo "- Verifique o console do navegador (F12)"
echo "- Use as funções de debug: window.debugRifaSync()"
echo "- Compare dados: window.compareDataSources()"
echo ""
echo "📁 Arquivos criados:"
echo "- teste-sincronizacao-real-time.html (teste interativo)"
echo "- Este diagnóstico completo"

echo ""
echo "✅ DIAGNÓSTICO COMPLETO CONCLUÍDO"
echo "================================================"
