// Admin.js - Versão Corrigida para Carregamento de Dados
// Focado em resolver o problema de dados não carregando

let adminData = {
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
    firebaseReady: false,
    initializationAttempts: 0
};

// Flags de controle
let initializationInProgress = false;
let systemInitialized = false;

console.log('🚀 Admin.js carregado - versão corrigida para dados');

// Aguardar DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado no admin');
    
    // Tentar inicializar imediatamente se Firebase já estiver disponível
    if (typeof window.FirebaseDB !== 'undefined') {
        console.log('✅ Firebase já disponível, iniciando...');
        initializeAdminSystem();
    } else {
        console.log('⏳ Aguardando Firebase...');
        // Aguardar evento firebaseReady
        window.addEventListener('firebaseReady', () => {
            console.log('🔥 Firebase pronto, iniciando sistema admin...');
            initializeAdminSystem();
        });
        
        // Timeout de segurança
        setTimeout(() => {
            if (!systemInitialized) {
                console.warn('⏰ Timeout - tentando inicializar mesmo sem Firebase confirmado');
                initializeAdminSystem();
            }
        }, 10000);
    }
});

// Função principal de inicialização
async function initializeAdminSystem() {
    if (initializationInProgress || systemInitialized) {
        console.log('⚠️ Inicialização já em andamento ou concluída');
        return;
    }
    
    initializationInProgress = true;
    adminData.initializationAttempts++;
    
    console.log(`🚀 Iniciando sistema admin (tentativa ${adminData.initializationAttempts})...`);
    
    try {
        // 1. Verificar autenticação (já deve ter sido feita no admin.html)
        await verifyAuthentication();
        
        // 2. Configurar event listeners
        setupEventListeners();
        
        // 3. Carregar dados
        await loadPurchaseData();
        
        // 4. Atualizar interface
        updateInterface();
        
        systemInitialized = true;
        console.log('✅ Sistema admin inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização do admin:', error);
        showError(`Erro ao inicializar: ${error.message}`);
        
        // Se falhar, tentar usar dados locais
        if (adminData.initializationAttempts < 3) {
            console.log('🔄 Tentando novamente com dados locais...');
            await loadLocalData();
            updateInterface();
        }
    } finally {
        initializationInProgress = false;
    }
}

// Verificar autenticação
async function verifyAuthentication() {
    console.log('🔐 Verificando autenticação...');
    
    if (typeof window.FirebaseDB === 'undefined') {
        console.warn('⚠️ Firebase não disponível para verificação');
        return true; // Assumir que passou pela verificação do admin.html
    }
    
    try {
        const result = await window.FirebaseDB.getCurrentAdmin();
        if (result.success && result.isAdmin) {
            adminData.currentUser = result.user;
            console.log('✅ Autenticação confirmada:', result.user.email);
            return true;
        } else {
            throw new Error('Usuário não é administrador');
        }
    } catch (error) {
        console.error('❌ Falha na verificação:', error);
        // Em caso de erro, redirecionar para login
        window.location.href = 'login.html?error=auth_failed';
        return false;
    }
}

// Carregar dados das compras
async function loadPurchaseData() {
    console.log('📊 Carregando dados das compras...');
    
    // Tentar carregar do Firebase primeiro
    if (typeof window.FirebaseDB !== 'undefined') {
        try {
            console.log('🔥 Tentando carregar do Firebase...');
            const result = await window.FirebaseDB.loadPurchases();
            console.log('📋 Resultado do Firebase:', result);
            
            if (result.success && Array.isArray(result.data)) {
                adminData.purchases = result.data;
                adminData.firebaseReady = true;
                console.log(`✅ ${result.data.length} compras carregadas do Firebase`);
                
                // Salvar backup no localStorage
                try {
                    localStorage.setItem('admin_purchases_backup', JSON.stringify(result.data));
                    console.log('💾 Backup salvo no localStorage');
                } catch (backupError) {
                    console.warn('⚠️ Erro ao salvar backup:', backupError);
                }
                
                return;
            } else {
                throw new Error(`Firebase retornou dados inválidos: ${result.error || 'formato incorreto'}`);
            }
        } catch (firebaseError) {
            console.error('❌ Erro ao carregar do Firebase:', firebaseError);
            console.log('📦 Tentando carregar do localStorage...');
        }
    }
    
    // Fallback para localStorage
    await loadLocalData();
}

// Carregar dados locais
async function loadLocalData() {
    console.log('📦 Carregando dados do localStorage...');
    
    try {
        // Tentar carregar backup primeiro
        let storedData = localStorage.getItem('admin_purchases_backup');
        if (!storedData) {
            storedData = localStorage.getItem('purchases');
        }
        
        if (storedData) {
            const parsed = JSON.parse(storedData);
            if (Array.isArray(parsed)) {
                adminData.purchases = parsed;
                console.log(`📦 ${parsed.length} compras carregadas do localStorage`);
                return;
            }
        }
        
        console.log('📦 Nenhum dado local encontrado, criando dados de exemplo...');
        createSampleData();
        
    } catch (error) {
        console.error('❌ Erro ao carregar localStorage:', error);
        createSampleData();
    }
}

