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
    
    // Verificar se admin.html está pronto
    if (typeof window.adminHtmlLoaded === 'undefined') {
        console.log('⏰ Aguardando admin.html carregar...');
        setTimeout(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }, 500);
        return;
    }
    
    // Aguardar Firebase estar disponível
    if (typeof window.FirebaseDB === 'undefined') {
        console.log('⏰ Aguardando Firebase carregar...');
        window.addEventListener('firebaseReady', () => {
            console.log('🔥 Firebase pronto, iniciando verificação admin...');
            startAdminVerification();
        });
        
        // Timeout de segurança para Firebase
        setTimeout(() => {
            if (typeof window.FirebaseDB !== 'undefined') {
                console.log('🔥 Firebase disponível via timeout');
                startAdminVerification();
            } else {
                console.error('❌ Firebase não carregou - redirecionando');
                window.showErrorAndRedirect('Firebase não conseguiu carregar. Tente novamente.');
            }
        }, 10000);
    } else {
        console.log('🔥 Firebase já disponível');
        startAdminVerification();
    }
});

// Função principal de inicialização
function initializeAdmin() {
    console.log('🚀 [CORRIGIDO] Inicializando admin...');
    
    // Aguardar DOM estar pronto
    const ensureDOMReady = () => {
        if (document.readyState === 'complete') {
            proceedWithInitialization();
        } else {
            console.log('⏰ [CORRIGIDO] Aguardando DOM estar pronto...');
            setTimeout(ensureDOMReady, 100);
        }
    };
    
    ensureDOMReady();
}

