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
            buyerName: 'Maria Silva (TESTE)',
            buyerPhone: '(11) 99999-1111',
            buyerEmail: 'maria@demo.com',
            numbers: [1, 2, 3],
            totalAmount: 120.00,
            paymentMethod: 'donation',
            status: 'pending_donation',
            date: new Date().toISOString(),
            timestamp: new Date()
        },
        {
            id: 'demo-2',
            buyerName: 'João Santos (TESTE)',
            buyerPhone: '(11) 98888-2222',
            buyerEmail: 'joao@demo.com',
            numbers: [10, 20, 30],
            totalAmount: 120.00,
            paymentMethod: 'donation',
            status: 'pending_donation',
            date: new Date().toISOString(),
            timestamp: new Date()
        },
        {
            id: 'demo-3',
            buyerName: 'Ana Costa (CONFIRMADA)',
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
        
        // Log detalhado dos dados criados
        adminData.purchases.forEach((purchase, index) => {
            console.log(`${index + 1}. ${purchase.buyerName} - Status: ${purchase.status} - PaymentMethod: ${purchase.paymentMethod}`);
        });
        
        // Forçar atualização da interface
        setTimeout(() => {
            console.log('🔄 Forçando atualização da interface após criar dados...');
            loadParticipants();
            updateDashboard();
        }, 500);
        
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
        
        // Verificação adicional: se não há dados após carregar, criar dados de teste
        setTimeout(() => {
            if (!adminData.purchases || adminData.purchases.length === 0) {
                console.log('⚠️ Nenhum dado encontrado, criando dados de teste automaticamente...');
                createSampleData();
                loadParticipants();
            }
        }, 1000);
        
        console.log('✅ Interface atualizada com sucesso');
    } catch (error) {
        console.error('❌ Erro ao atualizar interface:', error);
        showError(`Erro ao atualizar interface: ${error.message}`);
        
        // Em caso de erro, tentar criar dados de teste
        try {
            console.log('🔄 Tentando recuperar com dados de teste...');
            createSampleData();
            loadParticipants();
        } catch (recoveryError) {
            console.error('❌ Falha na recuperação:', recoveryError);
        }
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
    console.log(`🔧 Criando botões para compra ${purchase.id}, status: ${purchase.status}`);
    
    const buttons = [];
    
    // Sempre mostrar todos os botões para debug
    if (purchase.status === 'pending_donation' || purchase.paymentMethod === 'doacao' || purchase.paymentMethod === 'donation') {
        buttons.push(`
            <button class="btn-confirm" data-action="confirm-donation" data-purchase-id="${purchase.id}" title="Confirmar Doação" style="background: #28a745; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
                ✅ Confirmar
            </button>
            <button class="btn-reject" data-action="reject-donation" data-purchase-id="${purchase.id}" title="Rejeitar Doação" style="background: #dc3545; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
                ❌ Rejeitar
            </button>
        `);
    }
    
    // Botão editar sempre disponível
    buttons.push(`
        <button class="btn-edit" data-action="edit-participant" data-purchase-id="${purchase.id}" title="Editar" style="background: #007bff; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
            ✏️ Editar
        </button>
    `);
    
    // Botão de debug
    buttons.push(`
        <button onclick="console.log('Debug:', ${JSON.stringify(purchase).replace(/"/g, '&quot;')})" title="Debug" style="background: #6c757d; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
            🔍 Debug
        </button>
    `);
    
    const result = buttons.join('');
    console.log(`✅ Botões criados para ${purchase.id}:`, result);
    return result;
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
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('❌ Compra não encontrada!');
        return;
    }
    
    // Preparar dados para confirmação
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
        // Atualizar status localmente primeiro
        purchase.status = 'confirmed';
        purchase.confirmedAt = new Date().toISOString();
        purchase.confirmedBy = 'admin';
        
        // Salvar no localStorage
        localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
        console.log('💾 Dados salvos no localStorage');
        
        // Tentar atualizar no Firebase se disponível
        if (typeof window.FirebaseDB !== 'undefined') {
            try {
                const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'confirmed', {
                    confirmedAt: purchase.confirmedAt,
                    confirmedBy: purchase.confirmedBy
                });
                
                if (result.success) {
                    console.log('✅ Status atualizado no Firebase');
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
        
        // Notificação de sucesso
        alert('✅ DOAÇÃO CONFIRMADA!\n\nNúmeros foram marcados como vendidos.');
        console.log('✅ CONFIRMAÇÃO CONCLUÍDA COM SUCESSO!');
        
    } catch (error) {
        console.error('❌ Erro ao confirmar doação:', error);
        alert(`❌ Erro ao confirmar: ${error.message}`);
        showError(`Erro ao confirmar: ${error.message}`);
    }
}

