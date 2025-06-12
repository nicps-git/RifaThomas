// ADMIN.JS CORRIGIDO - SEM RECARREGAMENTOS
// Data: 12/06/2025 - Versão final sem conflitos

console.log('🔧 Admin.js carregando - versão SEM recarregamentos');

// Dados do admin
let adminData = {
    purchases: [],
    config: {
        totalNumbers: 150,
        ticketPrice: 40.00,
        drawDate: new Date('2025-07-11T16:00:00'),
        pixKey: 'contato@charifa.com',
        prizes: {
            first: 'R$ 100,00',
            second: 'R$ 200,00',
            third: 'Fraldas por faixa'
        },
        contactPhone: '(11) 99999-9999',
        babyName: 'Thomas'
    },
    drawResults: null,
    firebaseReady: false,
    currentUser: null,
    systemInitialized: false
};

// Flag para evitar múltiplas inicializações
let initializationInProgress = false;

// Aguardar DOM e Firebase estarem prontos
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Admin.js DOM pronto');
    
    if (initializationInProgress || adminData.systemInitialized) {
        console.log('⚠️ Inicialização já em progresso ou concluída');
        return;
    }
    
    initializationInProgress = true;
    
    // Aguardar Firebase
    if (typeof window.FirebaseDB !== 'undefined') {
        console.log('🔥 Firebase disponível imediatamente');
        setTimeout(startAdminSystem, 1000);
    } else {
        console.log('⏰ Aguardando Firebase carregar...');
        
        window.addEventListener('firebaseReady', () => {
            console.log('🔥 Firebase carregado via evento');
            setTimeout(startAdminSystem, 1000);
        });
        
        // Timeout de segurança
        setTimeout(() => {
            if (typeof window.FirebaseDB !== 'undefined') {
                console.log('🔥 Firebase disponível via timeout');
                startAdminSystem();
            } else {
                console.error('❌ Firebase não carregou');
                window.showAdminError('Firebase não conseguiu carregar. Tente novamente.');
            }
        }, 15000);
    }
});

// Função principal ÚNICA
async function startAdminSystem() {
    if (adminData.systemInitialized || !initializationInProgress) {
        console.log('⚠️ Sistema já inicializado ou inicialização cancelada');
        return;
    }
    
    try {
        console.log('🚀 Iniciando sistema admin ÚNICO...');
        
        // Passo 1: Verificar Firebase
        window.updateAdminStatus('Conectando ao Firebase...');
        
        if (typeof window.FirebaseDB === 'undefined') {
            throw new Error('Firebase não está disponível');
        }
        
        await sleep(800);
        window.updateAdminStatus('Firebase conectado ✓');
        
        // Passo 2: Verificar autenticação
        window.updateAdminStatus('Verificando autenticação...');
        
        const adminResult = await window.FirebaseDB.getCurrentAdmin();
        console.log('📊 Resultado getCurrentAdmin:', adminResult);
        
        if (!adminResult.success) {
            throw new Error(adminResult.error || 'Falha na autenticação');
        }
        
        await sleep(800);
        window.updateAdminStatus('Autenticação verificada ✓');
        
        // Passo 3: Verificar permissões
        window.updateAdminStatus('Validando permissões de administrador...');
        
        if (!adminResult.isAdmin) {
            throw new Error('Usuário não possui permissões de administrador');
        }
        
        // Verificação dupla
        const isAdminCheck = await window.FirebaseDB.isAdmin(adminResult.user.uid);
        if (!isAdminCheck) {
            throw new Error('Falha na verificação dupla de permissões');
        }
        
        await sleep(800);
        window.updateAdminStatus('Permissões validadas ✓');
        
        // Passo 4: Inicializar sistema
        window.updateAdminStatus('Carregando painel administrativo...');
        
        adminData.currentUser = adminResult.user;
        adminData.firebaseReady = true;
        adminData.systemInitialized = true;
        
        await sleep(1000);
        
        // Mostrar painel
        window.showAdminPanel(adminResult.user.email);
        
        // Carregar dados
        await initializeAdminData();
        
        console.log('✅ Sistema admin inicializado com SUCESSO');
        
    } catch (error) {
        console.error('❌ Erro no sistema admin:', error);
        window.showAdminError(error.message);
    }
}