function proceedWithInitialization() {
    console.log('✅ [CORRIGIDO] DOM pronto, iniciando sistemas...');
    
    if (typeof window.FirebaseDB !== 'undefined') {
        initializeAdminWithFirebase();
    } else {
        console.log('⏰ [CORRIGIDO] Aguardando Firebase...');
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
    
    // Verificar se DOM está pronto
    if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
        console.log('⏰ [CORRIGIDO] DOM não está pronto, aguardando...');
        setTimeout(() => loadParticipants(filter), 500);
        return;
    }
    
    const tbody = document.getElementById('participants-tbody');
    if (!tbody) {
        console.error('❌ [CORRIGIDO] Elemento participants-tbody não encontrado');
        console.log('🔍 [CORRIGIDO] Elementos disponíveis:', Object.keys(document.querySelectorAll('[id]')).map(i => document.querySelectorAll('[id]')[i].id).filter(Boolean));
        return;
    }
    
    tbody.innerHTML = '';
    
    let filteredPurchases = adminData.purchases || [];
    
    if (filter !== 'all') {
        filteredPurchases = filteredPurchases.filter(purchase => {
            const status = purchase.status || 'confirmed';
            return status === filter;
        });
    }
    
    console.log('📋 [CORRIGIDO] Exibindo', filteredPurchases.length, 'participantes');
    
    if (filteredPurchases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                    📭 Nenhum participante encontrado
                    <br><small>Status do filtro: ${filter}</small>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredPurchases.forEach((purchase, index) => {
        try {
            const row = createParticipantRow(purchase, index);
            tbody.appendChild(row);
        } catch (error) {
            console.error('❌ [CORRIGIDO] Erro ao criar linha:', error, purchase);
        }
    });
    
    console.log('✅ [CORRIGIDO] Participantes carregados na tabela');
}

// Criar linha de participante
function createParticipantRow(purchase, index) {
    const row = document.createElement('tr');
    
    // Verificar se purchase tem dados válidos
    if (!purchase || !purchase.numbers) {
        console.error('❌ [CORRIGIDO] Dados de compra inválidos:', purchase);
        row.innerHTML = `
            <td colspan="7" style="text-align: center; color: #dc3545;">
                ❌ Dados inválidos (ID: ${purchase?.id || 'N/A'})
            </td>
        `;
        return row;
    }
    
    const numbersText = Array.isArray(purchase.numbers) 
        ? purchase.numbers.sort((a, b) => a - b).map(n => n.toString().padStart(3, '0')).join(', ')
        : 'N/A';
    
    const status = purchase.status || 'confirmed';
    const paymentMethod = purchase.paymentMethod || 'pix';
    
    // Criar botões de ação baseados no status
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
    if (status === 'pending_donation') {
        statusBadge = '<span class="status-badge status-pending">🍼 Doação Pendente</span>';
    } else if (status === 'confirmed') {
        statusBadge = '<span class="status-badge status-confirmed">✅ Confirmado</span>';
    } else if (status === 'rejected') {
        statusBadge = '<span class="status-badge status-rejected">❌ Rejeitado</span>';
    } else {
        statusBadge = `<span class="status-badge status-unknown">❓ ${status}</span>`;
    }
    
    // Método de pagamento
    let paymentDisplay = '';
    if (paymentMethod === 'pix') {
        paymentDisplay = '<span class="payment-method payment-pix">💳 PIX</span>';
    } else if (paymentMethod === 'doacao') {
        paymentDisplay = '<span class="payment-method payment-doacao">🍼 Doação</span>';
    } else {
        paymentDisplay = `<span class="payment-method payment-other">💰 ${paymentMethod}</span>`;
    }
    
    // Nome e telefone com fallback
    const buyerName = purchase.buyerName || purchase.name || 'N/A';
    const buyerPhone = purchase.buyerPhone || purchase.phone || 'N/A';
    const totalAmount = purchase.totalAmount || 0;
    const purchaseDate = purchase.date || new Date().toISOString();
    
    row.innerHTML = `
        <td>${buyerName}</td>
        <td>${buyerPhone}</td>
        <td title="${numbersText}">${Array.isArray(purchase.numbers) ? purchase.numbers.length : 0} números</td>
        <td>${formatCurrency(totalAmount)}</td>
        <td>${paymentDisplay}</td>
        <td>${statusBadge}</td>
        <td>${formatDate(purchaseDate)}</td>
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
    console.log('⚙️ [CONFIG] Carregando configurações...');
    
    const fields = {
        'config-total-numbers': adminData.config.totalNumbers,
        'config-ticket-price': adminData.config.ticketPrice,
        'config-draw-date': '2025-07-11T16:00',
        'config-contact-phone': adminData.config.contactPhone,
        'config-pix-key': adminData.config.pixKey,
        'config-baby-name': adminData.config.babyName || 'Thomas',
        'config-first-prize': adminData.config.prizes.first,
        'config-second-prize': adminData.config.prizes.second,
        'config-third-prize': adminData.config.prizes.third
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
    
    console.log('✅ [CONFIG] Configurações carregadas');
}

// Salvar configuração
async function saveConfiguration(e) {
    e.preventDefault();
    console.log('💾 [CONFIG] Salvando configurações...');
    
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
        
        // Validações básicas
        if (newConfig.totalNumbers < 100 || newConfig.totalNumbers > 10000) {
            throw new Error('Total de números deve estar entre 100 e 10000');
        }
        
        if (newConfig.ticketPrice < 1) {
            throw new Error('Preço do bilhete deve ser maior que R$ 1,00');
        }
        
        if (!newConfig.pixKey || !newConfig.contactPhone) {
            throw new Error('PIX e telefone são obrigatórios');
        }
        
        if (adminData.firebaseReady) {
            const result = await window.FirebaseDB.saveConfig(newConfig);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            showNotification('⚙️ Configurações salvas com sucesso!', 'success');
        } else {
            localStorage.setItem('adminConfig', JSON.stringify(newConfig));
            alert('⚙️ Configurações salvas com sucesso!');
        }
        
        adminData.config = { ...adminData.config, ...newConfig };
        updateDashboard();
        
        console.log('✅ [CONFIG] Configurações salvas:', newConfig);
        
    } catch (error) {
        console.error('❌ [CONFIG] Erro ao salvar:', error);
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

// ============ FUNÇÕES DE DEBUG E TESTE ============

// Função para debug do sistema
window.debugAdmin = {
    // Verificar estado do sistema
    checkStatus: function() {
        console.log('🔍 [DEBUG] Status do Admin:');
        console.log('  - Firebase Ready:', adminData.firebaseReady);
        console.log('  - Purchases:', adminData.purchases.length);
        console.log('  - Current User:', adminData.currentUser);
        console.log('  - DOM Ready:', document.readyState);
        
        const tbody = document.getElementById('participants-tbody');
        console.log('  - Tabela encontrada:', !!tbody);
        
        return {
            firebaseReady: adminData.firebaseReady,
            purchasesCount: adminData.purchases.length,
            hasCurrentUser: !!adminData.currentUser,
            domReady: document.readyState,
            tableExists: !!tbody
        };
    },
    
    // Forçar reload dos participantes
    reloadParticipants: function() {
        console.log('🔄 [DEBUG] Forçando reload dos participantes...');
        loadParticipants();
    },
    
    // Criar dados de teste
    createTestData: async function() {
        if (!adminData.firebaseReady) {
            console.error('❌ [DEBUG] Firebase não está pronto');
            return;
        }
        
        const testData = {
            buyerName: 'Debug Test User',
            buyerPhone: '(11) 99999-9999',
            numbers: [999, 998, 997],
            totalAmount: 120.00,
            paymentMethod: 'doacao',
            status: 'pending_donation',
            date: new Date().toISOString()
        };
        
        try {
            const result = await window.FirebaseDB.savePurchase(testData);
            console.log('✅ [DEBUG] Dados de teste criados:', result);
            return result;
        } catch (error) {
            console.error('❌ [DEBUG] Erro ao criar dados:', error);
            return null;
        }
    },
    
    // Testar função de confirmação
    testConfirm: function(purchaseId) {
        if (!purchaseId) {
            const pendingPurchase = adminData.purchases.find(p => p.status === 'pending_donation');
            if (pendingPurchase) {
                purchaseId = pendingPurchase.id;
            } else {
                console.error('❌ [DEBUG] Nenhuma compra pendente encontrada');
                return;
            }
        }
        
        console.log('✅ [DEBUG] Testando confirmação para:', purchaseId);
        confirmDonation(purchaseId);
    },
    
    // Mostrar dados completos
    showData: function() {
        console.log('📊 [DEBUG] Dados completos:', {
            adminData: adminData,
            purchases: adminData.purchases,
            config: adminData.config
        });
    }
};

// Adicionar ao window para acesso global
window.adminDebug = window.debugAdmin;

// Log de debug carregado
console.log('🔧 [DEBUG] Funções de debug carregadas - use window.debugAdmin ou window.adminDebug');

// Logs para debug
console.log('🔧 [CORRIGIDO] Admin.js carregado - aguardando eventos...');

// ============ FUNCIONALIDADES ADMINISTRATIVAS COMPLETAS ============

// Filtrar participantes por status
function filterParticipants(status) {
    console.log('🔍 [FILTRO] Filtrando por status:', status);
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('filter-' + status).classList.add('active');
    
    // Recarregar tabela com filtro
    loadParticipants(status);
}

// Exportar lista de participantes
function exportParticipants() {
    console.log('📊 [EXPORT] Exportando participantes...');
    
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
        
        // Download do arquivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `participantes_rifa_thomas_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('📊 Lista de participantes exportada!', 'success');
        console.log('✅ [EXPORT] Arquivo exportado com sucesso');
        
    } catch (error) {
        console.error('❌ [EXPORT] Erro na exportação:', error);
        showNotification('Erro ao exportar participantes: ' + error.message, 'error');
    }
}