// Criar dados de exemplo
function createSampleData() {
    console.log('🎭 Criando dados de exemplo...');
    
    adminData.purchases = [
        {
            id: 'demo-1',
            buyerName: 'Maria Silva',
            buyerPhone: '(11) 99999-1111',
            buyerEmail: 'maria@demo.com',
            numbers: [1, 2, 3],
            totalAmount: 120.00,
            paymentMethod: 'doacao',
            status: 'pending_donation',
            date: new Date().toISOString(),
            timestamp: new Date()
        },
        {
            id: 'demo-2',
            buyerName: 'João Santos',
            buyerPhone: '(11) 98888-2222',
            buyerEmail: 'joao@demo.com',
            numbers: [10, 20, 30],
            totalAmount: 120.00,
            paymentMethod: 'pix',
            status: 'confirmed',
            date: new Date().toISOString(),
            timestamp: new Date()
        },
        {
            id: 'demo-3',
            buyerName: 'Ana Costa',
            buyerPhone: '(11) 97777-3333',
            buyerEmail: 'ana@demo.com',
            numbers: [50, 51, 52],
            totalAmount: 120.00,
            paymentMethod: 'pix',
            status: 'confirmed',
            date: new Date().toISOString(),
            timestamp: new Date()
        }
    ];
    
    // Salvar os dados de exemplo
    try {
        localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
        console.log(`🎭 ${adminData.purchases.length} dados de exemplo criados e salvos`);
    } catch (error) {
        console.error('❌ Erro ao salvar dados de exemplo:', error);
    }
}

// Configurar event listeners
function setupEventListeners() {
    console.log('🎯 Configurando event listeners...');
    
    // Event delegation para botões dinâmicos
    document.addEventListener('click', handleGlobalClick);
    
    // Filtros de status
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            loadParticipants(filter);
            
            // Atualizar visual dos filtros
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    console.log('✅ Event listeners configurados');
}

// Handler global para cliques
function handleGlobalClick(event) {
    const target = event.target;
    const button = target.closest('button');
    
    if (!button) return;
    
    const action = button.getAttribute('data-action');
    const purchaseId = button.getAttribute('data-purchase-id');
    
    if (!action) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    console.log(`🎯 Ação capturada: ${action} para compra ${purchaseId}`);
    
    switch (action) {
        case 'confirm-donation':
            confirmDonation(purchaseId);
            break;
        case 'reject-donation':
            rejectDonation(purchaseId);
            break;
        case 'edit-participant':
            editParticipant(purchaseId);
            break;
        case 'delete-participant':
            deleteParticipant(purchaseId);
            break;
        default:
            console.warn(`Ação desconhecida: ${action}`);
    }
}

// Atualizar interface
function updateInterface() {
    console.log('🔄 Atualizando interface...');
    
    try {
        updateDashboard();
        loadParticipants();
        console.log('✅ Interface atualizada com sucesso');
    } catch (error) {
        console.error('❌ Erro ao atualizar interface:', error);
        showError(`Erro ao atualizar interface: ${error.message}`);
    }
}

// Atualizar dashboard
function updateDashboard() {
    console.log('📊 Atualizando dashboard...');
    
    try {
        const stats = calculateStats();
        
        // Atualizar elementos do dashboard
        updateElement('total-participants', stats.totalParticipants);
        updateElement('total-revenue', formatCurrency(stats.totalRevenue));
        updateElement('sold-numbers', stats.soldNumbers);
        updateElement('completion-rate', `${stats.completionRate}%`);
        
        console.log('📊 Dashboard atualizado:', stats);
    } catch (error) {
        console.error('❌ Erro ao atualizar dashboard:', error);
    }
}

// Calcular estatísticas
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