// Inicializar dados do sistema
async function initializeAdminData() {
    try {
        console.log('📊 Carregando dados administrativos...');
        
        // Carregar compras
        const purchasesResult = await window.FirebaseDB.loadPurchases();
        if (purchasesResult.success) {
            adminData.purchases = purchasesResult.data;
            console.log(`✅ ${purchasesResult.data.length} compras carregadas do Firebase`);
        } else {
            console.log('⚠️ Erro no Firebase, tentando localStorage...', purchasesResult.error);
            await loadDataFromLocalStorage();
        }
        
        // Carregar configurações
        const configResult = await window.FirebaseDB.loadConfig();
        if (configResult.success) {
            adminData.config = { ...adminData.config, ...configResult.data };
            console.log('✅ Configurações carregadas do Firebase');
        } else {
            console.log('⚠️ Configurações não encontradas no Firebase, usando padrão');
        }
        
        // Configurar listeners
        setupEventListeners();
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        loadConfiguration();
        
        // Escutar mudanças em tempo real (temporariamente desabilitado)
        // TODO: Implementar listener de tempo real
        /*
        window.FirebaseDB.onPurchasesChange((purchases) => {
            console.log('🔄 Dados atualizados em tempo real');
            adminData.purchases = purchases;
            loadParticipants();
            updateDashboard();
        });
        */
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        // Fallback para localStorage em caso de erro
        await loadDataFromLocalStorage();
    }
}

// Carregar dados do localStorage como fallback
async function loadDataFromLocalStorage() {
    try {
        console.log('💾 Carregando dados do localStorage como fallback...');
        
        // Carregar compras do localStorage
        const storedPurchases = localStorage.getItem('purchases');
        if (storedPurchases) {
            adminData.purchases = JSON.parse(storedPurchases);
            console.log(`✅ ${adminData.purchases.length} compras carregadas do localStorage`);
        } else {
            console.log('⚠️ Nenhuma compra encontrada no localStorage');
            adminData.purchases = [];
        }
        
        // Carregar configurações do localStorage
        const storedConfig = localStorage.getItem('rifaConfig');
        if (storedConfig) {
            const localConfig = JSON.parse(storedConfig);
            adminData.config = { ...adminData.config, ...localConfig };
            console.log('✅ Configurações carregadas do localStorage');
        } else {
            console.log('⚠️ Usando configurações padrão');
        }
        
        // Atualizar interface com dados do localStorage
        loadParticipants();
        updateDashboard();
        loadConfiguration();
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao carregar dados do localStorage:', error);
        return false;
    }
}

// Configurar event listeners
function setupEventListeners() {
    const configForm = document.getElementById('config-form');
    if (configForm) {
        configForm.addEventListener('submit', saveConfiguration);
    }
}