// Resetar todos os números
async function resetAllNumbers() {
    const confirmation = confirm(
        '⚠️ ATENÇÃO: Esta ação irá resetar TODOS os números e APAGAR todos os participantes!\n\n' +
        'Esta ação NÃO pode ser desfeita.\n\n' +
        'Tem certeza que deseja continuar?'
    );
    
    if (!confirmation) return;
    
    const doubleConfirm = prompt(
        'Para confirmar, digite "RESETAR" (em maiúsculas):'
    );
    
    if (doubleConfirm !== 'RESETAR') {
        alert('Ação cancelada - texto de confirmação incorreto.');
        return;
    }
    
    try {
        console.log('🔄 [RESET] Iniciando reset de números...');
        
        if (adminData.firebaseReady) {
            // Reset no Firebase - deletar todas as compras
            const result = await window.FirebaseDB.getPurchases();
            if (result.success) {
                for (const purchase of result.data) {
                    await window.FirebaseDB.deletePurchase(purchase.id);
                }
            }
            
            // Limpar dados locais
            adminData.purchases = [];
            
            showNotification('🔄 Todos os números foram resetados!', 'warning');
            console.log('✅ [RESET] Reset concluído com sucesso');
        } else {
            // Fallback localStorage
            localStorage.removeItem('purchases');
            adminData.purchases = [];
            
            alert('🔄 Todos os números foram resetados!');
        }
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        
    } catch (error) {
        console.error('❌ [RESET] Erro no reset:', error);
        showNotification('Erro ao resetar números: ' + error.message, 'error');
    }
}

// Realizar sorteio
async function performDraw() {
    console.log('🏆 [SORTEIO] Iniciando sorteio...');
    
    const confirmedPurchases = adminData.purchases.filter(p => p.status === 'confirmed');
    
    if (confirmedPurchases.length === 0) {
        alert('❌ Nenhum participante confirmado para o sorteio!');
        return;
    }
    
    // Coletar todos os números vendidos
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
        // Sortear números
        const shuffledNumbers = [...soldNumbers].sort(() => Math.random() - 0.5);
        const winners = {
            first: shuffledNumbers[0],
            second: shuffledNumbers[1],
            third: shuffledNumbers[2]
        };
        
        // Encontrar participantes ganhadores
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
        
        // Salvar resultados
        adminData.drawResults = results;
        
        if (adminData.firebaseReady) {
            await window.FirebaseDB.saveDrawResults(results);
        } else {
            localStorage.setItem('drawResults', JSON.stringify(results));
        }
        
        // Mostrar resultados
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
        console.log('✅ [SORTEIO] Sorteio concluído:', results);
        
    } catch (error) {
        console.error('❌ [SORTEIO] Erro no sorteio:', error);
        showNotification('Erro ao realizar sorteio: ' + error.message, 'error');
    }
}

