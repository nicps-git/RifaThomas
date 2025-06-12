// Versão corrigida do admin.js - foco nas funções de confirmação
// Data: 12/06/2025

console.log('🔧 [CORRIGIDO] Admin.js carregando versão corrigida...');

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
    unsubscribe: null,
    currentUser: null
};

// Inicializar painel administrativo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 [CORRIGIDO] Admin.js DOM carregado');
    
    // Aguardar o evento do sistema administrativo
    window.addEventListener('adminSystemReady', (event) => {
        console.log('✅ [CORRIGIDO] Sistema administrativo pronto:', event.detail.user.email);
        adminData.currentUser = event.detail.user;
        initializeAdmin();
    });
    
    // Fallback para compatibilidade
    window.addEventListener('adminReady', (event) => {
        console.log('✅ [FALLBACK] Evento antigo recebido:', event.detail.user.email);
        adminData.currentUser = event.detail.user;
        initializeAdmin();
    });
    
    // Timeout de segurança
    setTimeout(() => {
        if (!adminData.firebaseReady && typeof window.FirebaseDB !== 'undefined') {
            console.log('⏰ [TIMEOUT] Tentando inicializar...');
            verifyAndInitialize();
        }
    }, 10000);
});

// Verificar e inicializar com timeout
async function verifyAndInitialize() {
    try {
        if (typeof window.FirebaseDB === 'undefined') {
            console.error('❌ Firebase não disponível');
            return;
        }
        
        const result = await window.FirebaseDB.getCurrentAdmin();
        if (result.success && result.isAdmin) {
            console.log('✅ [TIMEOUT] Admin válido, inicializando...');
            adminData.currentUser = result.user;
            initializeAdmin();
        } else {
            console.log('❌ [TIMEOUT] Usuário não é admin');
        }
    } catch (error) {
        console.error('❌ [TIMEOUT] Erro:', error);
    }
}

// Função principal de inicialização
function initializeAdmin() {
    console.log('🚀 [CORRIGIDO] Inicializando admin...');
    
    if (typeof window.FirebaseDB !== 'undefined') {
        initializeAdminWithFirebase();
    } else {
        window.addEventListener('firebaseReady', () => {
            initializeAdminWithFirebase();
        });
    }
    
    setupAdminEventListeners();
    updateDashboard();
    loadConfiguration();
}

// Inicializar com Firebase
async function initializeAdminWithFirebase() {
    try {
        console.log('🔥 [CORRIGIDO] Inicializando Firebase admin...');
        
        // Obter usuário atual
        const currentAdmin = await window.FirebaseDB.getCurrentAdmin();
        if (currentAdmin.success) {
            adminData.currentUser = currentAdmin.user;
            console.log('✅ [CORRIGIDO] Admin confirmado:', currentAdmin.user.email);
        }
        
        adminData.firebaseReady = true;
        
        // Carregar dados do Firebase
        await loadDataFromFirebase();
        
        // Escutar mudanças em tempo real
        adminData.unsubscribe = window.FirebaseDB.onPurchasesChange((purchases) => {
            console.log('🔄 [CORRIGIDO] Dados atualizados:', purchases.length, 'compras');
            adminData.purchases = purchases;
            loadParticipants();
            updateDashboard();
        });
        
        console.log('🔥 [CORRIGIDO] Admin Firebase conectado!');
        
    } catch (error) {
        console.error('❌ [CORRIGIDO] Erro ao inicializar Firebase:', error);
        redirectToLogin();
    }
}

// Carregar dados do Firebase
async function loadDataFromFirebase() {
    try {
        console.log('📊 [CORRIGIDO] Carregando dados...');
        
        // Carregar compras
        const purchasesResult = await window.FirebaseDB.getPurchases();
        if (purchasesResult.success) {
            adminData.purchases = purchasesResult.data;
            console.log('✅ [CORRIGIDO] Compras carregadas:', purchasesResult.data.length);
        }
        
        // Carregar configurações
        const configResult = await window.FirebaseDB.getConfig();
        if (configResult.success) {
            adminData.config = { ...adminData.config, ...configResult.data };
            console.log('✅ [CORRIGIDO] Configurações carregadas');
        }
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        
    } catch (error) {
        console.error('❌ [CORRIGIDO] Erro ao carregar dados:', error);
    }
}