// Carregar participantes
function loadParticipants(filter = 'all') {
    console.log(`👥 Carregando participantes (filtro: ${filter})`);
    
    const tbody = document.getElementById('participants-tbody');
    if (!tbody) {
        console.error('❌ Tabela de participantes não encontrada');
        return;
    }
    
    let filteredPurchases = adminData.purchases || [];
    
    if (filter !== 'all') {
        filteredPurchases = filteredPurchases.filter(purchase => {
            const status = purchase.status || 'confirmed';
            return status === filter;
        });
    }
    
    tbody.innerHTML = '';
    
    if (filteredPurchases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    📭 Nenhum participante encontrado
                    <br><small>Status do filtro: ${filter}</small>
                    <br><small>Total de compras: ${adminData.purchases?.length || 0}</small>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredPurchases.forEach(purchase => {
        const row = createParticipantRow(purchase);
        tbody.appendChild(row);
    });
    
    // Atualizar contadores sempre que carregar participantes
    updateAllFilterCounters();
    
    console.log(`✅ ${filteredPurchases.length} participantes carregados`);
}

// Criar linha de participante
function createParticipantRow(purchase) {
    const row = document.createElement('tr');
    
    if (!purchase || !purchase.numbers) {
        row.innerHTML = `
            <td colspan="8" style="text-align: center; color: #dc3545;">
                ❌ Dados inválidos
            </td>
        `;
        return row;
    }
    
    const status = purchase.status || 'confirmed';
    const paymentMethod = purchase.paymentMethod || 'pix';
    
    // Botões de ação
    let actionButtons = '';
    if (status === 'pending_donation') {
        actionButtons = `
            <div class="action-buttons">
                <button class="btn-confirm" onclick="confirmDonation('${purchase.id}')" title="Confirmar doação">
                    <i class="fas fa-check"></i> Confirmar
                </button>
                <button class="btn-reject" onclick="rejectDonation('${purchase.id}')" title="Rejeitar doação">
                    <i class="fas fa-times"></i> Rejeitar
                </button>
            </div>
        `;
    } else {
        actionButtons = `
            <div class="action-buttons">
                <button class="btn-edit" onclick="editParticipant('${purchase.id}')" title="Editar dados">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </div>
        `;
    }
    
    // Badge de status
    let statusBadge = '';
    switch (status) {
        case 'pending_donation':
            statusBadge = '<span class="status-badge status-pending">🍼 Doação Pendente</span>';
            break;
        case 'confirmed':
            statusBadge = '<span class="status-badge status-confirmed">✅ Confirmado</span>';
            break;
        case 'rejected':
            statusBadge = '<span class="status-badge status-rejected">❌ Rejeitado</span>';
            break;
        default:
            statusBadge = `<span class="status-badge status-unknown">❓ ${status}</span>`;
    }
    
    // Método de pagamento
    const paymentDisplay = paymentMethod === 'pix' 
        ? '<span class="payment-method payment-pix">💳 PIX</span>'
        : '<span class="payment-method payment-doacao">🍼 Doação</span>';
    
    const buyerName = purchase.buyerName || purchase.name || 'N/A';
    const buyerPhone = purchase.buyerPhone || purchase.phone || 'N/A';
    const numbersCount = Array.isArray(purchase.numbers) ? purchase.numbers.length : 0;
    const totalAmount = purchase.totalAmount || 0;
    const purchaseDate = purchase.date || new Date().toISOString();
    
    row.innerHTML = `
        <td>${buyerName}</td>
        <td>${buyerPhone}</td>
        <td>${numbersCount} números</td>
        <td>${formatCurrency(totalAmount)}</td>
        <td>${paymentDisplay}</td>
        <td>${statusBadge}</td>
        <td>${formatDate(purchaseDate)}</td>
        <td>${actionButtons}</td>
    `;
    
    return row;
}

// Confirmar doação
async function confirmDonation(purchaseId) {
    console.log(`✅ FUNÇÃO CONFIRMDONATION CHAMADA! ID: ${purchaseId}`);
    alert(`🔬 DEBUG: Função confirmDonation chamada para ID: ${purchaseId}`);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Compra não encontrada!');
        console.error(`❌ Compra não encontrada: ${purchaseId}`);
        return;
    }
    
    const buyerName = purchase.buyerName || purchase.name || 'Comprador';
    const confirmMessage = `Confirmar doação de ${buyerName}?\n\nNúmeros: ${purchase.numbers.join(', ')}\nTotal: R$ ${purchase.totalAmount.toFixed(2)}`;
    
    console.log(`📋 Dados da compra encontrada:`, purchase);
    
    if (confirm(confirmMessage)) {
        try {
            console.log(`🔄 Iniciando processo de confirmação...`);
            
            // Atualizar localmente primeiro
            purchase.status = 'confirmed';
            purchase.confirmedAt = new Date().toISOString();
            purchase.confirmedBy = adminData.currentUser?.uid || 'admin';
            
            console.log(`💾 Atualizando localStorage...`);
            // Atualizar localStorage
            localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
            
            console.log(`🔥 Tentando atualizar Firebase...`);
            // Tentar atualizar no Firebase se disponível
            if (typeof window.FirebaseDB !== 'undefined') {
                const additionalData = {
                    confirmedAt: purchase.confirmedAt,
                    confirmedBy: purchase.confirmedBy
                };
                
                const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'confirmed', additionalData);
                
                if (result.success) {
                    console.log('✅ Atualizado no Firebase');
                } else {
                    console.warn('⚠️ Erro no Firebase, mas dados salvos localmente:', result.error);
                }
            } else {
                console.log('⚠️ Firebase não disponível, usando apenas localStorage');
            }
            
            console.log(`🔄 Recarregando interface...`);
            // Recarregar interface
            loadParticipants();
            updateDashboard();
            updateAllFilterCounters();
            
            console.log(`📢 Mostrando notificação...`);
            showNotification('✅ Doação confirmada com sucesso!', 'success');
            
            console.log(`✅ CONFIRMAÇÃO COMPLETA!`);
            
        } catch (error) {
            console.error('❌ Erro ao confirmar:', error);
            alert(`Erro ao confirmar: ${error.message}`);
            showNotification(`Erro ao confirmar doação: ${error.message}`, 'error');
        }
    } else {
        console.log(`❌ Confirmação cancelada pelo usuário`);
    }
}

