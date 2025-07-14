// 🎯 Sistema de Sorteio - Rifa Thomas
// Gerencia sorteio de dois números com verificação de participantes

// Estado global do sorteio
let sorteioState = {
    purchases: [],
    eligibleNumbers: [],
    firebaseReady: false,
    lastDrawResult: null,
    isDrawing: false
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Inicializando sistema de sorteio...');
    initializeDraw();
});

// Aguardar Firebase estar pronto
window.addEventListener('firebaseReady', function() {
    console.log('🔥 Firebase pronto para sorteio');
    sorteioState.firebaseReady = true;
    loadSystemData();
});

// Inicializar sistema de sorteio
async function initializeDraw() {
    console.log('🚀 Configurando sistema de sorteio...');
    
    // Aguardar Firebase se necessário
    if (typeof window.FirebaseDB !== 'undefined') {
        sorteioState.firebaseReady = true;
        await loadSystemData();
    } else {
        updateSystemStatus('⏳ Aguardando Firebase...', 'warning');
        
        // Tentar novamente em intervalos
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkFirebase = setInterval(() => {
            attempts++;
            
            if (typeof window.FirebaseDB !== 'undefined') {
                console.log('✅ Firebase conectado');
                sorteioState.firebaseReady = true;
                loadSystemData();
                clearInterval(checkFirebase);
            } else if (attempts >= maxAttempts) {
                console.warn('⚠️ Firebase não carregou - modo offline');
                updateSystemStatus('❌ Firebase indisponível - Modo offline', 'error');
                clearInterval(checkFirebase);
            }
        }, 1000);
    }
}

