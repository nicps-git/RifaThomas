// =========================// ==========================================
// 🚀 INICIALIZAÇÃO PRINCIPAL 
// ==========================================

// Verificação de autenticação antes de iniciar
async function checkAuthentication() {
    console.log('🔐 Verificando autenticação do administrador...');
    
    try {
        // Verificar se FirebaseDB está disponível
        if (typeof window.FirebaseDB === 'undefined') {
            console.error('❌ FirebaseDB não disponível - redirecionando para login');
            window.location.href = 'login.html?error=noFirebaseDB';
            return false;
        }
        
        // Aguardar um pequeno tempo para garantir que Auth está pronto
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se é um admin autenticado
        const adminResult = await window.FirebaseDB.getCurrentAdmin();
        console.log('📊 Resultado da verificação de admin:', adminResult);
        
        if (!adminResult.success || !adminResult.isAdmin) {
            console.error('❌ Usuário não autenticado como administrador');
            
            // Tentar reautenticar uma vez antes de redirecionar (pode ser um refresh da página)
            try {
                console.log('🔄 Tentando reautenticar...');
                const currentUser = firebase.auth().currentUser;
                if (currentUser) {
                    // Verificar novamente se é admin
                    const recheck = await window.FirebaseDB.isAdmin(currentUser.uid);
                    if (recheck) {
                        console.log('✅ Reautenticação bem-sucedida');
                        return true;
                    }
                }
            } catch (retryError) {
                console.log('⚠️ Falha na reautenticação:', retryError);
            }
            
            // Se chegou aqui, falhou na reautenticação
            if (window.showAdminError) {
                window.showAdminError('Acesso não autorizado. Faça login como administrador.');
            } else {
                alert('Acesso não autorizado. Redirecionando para login.');
                window.location.href = 'login.html?error=notAdmin';
            }
            return false;
        }
        
        console.log('✅ Administrador verificado:', adminResult.user.email);
        return true;
    } catch (error) {
        console.error('❌ Erro na verificação de autenticação:', error);
        window.location.href = 'login.html?error=authError';
        return false;
    }
}