// Configurar event listeners
function setupAdminEventListeners() {
    console.log('🎯 [CORRIGIDO] Configurando event listeners...');
    
    // Verificar se elementos existem antes de adicionar listeners
    const configForm = document.getElementById('config-form');
    if (configForm) {
        configForm.addEventListener('submit', saveConfiguration);
    }
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Carregar participantes
function loadParticipants(filter = 'all') {
    console.log('👥 [CORRIGIDO] Carregando participantes, filtro:', filter);
    
    const tbody = document.getElementById('participants-tbody');
    if (!tbody) {
        console.error('❌ [CORRIGIDO] Elemento participants-tbody não encontrado');
        return;
    }
    
    tbody.innerHTML = '';
    
    let filteredPurchases = adminData.purchases;
    
    if (filter !== 'all') {
        filteredPurchases = adminData.purchases.filter(purchase => {
            const status = purchase.status || 'confirmed';
            return status === filter;
        });
    }
    
    console.log('📋 [CORRIGIDO] Exibindo', filteredPurchases.length, 'participantes');
    
    filteredPurchases.forEach((purchase, index) => {
        const row = createParticipantRow(purchase, index);
        tbody.appendChild(row);
    });
}

// Criar linha de participante
function createParticipantRow(purchase, index) {
    const row = document.createElement('tr');
    
    const numbersText = purchase.numbers
        .sort((a, b) => a - b)
        .map(n => n.toString().padStart(3, '0'))
        .join(', ');
    
    const status = purchase.status || 'confirmed';
    const paymentMethod = purchase.paymentMethod || 'pix';
    
    // Criar botões de ação baseados no status
    let actionButtons = '';
    if (status === 'pending_donation') {
        actionButtons = `
            <div class="action-buttons">
                <button class="btn-confirm" onclick="confirmDonation('${purchase.id}')">
                    <i class="fas fa-check"></i> Confirmar
                </button>
                <button class="btn-reject" onclick="rejectDonation('${purchase.id}')">
                    <i class="fas fa-times"></i> Rejeitar
                </button>
            </div>
        `;
    } else {
        actionButtons = `
            <div class="action-buttons">
                <button class="btn-edit" onclick="editParticipant('${purchase.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </div>
        `;
    }
    
    // Badge de status
    let statusBadge = '';
    if (status === 'pending_donation') {
        statusBadge = '<span class="status-badge status-pending">🍼 Doação Pendente</span>';
    } else if (status === 'confirmed') {
        statusBadge = '<span class="status-badge status-confirmed">✅ Confirmado</span>';
    } else if (status === 'rejected') {
        statusBadge = '<span class="status-badge status-rejected">❌ Rejeitado</span>';
    }
    
    // Método de pagamento
    let paymentDisplay = '';
    if (paymentMethod === 'pix') {
        paymentDisplay = '<span class="payment-method payment-pix">💳 PIX</span>';
    } else if (paymentMethod === 'doacao') {
        paymentDisplay = '<span class="payment-method payment-doacao">🍼 Doação</span>';
    }
    
    row.innerHTML = `
        <td>${purchase.buyerName || purchase.name || 'N/A'}</td>
        <td>${purchase.buyerPhone || purchase.phone || 'N/A'}</td>
        <td title="${numbersText}">${purchase.numbers.length} números</td>
        <td>${formatCurrency(purchase.totalAmount)}</td>
        <td>${paymentDisplay}</td>
        <td>${statusBadge}</td>
        <td>${formatDate(purchase.date)}</td>
        <td>${actionButtons}</td>
    `;
    
    return row;
}

// ============ FUNÇÕES DE CONFIRMAÇÃO CORRIGIDAS ============

// Confirmar doação de fraldas (VERSÃO CORRIGIDA)
async function confirmDonation(purchaseId) {
    console.log('✅ [CORRIGIDO] Iniciando confirmação para:', purchaseId);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        console.error('❌ [CORRIGIDO] Compra não encontrada:', purchaseId);
        alert('Compra não encontrada!');
        return;
    }
    
    const numbersText = purchase.numbers.map(n => n.toString().padStart(3, '0')).join(', ');
    const buyerName = purchase.buyerName || purchase.name || 'Comprador';
    const confirmMessage = `Confirmar doação de fraldas de ${buyerName}?\n\nNúmeros: ${numbersText}\nTotal: R$ ${purchase.totalAmount.toFixed(2)}`;
    
    if (confirm(confirmMessage)) {
        try {
            console.log('🔄 [CORRIGIDO] Processando confirmação...');
            
            if (adminData.firebaseReady) {
                // Dados adicionais para o Firebase
                const additionalData = {
                    confirmedAt: new Date().toISOString(),
                    confirmedBy: adminData.currentUser.uid
                };
                
                const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'confirmed', additionalData);
                
                if (!result.success) {
                    throw new Error(result.error);
                }
                
                console.log('✅ [CORRIGIDO] Confirmação salva no Firebase');
                showNotification('✅ Doação confirmada com sucesso!', 'success');
            } else {
                // Fallback localStorage
                purchase.status = 'confirmed';
                purchase.confirmedAt = new Date().toISOString();
                localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
                
                loadParticipants();
                updateDashboard();
                alert('✅ Doação confirmada com sucesso!\nNúmeros foram marcados como vendidos.');
            }
        } catch (error) {
            console.error('❌ [CORRIGIDO] Erro ao confirmar:', error);
            showNotification(`Erro ao confirmar doação: ${error.message}`, 'error');
        }
    }
}