// Rejeitar doação
async function rejectDonation(purchaseId) {
    console.log(`❌ Rejeitando doação: ${purchaseId}`);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Compra não encontrada!');
        return;
    }
    
    const buyerName = purchase.buyerName || purchase.name || 'Comprador';
    const reason = prompt(`Rejeitar doação de ${buyerName}?\n\nMotivo (opcional):`);
    
    if (reason !== null) {
        try {
            // Atualizar localmente primeiro
            purchase.status = 'rejected';
            purchase.rejectedAt = new Date().toISOString();
            purchase.rejectionReason = reason;
            purchase.rejectedBy = adminData.currentUser?.uid || 'admin';
            
            // Atualizar localStorage
            localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
            
            // Tentar atualizar no Firebase se disponível
            if (typeof window.FirebaseDB !== 'undefined') {
                const additionalData = {
                    rejectedAt: purchase.rejectedAt,
                    rejectionReason: reason,
                    rejectedBy: purchase.rejectedBy
                };
                
                const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'rejected', additionalData);
                
                if (result.success) {
                    console.log('✅ Atualizado no Firebase');
                } else {
                    console.warn('⚠️ Erro no Firebase, mas dados salvos localmente:', result.error);
                }
            }
            
            // Recarregar interface
            loadParticipants();
            updateDashboard();
            updateAllFilterCounters();
            
            showNotification('❌ Doação rejeitada. Números liberados.', 'warning');
            
        } catch (error) {
            console.error('❌ Erro ao rejeitar:', error);
            showNotification(`Erro ao rejeitar doação: ${error.message}`, 'error');
        }
    }
}

// Filtrar participantes por status
function filterParticipants(filter) {
    console.log(`🔍 Aplicando filtro: ${filter}`);
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    // Carregar participantes com filtro
    loadParticipants(filter);
    
    // Atualizar contador
    updateFilterCounter(filter);
}

// Atualizar contador de filtro
function updateFilterCounter(filter) {
    const purchases = adminData.purchases || [];
    let count = 0;
    
    if (filter === 'all') {
        count = purchases.length;
    } else {
        count = purchases.filter(p => (p.status || 'confirmed') === filter).length;
    }
    
    // Atualizar texto do botão
    const filterBtn = document.getElementById(`filter-${filter}`);
    if (filterBtn) {
        const originalText = filterBtn.textContent.split('(')[0].trim();
        filterBtn.textContent = `${originalText} (${count})`;
    }
}