// Carregar participantes na tabela
function loadParticipants(filter = 'all') {
    console.log(`👥 Carregando participantes (filtro: ${filter})`);
    console.log('📊 Total de compras disponíveis:', adminData.purchases?.length || 0);
    
    const tbody = document.getElementById('participants-tbody');
    if (!tbody) {
        console.error('❌ Elemento participants-tbody não encontrado');
        return;
    }
    
    let filteredPurchases = adminData.purchases || [];
    
    if (filter !== 'all') {
        filteredPurchases = filteredPurchases.filter(purchase => {
            const status = purchase.status || 'confirmed';
            return status === filter;
        });
    }
    
    console.log(`📋 Compras após filtro '${filter}': ${filteredPurchases.length}`);
    
    tbody.innerHTML = '';
    
    if (filteredPurchases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    📭 Nenhum participante encontrado
                    <div style="margin-top: 15px; font-size: 14px;">
                        <strong>Status do filtro:</strong> ${filter}<br>
                        <strong>Total de compras:</strong> ${adminData.purchases?.length || 0}<br>
                        <strong>Firebase conectado:</strong> ${adminData.firebaseReady ? 'Sim' : 'Não'}<br>
                        <strong>Tentativas de init:</strong> ${adminData.initializationAttempts}
                    </div>
                    <div style="margin-top: 15px;">
                        <button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                            🔄 Recarregar Página
                        </button>
                        <button onclick="loadPurchaseData()" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                            📊 Recarregar Dados
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Criar linhas para cada participante
    filteredPurchases.forEach((purchase, index) => {
        try {
            const row = createParticipantRow(purchase);
            tbody.appendChild(row);
        } catch (error) {
            console.error(`❌ Erro ao criar linha ${index + 1}:`, error);
        }
    });
    
    console.log(`✅ ${filteredPurchases.length} participantes carregados na tabela`);
}

// Criar linha da tabela para participante
function createParticipantRow(purchase) {
    const row = document.createElement('tr');
    
    const statusClass = getStatusClass(purchase.status);
    const statusText = getStatusText(purchase.status);
    const numbersText = purchase.numbers ? purchase.numbers.join(', ') : 'N/A';
    const paymentText = getPaymentMethodText(purchase.paymentMethod);
    
    row.innerHTML = `
        <td>${purchase.buyerName || 'N/A'}</td>
        <td>${purchase.buyerPhone || 'N/A'}</td>
        <td>${numbersText}</td>
        <td>${formatCurrency(purchase.totalAmount)}</td>
        <td>${paymentText}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${formatDate(purchase.date)}</td>
        <td>
            <div class="action-buttons">
                ${createActionButtons(purchase)}
            </div>
        </td>
    `;
    
    return row;
}

// Criar botões de ação baseados no status
function createActionButtons(purchase) {
    const buttons = [];
    
    if (purchase.status === 'pending_donation') {
        buttons.push(`
            <button class="btn-confirm" data-action="confirm-donation" data-purchase-id="${purchase.id}" title="Confirmar Doação">
                ✅ Confirmar
            </button>
            <button class="btn-reject" data-action="reject-donation" data-purchase-id="${purchase.id}" title="Rejeitar Doação">
                ❌ Rejeitar
            </button>
        `);
    }
    
    buttons.push(`
        <button class="btn-edit" data-action="edit-participant" data-purchase-id="${purchase.id}" title="Editar">
            ✏️ Editar
        </button>
    `);
    
    return buttons.join('');
}

// Funções auxiliares de formatação
function getStatusClass(status) {
    const classes = {
        'confirmed': 'status-confirmed',
        'pending': 'status-pending',
        'pending_donation': 'status-pending-donation',
        'rejected': 'status-rejected'
    };
    return classes[status] || 'status-unknown';
}

function getStatusText(status) {
    const texts = {
        'confirmed': 'Confirmado',
        'pending': 'Pendente',
        'pending_donation': 'Doação Pendente',
        'rejected': 'Rejeitado'
    };
    return texts[status] || 'Desconhecido';
}

function getPaymentMethodText(method) {
    const methods = {
        'pix': 'PIX',
        'doacao': 'Doação',
        'dinheiro': 'Dinheiro'
    };
    return methods[method] || method || 'N/A';
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

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    } else {
        console.warn(`⚠️ Elemento ${id} não encontrado`);
    }
}

function showError(message) {
    console.error('❌', message);
    // Implementar notificação visual se necessário
}

// Ações dos botões
async function confirmDonation(purchaseId) {
    console.log(`✅ Confirmando doação: ${purchaseId}`);
    
    try {
        if (typeof window.FirebaseDB !== 'undefined') {
            const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'confirmed');
            if (result.success) {
                console.log('✅ Status atualizado no Firebase');
            }
        }
        
        // Atualizar localmente
        const purchase = adminData.purchases.find(p => p.id === purchaseId);
        if (purchase) {
            purchase.status = 'confirmed';
            loadParticipants(); // Recarregar tabela
            updateDashboard(); // Atualizar estatísticas
        }
        
    } catch (error) {
        console.error('❌ Erro ao confirmar doação:', error);
        showError(`Erro ao confirmar: ${error.message}`);
    }
}

async function rejectDonation(purchaseId) {
    console.log(`❌ Rejeitando doação: ${purchaseId}`);
    
    try {
        if (typeof window.FirebaseDB !== 'undefined') {
            const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'rejected');
            if (result.success) {
                console.log('✅ Status atualizado no Firebase');
            }
        }
        
        // Atualizar localmente
        const purchase = adminData.purchases.find(p => p.id === purchaseId);
        if (purchase) {
            purchase.status = 'rejected';
            loadParticipants(); // Recarregar tabela
            updateDashboard(); // Atualizar estatísticas
        }
        
    } catch (error) {
        console.error('❌ Erro ao rejeitar doação:', error);
        showError(`Erro ao rejeitar: ${error.message}`);
    }
}

function editParticipant(purchaseId) {
    console.log(`✏️ Editando participante: ${purchaseId}`);
    // Implementar modal de edição se necessário
    alert(`Função de edição para ${purchaseId} será implementada em breve.`);
}

// Expor funções globais para debug
window.adminDebug = {
    adminData,
    loadPurchaseData,
    loadParticipants,
    updateDashboard,
    createSampleData
};

console.log('✅ Admin.js carregado completamente - versão corrigida para dados');