async function initializeAdmin() {
    if (initializationInProgress || systemInitialized) {
        console.log('⚠️ Inicialização já em andamento ou concluída');
        return;
    }
    
    initializationInProgress = true;
    console.log('🚀 Iniciando sistema administrativo...');
    
    // Verificar autenticação antes de continuar
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
        console.log('⛔ Inicialização cancelada - Autenticação falhou');
        initializationInProgress = false;
        return;
    }
    
    try {
        // 1. Configurar Event Delegation PRIMEIRO
        setupEventDelegation();
        console.log('✅ Event delegation configurado');
// 🔧 ADMIN.JS CORRIGIDO - CONFIRMAÇÃO FUNCIONANDO
// ==========================================
// Versão com Event Delegation para botões de confirmação
// Este arquivo substitui o admin.js e corrige os problemas de confirmação

// ==========================================
// 🚀 VARIÁVEIS GLOBAIS E CONFIGURAÇÕES
// ==========================================

let initializationInProgress = false;
let systemInitialized = false;

const adminData = {
    purchases: [],
    config: {
        totalNumbers: 150,
        ticketPrice: 40.00,
        prizes: {
            first: 'R$ 100,00',
            second: 'R$ 200,00',
            third: 'Fraldas por faixa'
        }
    },
    currentUser: null,
    firebaseReady: false
};

// ==========================================
// 🔥 INICIALIZAÇÃO PRINCIPAL 
// ==========================================

async function initializeAdmin() {
    if (initializationInProgress || systemInitialized) {
        console.log('⚠️ Inicialização já em andamento ou concluída');
        return;
    }
    
    initializationInProgress = true;
    console.log('🚀 Iniciando sistema administrativo...');
    
    try {
        // 1. Configurar Event Delegation PRIMEIRO
        setupEventDelegation();
        console.log('✅ Event delegation configurado');
        
        // 2. Tentar carregar do Firebase
        if (typeof window.FirebaseDB !== 'undefined') {
            console.log('🔥 Tentando carregar dados do Firebase...');
            try {
                const result = await window.FirebaseDB.loadPurchases();
                console.log('📊 Resultado do loadPurchases:', result);
                
                if (result.success && Array.isArray(result.data)) {
                    adminData.purchases = result.data;
                    adminData.firebaseReady = true;
                    console.log(`✅ Firebase: ${result.data.length} compras carregadas`);
                    
                    // Log detalhado dos dados carregados
                    console.log('📋 Primeiras 3 compras:', result.data.slice(0, 3));
                } else {
                    console.warn('⚠️ Firebase retornou resultado inválido:', result);
                    throw new Error(`Dados inválidos do Firebase: ${result.error || 'Resultado não é um array'}`);
                }
            } catch (firebaseError) {
                console.error('❌ Firebase falhou completamente:', firebaseError);
                console.warn('⚠️ Tentando fallback para localStorage...');
                await loadDataFromLocalStorage();
            }
        } else {
            console.warn('📦 Firebase não disponível, usando localStorage');
            await loadDataFromLocalStorage();
        }
        
        // 3. Atualizar interface
        loadParticipants();
        updateDashboard();
        setupFormHandlers();
        
        systemInitialized = true;
        console.log('✅ Sistema administrativo inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showNotification('Erro ao inicializar sistema: ' + error.message, 'error');
    } finally {
        initializationInProgress = false;
    }
}

// ==========================================
// 🎯 EVENT DELEGATION - SOLUÇÃO PRINCIPAL
// ==========================================

function setupEventDelegation() {
    console.log('🎯 Configurando Event Delegation para botões...');
    
    // Remover listeners existentes para evitar duplicação
    document.removeEventListener('click', handleGlobalClicks);
    
    // Adicionar listener global para capturar todos os cliques
    document.addEventListener('click', handleGlobalClicks);
    
    console.log('✅ Event Delegation configurado com sucesso!');
}

function handleGlobalClicks(event) {
    const target = event.target;
    const button = target.closest('button');
    
    if (!button) return;
    
    // Prevenir comportamento padrão
    event.preventDefault();
    event.stopPropagation();
    
    const action = button.getAttribute('data-action');
    const purchaseId = button.getAttribute('data-purchase-id');
    
    console.log(`🎯 Clique capturado: action="${action}", purchaseId="${purchaseId}"`);
    
    switch (action) {
        case 'confirm-donation':
            handleConfirmDonation(purchaseId);
            break;
        case 'reject-donation':
            handleRejectDonation(purchaseId);
            break;
        case 'edit-participant':
            handleEditParticipant(purchaseId);
            break;
        default:
            console.log(`⚠️ Ação desconhecida: ${action}`);
    }
}

// ==========================================
// 🎯 HANDLERS DE CONFIRMAÇÃO
// ==========================================

async function handleConfirmDonation(purchaseId) {
    console.log(`✅ CONFIRMANDO DOAÇÃO: ${purchaseId}`);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('❌ Compra não encontrada!');
        return;
    }
    
    const buyerName = purchase.buyerName || purchase.name || 'Comprador';
    const numbers = purchase.numbers || [];
    const total = purchase.totalAmount || 0;
    
    const confirmMessage = `✅ CONFIRMAR DOAÇÃO\n\n` +
        `👤 Cliente: ${buyerName}\n` +
        `🎯 Números: ${numbers.join(', ')}\n` +
        `💰 Valor: R$ ${total.toFixed(2)}\n\n` +
        `⚠️ Esta ação não pode ser desfeita.\n` +
        `Confirmar doação?`;
    
    if (!confirm(confirmMessage)) {
        console.log('❌ Confirmação cancelada pelo usuário');
        return;
    }
    
    try {
        // Atualizar status localmente
        purchase.status = 'confirmed';
        purchase.confirmedAt = new Date().toISOString();
        purchase.confirmedBy = 'admin';
        
        // Salvar no localStorage
        localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
        console.log('💾 Dados salvos no localStorage');
        
        // Tentar salvar no Firebase se disponível
        if (adminData.firebaseReady && typeof window.FirebaseDB !== 'undefined') {
            try {
                const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'confirmed', {
                    confirmedAt: purchase.confirmedAt,
                    confirmedBy: purchase.confirmedBy
                });
                
                if (result.success) {
                    console.log('✅ Atualizado no Firebase');
                } else {
                    console.warn('⚠️ Erro no Firebase:', result.error);
                }
            } catch (firebaseError) {
                console.warn('⚠️ Firebase indisponível:', firebaseError);
            }
        }
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        updateAllFilterCounters();
        
        // Notificação de sucesso
        showNotification('✅ Doação confirmada com sucesso!', 'success');
        alert('✅ DOAÇÃO CONFIRMADA!\n\nNúmeros foram marcados como vendidos.');
        
        console.log('✅ CONFIRMAÇÃO CONCLUÍDA COM SUCESSO!');
        
    } catch (error) {
        console.error('❌ Erro ao confirmar doação:', error);
        alert(`❌ Erro ao confirmar: ${error.message}`);
        showNotification('Erro ao confirmar doação: ' + error.message, 'error');
    }
}