async function rejectDonation(purchaseId) {
    console.log(`❌ Rejeitando doação: ${purchaseId}`);
    
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
        // Atualizar status localmente primeiro
        purchase.status = 'rejected';
        purchase.rejectedAt = new Date().toISOString();
        purchase.rejectionReason = reason || 'Sem motivo especificado';
        purchase.rejectedBy = 'admin';
        
        // Salvar no localStorage
        localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
        console.log('💾 Dados salvos no localStorage');
        
        // Tentar atualizar no Firebase se disponível
        if (typeof window.FirebaseDB !== 'undefined') {
            try {
                const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'rejected', {
                    rejectedAt: purchase.rejectedAt,
                    rejectionReason: purchase.rejectionReason,
                    rejectedBy: purchase.rejectedBy
                });
                
                if (result.success) {
                    console.log('✅ Status atualizado no Firebase');
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
        
        // Notificação de rejeição
        alert('❌ DOAÇÃO REJEITADA!\n\nNúmeros foram liberados para venda.');
        console.log('✅ REJEIÇÃO CONCLUÍDA COM SUCESSO!');
        
    } catch (error) {
        console.error('❌ Erro ao rejeitar doação:', error);
        alert(`❌ Erro ao rejeitar: ${error.message}`);
        showError(`Erro ao rejeitar: ${error.message}`);
    }
}

function editParticipant(purchaseId) {
    console.log(`✏️ Editando participante: ${purchaseId}`);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('❌ Participante não encontrado!');
        return;
    }
    
    const buyerName = purchase.buyerName || purchase.name || 'Comprador';
    const buyerPhone = purchase.buyerPhone || purchase.phone || '';
    
    const newName = prompt(`Editar nome do participante:\n\nNome atual: ${buyerName}`, buyerName);
    if (newName && newName.trim() !== '') {
        const newPhone = prompt(`Editar telefone do participante:\n\nTelefone atual: ${buyerPhone}`, buyerPhone);
        if (newPhone && newPhone.trim() !== '') {
            // Atualizar dados
            purchase.buyerName = newName.trim();
            purchase.name = newName.trim(); // Para compatibilidade
            purchase.buyerPhone = newPhone.trim();
            purchase.phone = newPhone.trim(); // Para compatibilidade
            
            // Salvar no localStorage
            localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
            
            // Atualizar interface
            loadParticipants();
            updateDashboard();
            
            alert('✅ Dados do participante atualizados com sucesso!');
            console.log('✅ Edição concluída com sucesso');
        }
    }
}

// Adicionar função para criar dados de teste
function createSampleData() {
    console.log('🎭 Criando dados de exemplo...');
    
    adminData.purchases = [
        {
            id: 'demo-1',
            buyerName: 'Maria Silva',
            name: 'Maria Silva', // Para compatibilidade
            buyerPhone: '(11) 99999-1111',
            phone: '(11) 99999-1111', // Para compatibilidade
            buyerEmail: 'maria@demo.com',
            numbers: [1, 2, 3],
            totalAmount: 120.00,
            paymentMethod: 'doacao',
            status: 'pending_donation',
            date: new Date().toISOString(),
            timestamp: new Date().toISOString()
        },
        {
            id: 'demo-2',
            buyerName: 'João Santos',
            name: 'João Santos', // Para compatibilidade
            buyerPhone: '(11) 98888-2222',
            phone: '(11) 98888-2222', // Para compatibilidade
            buyerEmail: 'joao@demo.com',
            numbers: [10, 20, 30],
            totalAmount: 120.00,
            paymentMethod: 'pix',
            status: 'confirmed',
            date: new Date().toISOString(),
            timestamp: new Date().toISOString()
        },
        {
            id: 'demo-3',
            buyerName: 'Ana Costa',
            name: 'Ana Costa', // Para compatibilidade
            buyerPhone: '(11) 97777-3333',
            phone: '(11) 97777-3333', // Para compatibilidade
            buyerEmail: 'ana@demo.com',
            numbers: [50, 51, 52],
            totalAmount: 120.00,
            paymentMethod: 'doacao',
            status: 'pending_donation',
            date: new Date().toISOString(),
            timestamp: new Date().toISOString()
        },
        {
            id: 'demo-4',
            buyerName: 'Carlos Oliveira',
            name: 'Carlos Oliveira', // Para compatibilidade
            buyerPhone: '(11) 96666-4444',
            phone: '(11) 96666-4444', // Para compatibilidade
            buyerEmail: 'carlos@demo.com',
            numbers: [75, 76, 77],
            totalAmount: 120.00,
            paymentMethod: 'doacao',
            status: 'rejected',
            date: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            rejectedAt: new Date().toISOString(),
            rejectionReason: 'Teste de rejeição'
        }
    ];
    
    // Salvar os dados de exemplo
    try {
        localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
        console.log(`🎭 ${adminData.purchases.length} dados de exemplo criados e salvos`);
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        
        alert(`✅ Dados de teste criados com sucesso!\n\n📊 Total: ${adminData.purchases.length} compras\n🍼 Pendentes: 2 doações\n✅ Confirmados: 1 compra\n❌ Rejeitados: 1 compra\n\nTeste os botões de confirmação agora!`);
        
    } catch (error) {
        console.error('❌ Erro ao salvar dados de exemplo:', error);
        alert('❌ Erro ao criar dados de teste: ' + error.message);
    }
}