// Editar participante
async function editParticipant(purchaseId) {
    console.log('✏️ [EDIT] Editando participante:', purchaseId);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Participante não encontrado!');
        return;
    }
    
    const currentName = purchase.buyerName || purchase.name || '';
    const currentPhone = purchase.buyerPhone || purchase.phone || '';
    
    const newName = prompt('Nome do participante:', currentName);
    if (!newName || newName.trim() === '') {
        alert('Nome é obrigatório!');
        return;
    }
    
    const newPhone = prompt('WhatsApp do participante:', currentPhone);
    if (!newPhone || newPhone.trim() === '') {
        alert('WhatsApp é obrigatório!');
        return;
    }
    
    try {
        const updateData = {
            buyerName: newName.trim(),
            buyerPhone: newPhone.trim(),
            // Manter compatibilidade
            name: newName.trim(),
            phone: newPhone.trim(),
            updatedAt: new Date().toISOString()
        };
        
        if (adminData.firebaseReady) {
            const result = await window.FirebaseDB.updatePurchase(purchaseId, updateData);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            showNotification('✅ Dados atualizados com sucesso!', 'success');
        } else {
            // Atualizar localStorage
            Object.assign(purchase, updateData);
            localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
            
            loadParticipants();
            alert('✅ Dados atualizados com sucesso!');
        }
        
        console.log('✅ [EDIT] Participante editado com sucesso');
        
    } catch (error) {
        console.error('❌ [EDIT] Erro ao editar:', error);
        showNotification('Erro ao editar participante: ' + error.message, 'error');
    }
}

// Funções do painel (implementadas)
function refreshData() {
    console.log('🔄 [REFRESH] Atualizando dados...');
    
    if (adminData.firebaseReady) {
        loadDataFromFirebase();
    } else {
        loadParticipants();
        updateDashboard();
    }
    
    showNotification('🔄 Dados atualizados!', 'success');
}

function exportData() {
    exportParticipants();
}

function openDrawModal() {
    performDraw();
}

// Função principal de verificação admin (SEM conflitos)
async function startAdminVerification() {
    try {
        console.log('🔐 [ADMIN] Iniciando verificação de acesso...');
        window.updateVerificationStatus('Iniciando verificação de administrador...');
        
        // Passo 1: Verificar Firebase
        if (typeof window.FirebaseDB === 'undefined') {
            throw new Error('Firebase não está disponível');
        }
        
        window.updateVerificationStatus('Firebase conectado ✓');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Passo 2: Verificar autenticação
        window.updateVerificationStatus('Verificando autenticação...');
        
        const currentAdminResult = await window.FirebaseDB.getCurrentAdmin();
        console.log('📊 [ADMIN] Resultado getCurrentAdmin:', currentAdminResult);
        
        if (!currentAdminResult.success) {
            throw new Error(currentAdminResult.error || 'Falha na verificação de autenticação');
        }
        
        window.updateVerificationStatus('Autenticação verificada ✓');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Passo 3: Verificar permissões
        window.updateVerificationStatus('Validando permissões de administrador...');
        
        if (!currentAdminResult.isAdmin) {
            throw new Error('Usuário não possui permissões de administrador');
        }
        
        // Verificação dupla
        const isAdminCheck = await window.FirebaseDB.isAdmin(currentAdminResult.user.uid);
        if (!isAdminCheck) {
            throw new Error('Falha na verificação dupla de permissões');
        }
        
        window.updateVerificationStatus('Permissões validadas ✓');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Passo 4: Inicializar sistema
        window.updateVerificationStatus('Carregando painel administrativo...');
        
        // Definir dados do usuário
        adminData.currentUser = currentAdminResult.user;
        adminData.firebaseReady = true;
        
        // Mostrar painel principal
        window.showMainContent(currentAdminResult.user.email);
        
        // Inicializar admin system
        await new Promise(resolve => setTimeout(resolve, 500));
        initializeAdmin();
        
        console.log('✅ [ADMIN] Sistema administrativo inicializado com sucesso');
        
    } catch (error) {
        console.error('❌ [ADMIN] Erro na verificação:', error);
        window.showErrorAndRedirect(error.message);
    }
}