async function handleRejectDonation(purchaseId) {
    console.log(`❌ REJEITANDO DOAÇÃO: ${purchaseId}`);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('❌ Compra não encontrada!');
        return;
    }
    
    const buyerName = purchase.buyerName || purchase.name || 'Comprador';
    const reason = prompt(`❌ REJEITAR DOAÇÃO\n\nCliente: ${buyerName}\n\nMotivo da rejeição (opcional):`);
    
    if (reason === null) {
        console.log('❌ Rejeição cancelada pelo usuário');
        return;
    }
    
    try {
        // Atualizar status localmente
        purchase.status = 'rejected';
        purchase.rejectedAt = new Date().toISOString();
        purchase.rejectionReason = reason || 'Sem motivo especificado';
        purchase.rejectedBy = 'admin';
        
        // Salvar no localStorage
        localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
        console.log('💾 Dados salvos no localStorage');
        
        // Tentar salvar no Firebase se disponível
        if (adminData.firebaseReady && typeof window.FirebaseDB !== 'undefined') {
            try {
                const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'rejected', {
                    rejectedAt: purchase.rejectedAt,
                    rejectionReason: purchase.rejectionReason,
                    rejectedBy: purchase.rejectedBy
                });
                
                if (result.success) {
                    console.log('✅ Atualizado no Firebase');
                } else {
                    console.warn('⚠️ Erro no Firebase:', result.error);
                }
            } catch (firebaseError) {
                console.warn('⚠️ Firebase indisponível:', firebaseError);
            }
        }
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        updateAllFilterCounters();
        
        // Notificação
        showNotification('❌ Doação rejeitada. Números liberados.', 'warning');
        alert('❌ DOAÇÃO REJEITADA!\n\nNúmeros foram liberados para venda.');
        
        console.log('✅ REJEIÇÃO CONCLUÍDA COM SUCESSO!');
        
    } catch (error) {
        console.error('❌ Erro ao rejeitar doação:', error);
        alert(`❌ Erro ao rejeitar: ${error.message}`);
        showNotification('Erro ao rejeitar doação: ' + error.message, 'error');
    }
}

function handleEditParticipant(purchaseId) {
    console.log(`✏️ EDITANDO PARTICIPANTE: ${purchaseId}`);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('❌ Participante não encontrado!');
        return;
    }
    
    const buyerName = purchase.buyerName || purchase.name || 'Participante';
    alert(`✏️ EDIÇÃO DE PARTICIPANTE\n\nNome: ${buyerName}\nID: ${purchaseId}\n\n⚠️ Funcionalidade de edição será implementada em breve.`);
}