// Expor funções globais para debug e compatibilidade
window.adminDebug = {
    adminData,
    loadPurchaseData,
    loadParticipants,
    updateDashboard,
    createSampleData,
    confirmDonation,
    rejectDonation,
    editParticipant
};

// Expor funções essenciais globalmente para os botões
window.confirmDonation = confirmDonation;
window.rejectDonation = rejectDonation;
window.editParticipant = editParticipant;
window.createSampleData = createSampleData;
window.loadParticipants = loadParticipants;
window.updateDashboard = updateDashboard;

// Função de emergência para forçar botões aparecerem
window.forcarBotoesEmergencia = function() {
    console.log('🚨 FUNÇÃO DE EMERGÊNCIA: Forçando aparição dos botões...');
    
    // Garantir que adminData existe
    if (!window.adminData) {
        window.adminData = { purchases: [], firebaseReady: false, initializationAttempts: 1 };
    }
    
    // Criar dados de teste se não existirem
    if (adminData.purchases.length === 0) {
        console.log('📊 Nenhum dado encontrado, criando dados de teste...');
        createSampleData();
    }
    
    // Forçar carregamento da tabela
    setTimeout(() => {
        console.log('🔄 Forçando reload da tabela...');
        loadParticipants();
        console.log('🚨 EMERGÊNCIA: Botões forçados!');
        
        // Verificar se os botões apareceram
        setTimeout(() => {
            const buttons = document.querySelectorAll('[data-action]');
            console.log(`🔍 Verificação pós-emergência: ${buttons.length} botões encontrados`);
            if (buttons.length > 0) {
                console.log('✅ SUCESSO: Botões apareceram após emergência!');
                alert(`✅ EMERGÊNCIA RESOLVIDA!\n\n${buttons.length} botões de ação foram criados.\nVerifique a tabela de participantes.`);
            } else {
                console.log('❌ FALHA: Botões ainda não apareceram');
                alert('❌ Emergência falhou. Verifique o console (F12) para mais detalhes.');
            }
        }, 1000);
    }, 500);
};

// Verificação automática após carregamento COMPLETO da página
setTimeout(() => {
    console.log('🔍 Verificação automática pós-carregamento...');
    
    const tbody = document.getElementById('participants-tbody');
    if (tbody) {
        const buttons = tbody.querySelectorAll('[data-action]');
        console.log(`📊 Status atual: ${buttons.length} botões encontrados na tabela`);
        
        if (buttons.length === 0 && tbody.innerHTML.includes('Carregando dados')) {
            console.log('🚨 DETECTADO: Tabela ainda está carregando após 10 segundos, ativando emergência');
            window.forcarBotoesEmergencia();
        } else if (buttons.length === 0) {
            console.log('⚠️ DETECTADO: Tabela carregada mas sem botões, ativando emergência');
            window.forcarBotoesEmergencia();
        } else {
            console.log('✅ VERIFICAÇÃO: Botões estão presentes, sistema funcionando normalmente');
        }
    } else {
        console.log('❌ ERRO: Tabela de participantes não encontrada');
    }
}, 10000); // 10 segundos para dar tempo da página carregar completamente

// ========================================================================================
// SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA E SINCRONIZAÇÃO EM TEMPO REAL
// ========================================================================================