// Atualizar contadores de todos os filtros
function updateAllFilterCounters() {
    const purchases = adminData.purchases || [];
    
    const counts = {
        all: purchases.length,
        pending_donation: purchases.filter(p => (p.status || 'confirmed') === 'pending_donation').length,
        confirmed: purchases.filter(p => (p.status || 'confirmed') === 'confirmed').length,
        rejected: purchases.filter(p => (p.status || 'confirmed') === 'rejected').length
    };
    
    // Atualizar textos dos botões
    const filterButtons = {
        'filter-all': '🔍 Todos',
        'filter-pending_donation': '🍼 Doações Pendentes',
        'filter-confirmed': '✅ Confirmados',
        'filter-rejected': '❌ Rejeitados'
    };
    
    Object.keys(filterButtons).forEach(buttonId => {
        const btn = document.getElementById(buttonId);
        if (btn) {
            const filter = buttonId.replace('filter-', '');
            const count = counts[filter] || 0;
            btn.textContent = `${filterButtons[buttonId]} (${count})`;
        }
    });
    
    console.log('📊 Contadores atualizados:', counts);
}

// Atualizar dashboard com estatísticas
function updateDashboard() {
    const purchases = adminData.purchases || [];
    
    // Calcular estatísticas
    const stats = {
        totalParticipants: purchases.length,
        confirmedPurchases: purchases.filter(p => p.status === 'confirmed').length,
        pendingDonations: purchases.filter(p => p.status === 'pending_donation').length,
        rejectedPurchases: purchases.filter(p => p.status === 'rejected').length,
        totalRevenue: purchases.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (p.totalAmount || 0), 0),
        totalNumbers: purchases.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (p.numbers?.length || 0), 0)
    };
    
    // Atualizar elementos do dashboard
    const elements = {
        'total-participants': stats.totalParticipants,
        'total-revenue': formatCurrency(stats.totalRevenue),
        'confirmed-count': stats.confirmedPurchases,
        'pending-count': stats.pendingDonations,
        'rejected-count': stats.rejectedPurchases,
        'total-numbers-sold': stats.totalNumbers
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
    
    console.log('📊 Dashboard atualizado:', stats);
}

// Carregar configuração
function loadConfiguration() {
    const config = adminData.config || {};
    
    const configElements = {
        'config-total-numbers': config.totalNumbers || 150,
        'config-ticket-price': config.ticketPrice || 40.00,
        'config-contact-phone': config.contactPhone || '(11) 99999-9999',
        'config-pix-key': config.pixKey || 'contato@charifa.com',
        'config-baby-name': config.babyName || 'Thomas'
    };
    
    Object.keys(configElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = configElements[id];
        }
    });
    
    // Carregar data do sorteio
    if (config.drawDate) {
        const drawDateElement = document.getElementById('config-draw-date');
        if (drawDateElement) {
            const date = new Date(config.drawDate);
            const localDateTime = date.toISOString().slice(0, 16);
            drawDateElement.value = localDateTime;
        }
    }
    
    console.log('⚙️ Configurações carregadas na interface');
}