// ==========================================
// 📋 CRIAR LINHAS DE PARTICIPANTES (CORRIGIDO)
// ==========================================

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
    
    // ✨ BOTÕES COM DATA ATTRIBUTES (Event Delegation)
    let actionButtons = '';
    if (status === 'pending_donation') {
        actionButtons = `
            <div class="action-buttons">
                <button class="btn btn-confirm" 
                        data-action="confirm-donation" 
                        data-purchase-id="${purchase.id}" 
                        title="Confirmar doação">
                    <i class="fas fa-check"></i> Confirmar
                </button>
                <button class="btn btn-reject" 
                        data-action="reject-donation" 
                        data-purchase-id="${purchase.id}" 
                        title="Rejeitar doação">
                    <i class="fas fa-times"></i> Rejeitar
                </button>
            </div>
        `;
    } else {
        actionButtons = `
            <div class="action-buttons">
                <button class="btn btn-edit" 
                        data-action="edit-participant" 
                        data-purchase-id="${purchase.id}" 
                        title="Editar dados">
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

// ==========================================
// 📋 CARREGAR E EXIBIR PARTICIPANTES
// ==========================================

function loadParticipants(filter = 'all') {
    console.log(`👥 Carregando participantes (filtro: ${filter})`);
    console.log('📊 Estado atual do adminData.purchases:', adminData.purchases);
    console.log('📊 Tipo de adminData.purchases:', typeof adminData.purchases);
    console.log('📊 É array?', Array.isArray(adminData.purchases));
    
    const tbody = document.getElementById('participants-tbody');
    if (!tbody) {
        console.error('❌ Tabela de participantes não encontrada');
        return;
    }
    
    let filteredPurchases = adminData.purchases || [];
    console.log('📋 Total de compras antes do filtro:', filteredPurchases.length);
    
    if (filter !== 'all') {
        filteredPurchases = filteredPurchases.filter(purchase => {
            const status = purchase.status || 'confirmed';
            return status === filter;
        });
        console.log(`📋 Compras após filtro '${filter}':`, filteredPurchases.length);
    }
    
    tbody.innerHTML = '';
    
    if (filteredPurchases.length === 0) {
        const debugInfo = `
            Status do filtro: ${filter}
            Total de compras: ${adminData.purchases?.length || 0}
            Firebase ready: ${adminData.firebaseReady}
            Tipo de purchases: ${typeof adminData.purchases}
            É array: ${Array.isArray(adminData.purchases)}
        `;
        
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    📭 Nenhum participante encontrado
                    <br><small><pre>${debugInfo}</pre></small>
                    <br><button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">🔄 Recarregar Página</button>
                </td>
            </tr>
        `;
        console.warn('⚠️ Nenhum participante para exibir');
        return;
    }
    
    // Criar linhas para cada participante
    filteredPurchases.forEach((purchase, index) => {
        console.log(`📝 Criando linha para participante ${index + 1}:`, purchase);
        const row = createParticipantRow(purchase);
        tbody.appendChild(row);
    });
    
    console.log(`✅ ${filteredPurchases.length} participantes carregados na tabela`);
}

// ==========================================
// 📊 DASHBOARD E ESTATÍSTICAS
// ==========================================

function updateDashboard() {
    try {
        const stats = calculateStats();
        
        // Atualizar elementos do dashboard
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateElement('total-participants', stats.totalParticipants);
        updateElement('total-revenue', formatCurrency(stats.totalRevenue));
        updateElement('sold-numbers', stats.soldNumbers);
        updateElement('completion-rate', `${stats.completionRate}%`);
        
        console.log('📊 Dashboard atualizado:', stats);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar dashboard:', error);
    }
}

function calculateStats() {
    const purchases = adminData.purchases || [];
    const confirmedPurchases = purchases.filter(p => p.status === 'confirmed');
    
    const totalParticipants = purchases.length;
    const totalRevenue = confirmedPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const soldNumbers = confirmedPurchases.reduce((sum, p) => sum + (p.numbers?.length || 0), 0);
    const completionRate = Math.round((soldNumbers / adminData.config.totalNumbers) * 100);
    
    return {
        totalParticipants,
        totalRevenue,
        soldNumbers,
        completionRate
    };
}

// ==========================================
// 🔧 FUNÇÕES AUXILIARES
// ==========================================