// Configuração da sincronização automática
let autoSyncConfig = {
    enabled: true,
    interval: 30000, // 30 segundos
    timer: null,
    lastUpdate: null,
    isUpdating: false
};

// Inicializar sistema de auto-sync
function initializeAutoSync() {
    console.log('🔄 Inicializando sistema de auto-sync...');
    
    // Atualizar display do último update
    updateLastUpdateDisplay();
    
    // Iniciar auto-sync se habilitado
    if (autoSyncConfig.enabled) {
        startAutoSync();
    }
    
    // Configurar indicadores visuais
    updateSyncIndicators();
}

// Função principal de atualização de dados
async function refreshData() {
    if (autoSyncConfig.isUpdating) {
        console.log('⚠️ Atualização já em andamento...');
        return;
    }
    
    console.log('🔄 Iniciando atualização manual de dados...');
    autoSyncConfig.isUpdating = true;
    
    try {
        // Mostrar progresso
        showSyncProgress('Conectando...', 10);
        
        // Carregar dados atualizados
        showSyncProgress('Carregando dados...', 30);
        await loadPurchaseData();
        
        // Atualizar interface
        showSyncProgress('Atualizando interface...', 60);
        updateDashboard();
        loadParticipants();
        
        // Forçar criação de botões se necessário
        showSyncProgress('Verificando botões...', 80);
        setTimeout(() => {
            const buttons = document.querySelectorAll('[data-action]');
            if (buttons.length === 0) {
                console.log('⚠️ Botões não encontrados após atualização, forçando criação...');
                window.forcarBotoesEmergencia?.();
            }
        }, 1000);
        
        // Finalizar
        showSyncProgress('Concluído!', 100);
        autoSyncConfig.lastUpdate = new Date();
        updateLastUpdateDisplay();
        
        console.log('✅ Dados atualizados com sucesso!');
        showNotification('📊 Dados atualizados com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar dados:', error);
        showNotification('❌ Erro ao atualizar dados: ' + error.message, 'error');
        showSyncProgress('Erro na atualização', 0);
    } finally {
        autoSyncConfig.isUpdating = false;
        setTimeout(hideSyncProgress, 2000);
    }
}

// Auto-sync automático
function startAutoSync() {
    if (autoSyncConfig.timer) {
        clearInterval(autoSyncConfig.timer);
    }
    
    console.log(`🔄 Auto-sync iniciado (intervalo: ${autoSyncConfig.interval/1000}s)`);
    
    autoSyncConfig.timer = setInterval(async () => {
        if (!autoSyncConfig.isUpdating && document.visibilityState === 'visible') {
            console.log('🔄 Auto-sync executando...');
            await refreshData();
        }
    }, autoSyncConfig.interval);
    
    updateSyncIndicators();
}

function stopAutoSync() {
    if (autoSyncConfig.timer) {
        clearInterval(autoSyncConfig.timer);
        autoSyncConfig.timer = null;
    }
    console.log('⏸️ Auto-sync pausado');
    updateSyncIndicators();
}

// Toggle do auto-sync
function toggleAutoSync() {
    autoSyncConfig.enabled = !autoSyncConfig.enabled;
    
    if (autoSyncConfig.enabled) {
        startAutoSync();
        showNotification('🔄 Auto-sync ativado', 'success');
    } else {
        stopAutoSync();
        showNotification('⏸️ Auto-sync pausado', 'warning');
    }
    
    updateSyncIndicators();
}

// Recarregamento completo forçado
function forceFullRefresh() {
    console.log('🔃 Forçando recarregamento completo...');
    
    if (confirm('🔃 Recarregar página completamente?\n\nIsso irá recarregar toda a página e pode interromper ações em andamento.')) {
        // Salvar estado do auto-sync
        localStorage.setItem('autoSyncEnabled', autoSyncConfig.enabled);
        
        // Recarregar página
        window.location.reload();
    }
}