// Carregar dados do sistema
async function loadSystemData() {
    console.log('📊 Carregando dados do sistema...');
    
    updateSystemStatus('🔄 Carregando dados...', 'warning');
    
    try {
        if (!sorteioState.firebaseReady) {
            throw new Error('Firebase não está disponível');
        }
        
        // Carregar compras do Firebase
        const result = await window.FirebaseDB.loadPurchases();
        
        if (result.success) {
            sorteioState.purchases = result.data || [];
            console.log(`✅ ${sorteioState.purchases.length} compras carregadas`);
            
            updateSystemStats();
            updateSystemStatus('✅ Sistema pronto para sorteio', 'success');
            
        } else {
            throw new Error(result.error || 'Erro ao carregar compras');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        updateSystemStatus(`❌ Erro: ${error.message}`, 'error');
        
        // Tentar carregar do localStorage como fallback
        try {
            const localData = localStorage.getItem('purchases');
            if (localData) {
                sorteioState.purchases = JSON.parse(localData);
                console.log(`⚠️ Dados carregados do localStorage: ${sorteioState.purchases.length} compras`);
                updateSystemStats();
                updateSystemStatus('⚠️ Usando dados locais (Firebase indisponível)', 'warning');
            }
        } catch (localError) {
            console.error('❌ Erro ao carregar dados locais:', localError);
        }
    }
}

// Atualizar estatísticas do sistema
function updateSystemStats() {
    const totalParticipants = sorteioState.purchases.length;
    const confirmedPurchases = sorteioState.purchases.filter(p => p.status === 'confirmed');
    const confirmedParticipants = confirmedPurchases.length;
    
    // Calcular números vendidos (confirmados)
    const soldNumbers = [];
    confirmedPurchases.forEach(purchase => {
        if (Array.isArray(purchase.numbers)) {
            soldNumbers.push(...purchase.numbers);
        }
    });
    
    // Atualizar interface
    updateStatusItem('firebase-status', sorteioState.firebaseReady ? '✅' : '❌', 'Firebase');
    updateStatusItem('participants-status', totalParticipants, 'Participantes');
    updateStatusItem('confirmed-status', confirmedParticipants, 'Confirmados');
    updateStatusItem('numbers-status', soldNumbers.length, 'Números Vendidos');
    
    console.log(`📊 Stats: ${totalParticipants} participantes, ${confirmedParticipants} confirmados, ${soldNumbers.length} números`);
}

// Atualizar item de status
function updateStatusItem(itemId, value, label) {
    const item = document.getElementById(itemId);
    if (item) {
        const valueEl = item.querySelector('.status-value');
        const labelEl = item.querySelector('.status-label');
        
        if (valueEl) valueEl.textContent = value;
        if (labelEl) labelEl.textContent = label;
        
        // Definir classe de status
        item.className = 'status-item';
        if (itemId === 'firebase-status') {
            item.classList.add(sorteioState.firebaseReady ? 'ready' : 'error');
        } else if (itemId === 'confirmed-status') {
            item.classList.add(value > 0 ? 'ready' : 'warning');
        } else {
            item.classList.add(value > 0 ? 'ready' : 'warning');
        }
    }
}

// Atualizar status do sistema
function updateSystemStatus(message, type) {
    const messageEl = document.getElementById('system-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `alert alert-${type}`;
    }
}

// Carregar números elegíveis para o sorteio
function loadEligibleNumbers() {
    const minNumber = parseInt(document.getElementById('min-number').value);
    const maxNumber = parseInt(document.getElementById('max-number').value);
    
    // Validar range
    if (isNaN(minNumber) || isNaN(maxNumber) || minNumber < 1 || maxNumber > 150 || minNumber > maxNumber) {
        alert('❌ Range inválido! Números devem estar entre 1 e 150, e o mínimo deve ser menor que o máximo.');
        return;
    }
    
    console.log(`🔍 Verificando números elegíveis no range ${minNumber} a ${maxNumber}...`);
    
    // Filtrar compras confirmadas
    const confirmedPurchases = sorteioState.purchases.filter(p => p.status === 'confirmed');
    
    // Encontrar números elegíveis no range especificado
    const eligibleNumbers = [];
    const participantMap = new Map();
    
    confirmedPurchases.forEach(purchase => {
        if (Array.isArray(purchase.numbers)) {
            purchase.numbers.forEach(number => {
                if (number >= minNumber && number <= maxNumber) {
                    eligibleNumbers.push(number);
                    participantMap.set(number, {
                        name: purchase.buyerName || purchase.name || 'Nome não informado',
                        phone: purchase.buyerPhone || purchase.phone || 'Telefone não informado',
                        purchaseId: purchase.id
                    });
                }
            });
        }
    });
    
    // Armazenar números elegíveis
    sorteioState.eligibleNumbers = eligibleNumbers.sort((a, b) => a - b);
    sorteioState.participantMap = participantMap;
    
    // Mostrar informações
    const infoEl = document.getElementById('eligible-info');
    const detailsEl = document.getElementById('eligible-details');
    
    if (eligibleNumbers.length === 0) {
        detailsEl.innerHTML = `
            <strong>❌ Nenhum número elegível encontrado</strong><br>
            Range: ${minNumber} a ${maxNumber}<br>
            Verifique se há participantes confirmados neste range.
        `;
        infoEl.className = 'alert alert-error';
        document.getElementById('draw-btn').disabled = true;
        
    } else if (eligibleNumbers.length < 2) {
        detailsEl.innerHTML = `
            <strong>⚠️ Números insuficientes para sorteio</strong><br>
            Range: ${minNumber} a ${maxNumber}<br>
            Números elegíveis: ${eligibleNumbers.length} (mínimo necessário: 2)<br>
            Números encontrados: ${eligibleNumbers.join(', ')}
        `;
        infoEl.className = 'alert alert-warning';
        document.getElementById('draw-btn').disabled = true;
        
    } else {
        detailsEl.innerHTML = `
            <strong>✅ Sistema pronto para sorteio</strong><br>
            Range: ${minNumber} a ${maxNumber}<br>
            Números elegíveis: ${eligibleNumbers.length}<br>
            Participantes únicos: ${new Set(confirmedPurchases.map(p => p.buyerName || p.name)).size}<br>
            <small>Números: ${eligibleNumbers.slice(0, 10).join(', ')}${eligibleNumbers.length > 10 ? '...' : ''}</small>
        `;
        infoEl.className = 'alert alert-success';
        document.getElementById('draw-btn').disabled = false;
    }
    
    infoEl.style.display = 'block';
    
    console.log(`✅ Verificação concluída: ${eligibleNumbers.length} números elegíveis`);
}

// Realizar sorteio
async function performDraw() {
    if (sorteioState.isDrawing) {
        console.log('⚠️ Sorteio já em andamento');
        return;
    }
    
    if (sorteioState.eligibleNumbers.length < 2) {
        alert('❌ É necessário ter pelo menos 2 números elegíveis para realizar o sorteio!');
        return;
    }
    
    // Confirmação
    const minNumber = document.getElementById('min-number').value;
    const maxNumber = document.getElementById('max-number').value;
    
    const confirmed = confirm(
        `🎯 REALIZAR SORTEIO\n\n` +
        `Range: ${minNumber} a ${maxNumber}\n` +
        `Números elegíveis: ${sorteioState.eligibleNumbers.length}\n` +
        `Sorteará: 2 números\n\n` +
        `Esta ação será registrada. Continuar?`
    );
    
    if (!confirmed) return;
    
    console.log('🎲 Iniciando sorteio...');
    sorteioState.isDrawing = true;
    
    // Atualizar interface
    const drawBtn = document.getElementById('draw-btn');
    drawBtn.disabled = true;
    drawBtn.innerHTML = '<div class="loading"></div> Sorteando...';
    
    try {
        // Sortear 2 números únicos
        const shuffled = [...sorteioState.eligibleNumbers].sort(() => Math.random() - 0.5);
        const firstNumber = shuffled[0];
        const secondNumber = shuffled[1];
        
        // Verificar se os números são diferentes (garantia extra)
        if (firstNumber === secondNumber) {
            console.warn('⚠️ Números iguais sorteados, refazendo...');
            // Remover o primeiro e sortear novamente
            const filtered = shuffled.filter(n => n !== firstNumber);
            const secondNumber = filtered[0];
        }
        
        // Buscar dados dos participantes
        const firstWinner = sorteioState.participantMap.get(firstNumber);
        const secondWinner = sorteioState.participantMap.get(secondNumber);
        
        // Criar resultado do sorteio
        const drawResult = {
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString('pt-BR'),
            range: {
                min: parseInt(minNumber),
                max: parseInt(maxNumber)
            },
            eligibleNumbers: sorteioState.eligibleNumbers.length,
            winners: {
                first: {
                    number: firstNumber,
                    participant: firstWinner
                },
                second: {
                    number: secondNumber,
                    participant: secondWinner
                }
            }
        };
        
        console.log('🎉 Sorteio concluído:', drawResult);
        sorteioState.lastDrawResult = drawResult;
        
        // Mostrar resultados
        displayDrawResults(drawResult);
        
        // Tentar salvar no Firebase
        if (sorteioState.firebaseReady) {
            try {
                await window.FirebaseDB.saveDrawResults(drawResult);
                console.log('💾 Resultado salvo no Firebase');
            } catch (saveError) {
                console.warn('⚠️ Erro ao salvar no Firebase:', saveError);
            }
        }
        
        // Salvar localmente também
        localStorage.setItem('lastDrawResult', JSON.stringify(drawResult));
        
    } catch (error) {
        console.error('❌ Erro durante o sorteio:', error);
        alert(`❌ Erro durante o sorteio: ${error.message}`);
        
    } finally {
        // Restaurar botão
        sorteioState.isDrawing = false;
        drawBtn.disabled = false;
        drawBtn.innerHTML = '<i class="fas fa-dice"></i> Realizar Sorteio (2 Números)';
    }
}

// Exibir resultados do sorteio
function displayDrawResults(result) {
    console.log('🏆 Exibindo resultados do sorteio');
    
    // Mostrar seção de resultados
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.add('show');
    
    // Atualizar números sorteados
    const winnerNumbersEl = document.getElementById('winner-numbers');
    winnerNumbersEl.innerHTML = `
        <div class="winning-number">${result.winners.first.number.toString().padStart(3, '0')}</div>
        <div class="winning-number">${result.winners.second.number.toString().padStart(3, '0')}</div>
    `;
    
    // Atualizar timestamp
    document.getElementById('draw-timestamp').textContent = `Sorteio realizado em: ${result.date}`;
    
    // Atualizar detalhes dos ganhadores
    const winnerDetailsEl = document.getElementById('winner-details');
    winnerDetailsEl.innerHTML = `
        <div class="winner-card first">
            <div class="winner-info">
                <div class="winner-number">${result.winners.first.number.toString().padStart(3, '0')}</div>
                <div class="winner-data">
                    <div class="winner-name">🥇 1º Sorteado: ${result.winners.first.participant.name}</div>
                    <div class="winner-phone">📱 ${result.winners.first.participant.phone}</div>
                    <div class="winner-prize">🎁 Primeiro número sorteado</div>
                </div>
            </div>
        </div>
        
        <div class="winner-card second">
            <div class="winner-info">
                <div class="winner-number">${result.winners.second.number.toString().padStart(3, '0')}</div>
                <div class="winner-data">
                    <div class="winner-name">🥈 2º Sorteado: ${result.winners.second.participant.name}</div>
                    <div class="winner-phone">📱 ${result.winners.second.participant.phone}</div>
                    <div class="winner-prize">🎁 Segundo número sorteado</div>
                </div>
            </div>
        </div>
    `;
    
    // Scroll para os resultados
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Salvar resultados do sorteio
async function saveDrawResults() {
    if (!sorteioState.lastDrawResult) {
        alert('❌ Nenhum resultado de sorteio para salvar!');
        return;
    }
    
    console.log('💾 Salvando resultados do sorteio...');
    
    try {
        const result = sorteioState.lastDrawResult;
        
        // Salvar no Firebase se disponível
        if (sorteioState.firebaseReady) {
            await window.FirebaseDB.saveDrawResults(result);
            console.log('✅ Resultados salvos no Firebase');
        }
        
        // Salvar localmente
        localStorage.setItem('savedDrawResult', JSON.stringify(result));
        localStorage.setItem('drawResultSavedAt', new Date().toISOString());
        
        alert('✅ Resultados do sorteio salvos com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao salvar resultados:', error);
        alert(`❌ Erro ao salvar: ${error.message}`);
    }
}

// Resetar sorteio
function resetDraw() {
    const confirmed = confirm('🔄 Iniciar novo sorteio?\n\nIsso ocultará os resultados atuais (mas não os apagará).');
    
    if (confirmed) {
        console.log('🔄 Resetando sorteio...');
        
        // Ocultar resultados
        const resultsSection = document.getElementById('results-section');
        resultsSection.classList.remove('show');
        
        // Limpar informações de elegibilidade
        document.getElementById('eligible-info').style.display = 'none';
        document.getElementById('draw-btn').disabled = true;
        
        // Resetar valores
        document.getElementById('min-number').value = '1';
        document.getElementById('max-number').value = '150';
        
        // Limpar estado
        sorteioState.eligibleNumbers = [];
        sorteioState.participantMap = new Map();
        
        console.log('✅ Sorteio resetado');
    }
}

// Função utilitária para debug
window.sorteioDebug = {
    getState: () => sorteioState,
    getPurchases: () => sorteioState.purchases,
    getEligible: () => sorteioState.eligibleNumbers,
    getLastResult: () => sorteioState.lastDrawResult,
    forceLoad: loadSystemData
};

console.log('🎯 Sistema de sorteio carregado - Use sorteioDebug no console para debug');