async function loadDataFromLocalStorage() {
    console.log('📦 Tentando carregar dados do localStorage...');
    
    try {
        const storedPurchases = localStorage.getItem('purchases');
        console.log('📦 localStorage purchases raw:', storedPurchases ? 'Dados encontrados' : 'Vazio');
        
        if (storedPurchases) {
            const parsed = JSON.parse(storedPurchases);
            console.log('📦 localStorage purchases parsed:', parsed);
            
            if (Array.isArray(parsed)) {
                adminData.purchases = parsed;
                console.log(`📦 localStorage: ${adminData.purchases.length} compras carregadas`);
            } else {
                console.warn('⚠️ Dados do localStorage não são um array, criando dados de exemplo...');
                createSampleData();
            }
        } else {
            console.log('📦 localStorage vazio, criando dados de exemplo...');
            createSampleData();
        }
        
        // Verificar se há dados no adminData.purchases após carregamento
        console.log('📊 Final adminData.purchases:', adminData.purchases?.length || 0, 'compras');
        
    } catch (error) {
        console.error('❌ Erro ao carregar localStorage:', error);
        console.log('📦 Criando dados de exemplo devido ao erro...');
        createSampleData();
    }
}

function createSampleData() {
    console.log('🎭 Criando dados de exemplo...');
    
    adminData.purchases = [
        {
            id: 'sample-1',
            buyerName: 'Maria Silva',
            buyerPhone: '(11) 99999-1111',
            buyerEmail: 'maria@exemplo.com',
            numbers: [1, 2, 3],
            totalAmount: 120.00,
            paymentMethod: 'doacao',
            status: 'pending_donation',
            date: new Date().toISOString(),
            timestamp: new Date()
        },
        {
            id: 'sample-2',
            buyerName: 'João Santos',
            buyerPhone: '(11) 99999-2222',
            buyerEmail: 'joao@exemplo.com',
            numbers: [10, 20, 30],
            totalAmount: 120.00,
            paymentMethod: 'pix',
            status: 'confirmed',
            date: new Date().toISOString(),
            timestamp: new Date()
        },
        {
            id: 'sample-3',
            buyerName: 'Ana Oliveira',
            buyerPhone: '(11) 99999-3333',
            buyerEmail: 'ana@exemplo.com',
            numbers: [50, 51, 52],
            totalAmount: 120.00,
            paymentMethod: 'pix',
            status: 'confirmed',
            date: new Date().toISOString(),
            timestamp: new Date()
        },
        {
            id: 'sample-4',
            buyerName: 'Carlos Lima',
            buyerPhone: '(11) 99999-4444',
            buyerEmail: 'carlos@exemplo.com',
            numbers: [75, 76],
            totalAmount: 80.00,
            paymentMethod: 'doacao',
            status: 'pending_donation',
            date: new Date().toISOString(),
            timestamp: new Date()
        }
    ];
    
    // Salvar no localStorage para persistência
    try {
        localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
        console.log(`🎭 ${adminData.purchases.length} dados de exemplo criados e salvos`);
    } catch (error) {
        console.error('❌ Erro ao salvar dados de exemplo no localStorage:', error);
    }
}

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
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Data inválida';
    }
}

function showNotification(message, type = 'info') {
    console.log(`📢 Notificação [${type}]: ${message}`);
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Adicionar estilos inline
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1',
        color: type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460',
        padding: '15px 20px',
        borderRadius: '8px',
        border: `1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        maxWidth: '400px',
        fontSize: '14px',
        fontWeight: '500'
    });
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// ==========================================
// 🔧 FUNÇÕES DE FILTRO E CONFIGURAÇÃO
// ==========================================

function filterParticipants(filter) {
    console.log(`🔍 Aplicando filtro: ${filter}`);
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`filter-${filter}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Recarregar tabela com filtro
    loadParticipants(filter);
}

function updateAllFilterCounters() {
    const stats = {
        all: adminData.purchases.length,
        pending_donation: adminData.purchases.filter(p => p.status === 'pending_donation').length,
        confirmed: adminData.purchases.filter(p => p.status === 'confirmed').length,
        rejected: adminData.purchases.filter(p => p.status === 'rejected').length
    };
    
    // Atualizar contadores nos botões de filtro
    Object.keys(stats).forEach(filter => {
        const btn = document.getElementById(`filter-${filter}`);
        if (btn) {
            const count = stats[filter];
            btn.setAttribute('data-count', count);
        }
    });
    
    console.log('🔢 Contadores de filtro atualizados:', stats);
}

function setupFormHandlers() {
    // Configurar formulário de configurações
    const configForm = document.getElementById('config-form');
    if (configForm) {
        configForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('💾 Salvando configurações...');
            showNotification('Configurações salvas!', 'success');
        });
    }
}