// Rejeitar doação de fraldas (VERSÃO CORRIGIDA)
async function rejectDonation(purchaseId) {
    console.log('❌ [CORRIGIDO] Iniciando rejeição para:', purchaseId);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        console.error('❌ [CORRIGIDO] Compra não encontrada:', purchaseId);
        alert('Compra não encontrada!');
        return;
    }
    
    const buyerName = purchase.buyerName || purchase.name || 'Comprador';
    const promptMessage = `Rejeitar doação de ${buyerName}?\n\nMotivo (opcional):`;
    const reason = prompt(promptMessage);
    
    if (reason !== null) {
        try {
            console.log('🔄 [CORRIGIDO] Processando rejeição...');
            
            if (adminData.firebaseReady) {
                // Dados adicionais para o Firebase
                const additionalData = {
                    rejectedAt: new Date().toISOString(),
                    rejectionReason: reason,
                    rejectedBy: adminData.currentUser.uid
                };
                
                const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'rejected', additionalData);
                
                if (!result.success) {
                    throw new Error(result.error);
                }
                
                console.log('✅ [CORRIGIDO] Rejeição salva no Firebase');
                showNotification('❌ Doação rejeitada. Números liberados.', 'warning');
            } else {
                // Fallback localStorage
                purchase.status = 'rejected';
                purchase.rejectedAt = new Date().toISOString();
                purchase.rejectionReason = reason;
                localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
                
                loadParticipants();
                updateDashboard();
                alert('❌ Doação rejeitada.\nNúmeros foram liberados para venda.');
            }
        } catch (error) {
            console.error('❌ [CORRIGIDO] Erro ao rejeitar:', error);
            showNotification(`Erro ao rejeitar doação: ${error.message}`, 'error');
        }
    }
}

// ============ FUNÇÕES AUXILIARES ============

// Atualizar dashboard
function updateDashboard() {
    const totalSold = getTotalSoldNumbers();
    const totalRevenue = getTotalRevenue();
    const totalParticipants = adminData.purchases.length;
    const completionRate = ((totalSold / adminData.config.totalNumbers) * 100).toFixed(1);
    
    // Atualizar elementos se existirem
    const elements = {
        'total-participants': totalParticipants,
        'total-revenue': formatCurrency(totalRevenue),
        'completion-rate': completionRate + '%',
        'total-sold': totalSold
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Carregar configuração
function loadConfiguration() {
    const fields = {
        'config-total-numbers': adminData.config.totalNumbers,
        'config-ticket-price': adminData.config.ticketPrice,
        'config-draw-date': '2025-07-11T16:00',
        'config-pix-key': adminData.config.pixKey,
        'config-first-prize': adminData.config.prizes.first,
        'config-second-prize': adminData.config.prizes.second,
        'config-third-prize': adminData.config.prizes.third,
        'config-contact-phone': adminData.config.contactPhone
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
}

// Salvar configuração
async function saveConfiguration(e) {
    e.preventDefault();
    
    const newConfig = {
        totalNumbers: parseInt(document.getElementById('config-total-numbers').value),
        ticketPrice: parseFloat(document.getElementById('config-ticket-price').value),
        drawDate: new Date(document.getElementById('config-draw-date').value),
        pixKey: document.getElementById('config-pix-key').value,
        prizes: {
            first: document.getElementById('config-first-prize').value,
            second: document.getElementById('config-second-prize').value,
            third: document.getElementById('config-third-prize').value
        },
        contactPhone: document.getElementById('config-contact-phone').value
    };
    
    try {
        if (adminData.firebaseReady) {
            const result = await window.FirebaseDB.saveConfig(newConfig);
            if (!result.success) {
                throw new Error(result.error);
            }
        } else {
            localStorage.setItem('adminConfig', JSON.stringify(newConfig));
        }
        
        adminData.config = newConfig;
        showNotification('Configurações salvas com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showNotification('Erro ao salvar configurações: ' + error.message, 'error');
    }
}

// Outras funções utilitárias
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

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function showNotification(message, type) {
    if (!type) type = 'success';
    
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    
    const iconClass = type === 'success' ? 'check' : (type === 'error' ? 'times' : 'exclamation');
    notification.innerHTML = '<i class="fas fa-' + iconClass + '"></i> ' + message;
    
    document.body.appendChild(notification);
    
    setTimeout(function() { notification.classList.add('show'); }, 100);
    
    setTimeout(function() {
        notification.classList.remove('show');
        setTimeout(function() { 
            if (notification.parentNode) {
                document.body.removeChild(notification); 
            }
        }, 300);
    }, 3000);
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

// Logs para debug
console.log('🔧 [CORRIGIDO] Admin.js carregado - aguardando eventos...');