// Salvar configuração
async function saveConfiguration(e) {
    e.preventDefault();
    console.log('💾 Salvando configurações...');
    
    try {
        const newConfig = {
            totalNumbers: parseInt(document.getElementById('config-total-numbers').value),
            ticketPrice: parseFloat(document.getElementById('config-ticket-price').value),
            drawDate: new Date(document.getElementById('config-draw-date').value),
            contactPhone: document.getElementById('config-contact-phone').value,
            pixKey: document.getElementById('config-pix-key').value,
            babyName: document.getElementById('config-baby-name').value,
            prizes: {
                first: document.getElementById('config-first-prize').value,
                second: document.getElementById('config-second-prize').value,
                third: document.getElementById('config-third-prize').value
            }
        };
        
        if (newConfig.totalNumbers < 100 || newConfig.totalNumbers > 10000) {
            throw new Error('Total de números deve estar entre 100 e 10000');
        }
        
        if (newConfig.ticketPrice < 1) {
            throw new Error('Preço do bilhete deve ser maior que R$ 1,00');
        }
        
        if (!newConfig.pixKey || !newConfig.contactPhone) {
            throw new Error('PIX e telefone são obrigatórios');
        }
        
        const result = await window.FirebaseDB.saveConfig(newConfig);
        if (!result.success) {
            throw new Error(result.error);
        }
        
        adminData.config = { ...adminData.config, ...newConfig };
        updateDashboard();
        
        showNotification('⚙️ Configurações salvas com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        showNotification('Erro ao salvar configurações: ' + error.message, 'error');
    }
}

// Exportar participantes
function exportParticipants() {
    console.log('📊 Exportando participantes...');
    
    if (adminData.purchases.length === 0) {
        alert('Nenhum participante para exportar!');
        return;
    }
    
    try {
        let csvContent = 'Nome,WhatsApp,Números,Valor,Método Pagamento,Status,Data\n';
        
        adminData.purchases.forEach(purchase => {
            const name = (purchase.buyerName || purchase.name || 'N/A').replace(/,/g, ';');
            const phone = (purchase.buyerPhone || purchase.phone || 'N/A').replace(/,/g, ';');
            const numbers = Array.isArray(purchase.numbers) ? purchase.numbers.join(';') : 'N/A';
            const amount = purchase.totalAmount || 0;
            const method = purchase.paymentMethod || 'N/A';
            const status = purchase.status || 'confirmed';
            const date = new Date(purchase.date).toLocaleDateString('pt-BR');
            
            csvContent += `"${name}","${phone}","${numbers}",${amount},"${method}","${status}","${date}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `participantes_rifa_thomas_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('📊 Lista de participantes exportada!', 'success');
        
    } catch (error) {
        console.error('❌ Erro na exportação:', error);
        showNotification('Erro ao exportar participantes: ' + error.message, 'error');
    }
}

// Realizar sorteio
async function performDraw() {
    console.log('🏆 Iniciando sorteio...');
    
    const confirmedPurchases = adminData.purchases.filter(p => p.status === 'confirmed');
    
    if (confirmedPurchases.length === 0) {
        alert('❌ Nenhum participante confirmado para o sorteio!');
        return;
    }
    
    const soldNumbers = [];
    confirmedPurchases.forEach(purchase => {
        if (Array.isArray(purchase.numbers)) {
            soldNumbers.push(...purchase.numbers);
        }
    });
    
    if (soldNumbers.length < 3) {
        alert('❌ É necessário pelo menos 3 números vendidos para realizar o sorteio!');
        return;
    }
    
    const confirmation = confirm(
        `🏆 Realizar sorteio da Rifa Thomas?\n\n` +
        `Participantes confirmados: ${confirmedPurchases.length}\n` +
        `Números vendidos: ${soldNumbers.length}\n\n` +
        `Esta ação não pode ser desfeita!`
    );
    
    if (!confirmation) return;
    
    try {
        const shuffledNumbers = [...soldNumbers].sort(() => Math.random() - 0.5);
        const winners = {
            first: shuffledNumbers[0],
            second: shuffledNumbers[1],
            third: shuffledNumbers[2]
        };
        
        const findWinner = (number) => {
            return confirmedPurchases.find(p => 
                Array.isArray(p.numbers) && p.numbers.includes(number)
            );
        };
        
        const firstWinner = findWinner(winners.first);
        const secondWinner = findWinner(winners.second);
        const thirdWinner = findWinner(winners.third);
        
        const results = {
            date: new Date().toISOString(),
            winners: {
                first: {
                    number: winners.first,
                    participant: {
                        name: firstWinner.buyerName || firstWinner.name,
                        phone: firstWinner.buyerPhone || firstWinner.phone,
                        id: firstWinner.id
                    },
                    prize: adminData.config.prizes.first
                },
                second: {
                    number: winners.second,
                    participant: {
                        name: secondWinner.buyerName || secondWinner.name,
                        phone: secondWinner.buyerPhone || secondWinner.phone,
                        id: secondWinner.id
                    },
                    prize: adminData.config.prizes.second
                },
                third: {
                    number: winners.third,
                    participant: {
                        name: thirdWinner.buyerName || thirdWinner.name,
                        phone: thirdWinner.buyerPhone || thirdWinner.phone,
                        id: thirdWinner.id
                    },
                    prize: adminData.config.prizes.third
                }
            }
        };
        
        adminData.drawResults = results;
        await window.FirebaseDB.saveDrawResults(results);
        
        const resultText = 
            `🏆 SORTEIO REALIZADO! 🏆\n\n` +
            `🥇 1º Lugar: ${firstWinner.buyerName || firstWinner.name} - Número ${winners.first}\n` +
            `   Prêmio: ${adminData.config.prizes.first}\n\n` +
            `🥈 2º Lugar: ${secondWinner.buyerName || secondWinner.name} - Número ${winners.second}\n` +
            `   Prêmio: ${adminData.config.prizes.second}\n\n` +
            `🥉 3º Lugar: ${thirdWinner.buyerName || thirdWinner.name} - Número ${winners.third}\n` +
            `   Prêmio: ${adminData.config.prizes.third}\n\n` +
            `Data: ${new Date().toLocaleString('pt-BR')}`;
        
        alert(resultText);
        showNotification('🏆 Sorteio realizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro no sorteio:', error);
        showNotification('Erro ao realizar sorteio: ' + error.message, 'error');
    }
}

// Resetar números
async function resetAllNumbers() {
    const confirmation = confirm(
        '⚠️ ATENÇÃO: Esta ação irá resetar TODOS os números e APAGAR todos os participantes!\n\n' +
        'Esta ação NÃO pode ser desfeita.\n\n' +
        'Tem certeza que deseja continuar?'
    );
    
    if (!confirmation) return;
    
    const doubleConfirm = prompt('Para confirmar, digite "RESETAR" (em maiúsculas):');
    
    if (doubleConfirm !== 'RESETAR') {
        alert('Ação cancelada - texto de confirmação incorreto.');
        return;
    }
    
    try {
        const result = await window.FirebaseDB.getPurchases();
        if (result.success) {
            for (const purchase of result.data) {
                await window.FirebaseDB.deletePurchase(purchase.id);
            }
        }
        
        adminData.purchases = [];
        loadParticipants();
        updateDashboard();
        
        showNotification('🔄 Todos os números foram resetados!', 'warning');
        
    } catch (error) {
        console.error('❌ Erro no reset:', error);
        showNotification('Erro ao resetar números: ' + error.message, 'error');
    }
}

// Editar participante (placeholder)
function editParticipant(purchaseId) {
    console.log(`✏️ Editando participante: ${purchaseId}`);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Participante não encontrado!');
        return;
    }
    
    const buyerName = purchase.buyerName || purchase.name || 'Participante';
    alert(`Edição de ${buyerName} ainda não implementada.\n\nID: ${purchaseId}\nStatus: ${purchase.status}`);
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    console.log(`📢 Notificação [${type}]: ${message}`);
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Adicionar estilos se não existirem
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-left: 4px solid #007bff;
                animation: slideIn 0.3s ease-out;
            }
            .notification-success { border-left-color: #28a745; }
            .notification-error { border-left-color: #dc3545; }
            .notification-warning { border-left-color: #ffc107; }
            .notification-info { border-left-color: #17a2b8; }
            
            .notification-content {
                padding: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .notification-message {
                flex: 1;
                margin-right: 10px;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 20px;
                height: 20px;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    // Fallback para alert se necessário
    if (type === 'error') {
        console.error('❌ ERRO:', message);
    }
}

// Funções auxiliares
function getTotalSoldNumbers() {
    return adminData.purchases.reduce((total, purchase) => {
        if (purchase.status === 'confirmed') {
            return total + purchase.numbers.length;
        }
        return total;
    }, 0);
}

function getTotalRevenue() {
    return adminData.purchases.reduce((total, purchase) => {
        if (purchase.status === 'confirmed') {
            return total + purchase.totalAmount;
        }
        return total;
    }, 0);
}

// Funções auxiliares de formatação
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Data inválida';
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Logs finais
console.log('✅ Admin.js carregado - aguardando inicialização ÚNICA');

// Expor funções globalmente para os botões onclick
window.confirmDonation = confirmDonation;
window.rejectDonation = rejectDonation;
window.filterParticipants = filterParticipants;
window.editParticipant = editParticipant;