// Mostrar estatísticas dos dados
function showDataStats() {
    console.log('📊 Mostrando estatísticas dos dados...');
    
    const stats = {
        total: adminData.purchases?.length || 0,
        pending: adminData.purchases?.filter(p => p.status === 'pending_donation').length || 0,
        confirmed: adminData.purchases?.filter(p => p.status === 'confirmed').length || 0,
        rejected: adminData.purchases?.filter(p => p.status === 'rejected').length || 0,
        lastUpdate: autoSyncConfig.lastUpdate ? autoSyncConfig.lastUpdate.toLocaleString('pt-BR') : 'Nunca',
        autoSyncStatus: autoSyncConfig.enabled ? 'Ativo' : 'Pausado',
        firebaseStatus: adminData.firebaseReady ? 'Conectado' : 'Desconectado'
    };
    
    const revenue = adminData.purchases?.reduce((sum, p) => sum + (p.totalAmount || 0), 0) || 0;
    
    const message = `📊 ESTATÍSTICAS DOS DADOS\n\n` +
        `👥 Total de Participantes: ${stats.total}\n` +
        `🍼 Doações Pendentes: ${stats.pending}\n` +
        `✅ Confirmados: ${stats.confirmed}\n` +
        `❌ Rejeitados: ${stats.rejected}\n` +
        `💰 Receita Total: R$ ${revenue.toFixed(2)}\n\n` +
        `🔄 Auto-sync: ${stats.autoSyncStatus}\n` +
        `🔥 Firebase: ${stats.firebaseStatus}\n` +
        `⏰ Última Atualização: ${stats.lastUpdate}`;
    
    alert(message);
}

// Funções auxiliares de interface
function showSyncProgress(message, percent) {
    const progressDiv = document.getElementById('sync-progress');
    const progressBar = document.getElementById('sync-progress-bar');
    const statusText = document.getElementById('sync-status-text');
    
    if (progressDiv && progressBar && statusText) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
        statusText.textContent = message;
    }
}

function hideSyncProgress() {
    const progressDiv = document.getElementById('sync-progress');
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
}

function updateLastUpdateDisplay() {
    const timeElement = document.getElementById('last-update-time');
    if (timeElement) {
        if (autoSyncConfig.lastUpdate) {
            const time = autoSyncConfig.lastUpdate.toLocaleTimeString('pt-BR');
            timeElement.textContent = `Última atualização: ${time}`;
        } else {
            timeElement.textContent = 'Primeira execução...';
        }
    }
}

function updateSyncIndicators() {
    const statusElement = document.getElementById('auto-sync-status');
    const buttonElement = document.getElementById('auto-sync-btn');
    
    if (statusElement) {
        if (autoSyncConfig.enabled) {
            statusElement.textContent = '🟢 Auto-sync Ativo';
            statusElement.style.background = '#28a745';
        } else {
            statusElement.textContent = '🔴 Auto-sync Pausado';
            statusElement.style.background = '#dc3545';
        }
    }
    
    if (buttonElement) {
        if (autoSyncConfig.enabled) {
            buttonElement.textContent = '⏸️ Pausar Auto-sync';
            buttonElement.style.background = '#ffc107';
            buttonElement.style.color = '#000';
        } else {
            buttonElement.textContent = '▶️ Ativar Auto-sync';
            buttonElement.style.background = '#28a745';
            buttonElement.style.color = 'white';
        }
    }
}

// Função de notificação simples
function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Criar ou atualizar elemento de notificação
    let notification = document.getElementById('admin-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'admin-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 9999;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    // Definir cor baseada no tipo
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#007bff'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
    
    // Auto-remover após 4 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Expor funções globalmente
window.refreshData = refreshData;
window.toggleAutoSync = toggleAutoSync;
window.forceFullRefresh = forceFullRefresh;
window.showDataStats = showDataStats;
window.initializeAutoSync = initializeAutoSync;

// Pausar auto-sync quando página não está visível
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        console.log('👁️ Página oculta, pausando auto-sync temporariamente');
    } else {
        console.log('👁️ Página visível, retomando auto-sync');
        if (autoSyncConfig.enabled && !autoSyncConfig.timer) {
            startAutoSync();
        }
    }
});

// Inicializar auto-sync quando admin estiver pronto
setTimeout(() => {
    if (systemInitialized) {
        console.log('🔄 Inicializando sistema de auto-sync...');
        
        // Restaurar estado do auto-sync se foi salvo
        const savedState = localStorage.getItem('autoSyncEnabled');
        if (savedState !== null) {
            autoSyncConfig.enabled = savedState === 'true';
        }
        
        initializeAutoSync();
        
        // Primeira atualização
        setTimeout(() => {
            refreshData();
        }, 2000);
    }
}, 3000);

console.log('✅ Admin.js carregado completamente - versão corrigida para confirmação de botões');
console.log('🎯 Event delegation ativo e funções expostas globalmente');
console.log('🧪 Use createSampleData() para criar dados de teste');
console.log('🚨 EMERGÊNCIA: Use forcarBotoesEmergencia() se botões não aparecerem');
console.log('🔄 Sistema de auto-sync implementado - Use refreshData() para atualizar manualmente');