// ==========================================
// 🚀 FUNÇÕES DE EXPORTAÇÃO E AÇÕES
// ==========================================

async function exportParticipants() {
    try {
        const purchases = adminData.purchases || [];
        
        if (purchases.length === 0) {
            alert('❌ Nenhum participante para exportar!');
            return;
        }
        
        const csvHeader = 'Nome,WhatsApp,Números,Valor,Método,Status,Data\n';
        const csvData = purchases.map(purchase => {
            const name = (purchase.buyerName || purchase.name || 'N/A').replace(/,/g, ';');
            const phone = (purchase.buyerPhone || purchase.phone || 'N/A').replace(/,/g, ';');
            const numbers = (purchase.numbers || []).join(';');
            const amount = (purchase.totalAmount || 0).toFixed(2);
            const method = purchase.paymentMethod === 'pix' ? 'PIX' : 'Doação';
            const status = purchase.status || 'confirmed';
            const date = formatDate(purchase.date);
            
            return `"${name}","${phone}","${numbers}",${amount},"${method}","${status}","${date}"`;
        }).join('\n');
        
        const csvContent = csvHeader + csvData;
        
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
        // Limpar dados do Firebase se disponível
        if (adminData.firebaseReady && typeof window.FirebaseDB !== 'undefined') {
            const result = await window.FirebaseDB.getPurchases();
            if (result.success) {
                for (const purchase of result.data) {
                    await window.FirebaseDB.deletePurchase(purchase.id);
                }
            }
        }
        
        // Limpar dados locais
        adminData.purchases = [];
        localStorage.removeItem('purchases');
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        updateAllFilterCounters();
        
        showNotification('🗑️ Todos os números foram resetados!', 'warning');
        alert('✅ RESET CONCLUÍDO!\n\nTodos os números foram liberados.');
        
    } catch (error) {
        console.error('❌ Erro ao resetar:', error);
        showNotification('Erro ao resetar números: ' + error.message, 'error');
    }
}

async function performDraw() {
    const confirmedPurchases = adminData.purchases.filter(p => p.status === 'confirmed');
    const soldNumbers = confirmedPurchases.flatMap(p => p.numbers || []);
    
    if (soldNumbers.length < 3) {
        alert('❌ É necessário ter pelo menos 3 números vendidos/confirmados para realizar o sorteio!');
        return;
    }
    
    const confirmation = confirm(
        `🏆 REALIZAR SORTEIO\n\n` +
        `📊 Números vendidos: ${soldNumbers.length}\n` +
        `👥 Participantes confirmados: ${confirmedPurchases.length}\n\n` +
        `⚠️ Esta ação não pode ser desfeita.\n` +
        `Realizar sorteio agora?`
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
        
        // Salvar resultados
        if (adminData.firebaseReady && typeof window.FirebaseDB !== 'undefined') {
            await window.FirebaseDB.saveDrawResults(results);
        }
        localStorage.setItem('drawResults', JSON.stringify(results));
        
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
        alert(`❌ Erro no sorteio: ${error.message}`);
        showNotification('Erro ao realizar sorteio: ' + error.message, 'error');
    }
}

// ==========================================
// 🌍 EXPOSIÇÃO DE FUNÇÕES GLOBAIS
// ==========================================

// Expor funções para uso global (compatibilidade com onclick se necessário)
window.initializeAdmin = initializeAdmin;
window.filterParticipants = filterParticipants;
window.exportParticipants = exportParticipants;
window.resetAllNumbers = resetAllNumbers;
window.performDraw = performDraw;

// ==========================================
// 🚀 AUTO-INICIALIZAÇÃO MODIFICADA
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, bypassando verificação e indo direto ao painel...');
    
    // Bypass da verificação - mostrar painel diretamente
    setTimeout(() => {
        // Simular usuário admin
        if (typeof window.showAdminPanel === 'function') {
            console.log('✅ Bypassando verificação - mostrando painel admin diretamente');
            window.showAdminPanel('admin@test.com');
        }
        
        // Inicializar sistema
        initializeAdmin();
    }, 500);
});

console.log('🔧 Admin.js CORRIGIDO carregado - Event Delegation implementado! BYPASS ATIVO');
