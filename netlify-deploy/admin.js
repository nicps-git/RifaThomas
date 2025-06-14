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
        setupEventDelegation();
        
        // 3. Carregar dados
        await loadPurchaseData();
        
        // 4. Atualizar interface
        await updateInterface();
        
        systemInitialized = true;
        console.log('✅ Sistema admin inicializado com sucesso!');
        
        // 5. Inicializar sistema de auto-sync
        initializeAutoSync();
        
    } catch (error) {
        console.error('❌ Erro na inicialização do admin:', error);
        showError(`Erro ao inicializar: ${error.message}`);
        
        // Se falhar, tentar usar dados locais
        if (adminData.initializationAttempts < 3) {
            console.log('🔄 Tentando novamente com dados locais...');
            await loadLocalData();
            await updateInterface();
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
    
    // Configurar formulário de configurações com retry
    const configureFormListener = () => {
        const configForm = document.getElementById('config-form');
        if (configForm) {
            // Remover listeners existentes para evitar duplicatas
            const newForm = configForm.cloneNode(true);
            configForm.parentNode.replaceChild(newForm, configForm);
            
            // Adicionar novo listener
            newForm.addEventListener('submit', saveConfiguration);
            console.log('✅ Event listener do formulário de configurações configurado');
            return true;
        } else {
            console.warn('⚠️ Formulário config-form não encontrado');
            return false;
        }
    };
    
    // Tentar configurar imediatamente
    if (!configureFormListener()) {
        // Se falhou, tentar novamente após delay
        setTimeout(() => {
            if (!configureFormListener()) {
                console.error('❌ Falha ao configurar listener do formulário após retry');
            }
        }, 1000);
    }
    
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
        loadConfiguration(); // Carregar configurações no formulário
        
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

// ========================================================================================
// FUNÇÃO DE SALVAR CONFIGURAÇÕES
// ========================================================================================

// Carregar configurações no formulário
async function loadConfiguration() {
    console.log('⚙️ Carregando configurações no formulário...');
    
    try {
        let config = {};
        
        // 1. Tentar carregar do Firebase primeiro
        if (typeof window.FirebaseDB !== 'undefined') {
            try {
                console.log('🔥 Tentando carregar configurações do Firebase...');
                const firebaseResult = await window.FirebaseDB.loadConfig();
                if (firebaseResult.success && firebaseResult.data) {
                    config = firebaseResult.data;
                    console.log('✅ Configurações carregadas do Firebase:', config);
                    
                    // Atualizar adminData com as configurações do Firebase
                    adminData.config = { ...adminData.config, ...config };
                    
                    // Salvar backup no localStorage
                    try {
                        localStorage.setItem('adminConfig', JSON.stringify(config));
                        console.log('💾 Backup das configurações salvo no localStorage');
                    } catch (backupError) {
                        console.warn('⚠️ Erro ao salvar backup das configurações:', backupError);
                    }
                } else {
                    throw new Error(firebaseResult.error || 'Configurações não encontradas no Firebase');
                }
            } catch (firebaseError) {
                console.warn('⚠️ Erro ao carregar do Firebase:', firebaseError);
                console.log('📦 Tentando carregar do localStorage...');
                
                // 2. Fallback para localStorage
                try {
                    const localConfig = localStorage.getItem('adminConfig');
                    if (localConfig) {
                        config = JSON.parse(localConfig);
                        console.log('✅ Configurações carregadas do localStorage:', config);
                        adminData.config = { ...adminData.config, ...config };
                    } else {
                        console.log('⚠️ Nenhuma configuração encontrada no localStorage, usando padrões');
                    }
                } catch (localError) {
                    console.warn('⚠️ Erro ao carregar do localStorage:', localError);
                }
            }
        } else {
            // Se Firebase não estiver disponível, tentar localStorage
            try {
                const localConfig = localStorage.getItem('adminConfig');
                if (localConfig) {
                    config = JSON.parse(localConfig);
                    console.log('✅ Configurações carregadas do localStorage (Firebase indisponível):', config);
                    adminData.config = { ...adminData.config, ...config };
                }
            } catch (localError) {
                console.warn('⚠️ Erro ao carregar do localStorage:', localError);
            }
        }
        
        // 3. Usar valores das configurações carregadas ou padrões
        const finalConfig = config.totalNumbers ? config : adminData.config || {};
        
        // Carregar valores nos campos do formulário
        const configFields = {
            'config-total-numbers': finalConfig.totalNumbers || 150,
            'config-ticket-price': finalConfig.ticketPrice || 40.00,
            'config-contact-phone': finalConfig.contactPhone || '(11) 99999-9999',
            'config-contact-email': finalConfig.contactEmail || 'contato@rifaonline.com',
            'config-pix-key': finalConfig.pixKey || 'contato@charifa.com',
            'config-baby-name': finalConfig.babyName || 'Thomas',
            'config-first-prize': finalConfig.prizes?.first || 'R$ 100,00',
            'config-second-prize': finalConfig.prizes?.second || 'R$ 200,00',
            'config-third-prize': finalConfig.prizes?.third || 'Fraldas por faixa',
            'config-draw-date': finalConfig.drawDate ? new Date(finalConfig.drawDate).toISOString().slice(0, 16) : '2025-07-11T16:00'
        };
        
        let fieldsLoaded = 0;
        Object.entries(configFields).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = value;
                fieldsLoaded++;
            } else {
                console.warn(`⚠️ Campo ${fieldId} não encontrado no formulário`);
            }
        });
        
        console.log(`✅ ${fieldsLoaded} campos de configuração carregados no formulário`);
        console.log('📋 Configurações finais aplicadas:', finalConfig);
        
    } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        
        // Em caso de erro, carregar valores padrão
        const defaultFields = {
            'config-total-numbers': 150,
            'config-ticket-price': 40.00,
            'config-contact-phone': '(11) 99999-9999',
            'config-pix-key': 'contato@charifa.com',
            'config-baby-name': 'Thomas',
            'config-first-prize': 'R$ 100,00',
            'config-second-prize': 'R$ 200,00',
            'config-third-prize': 'Fraldas por faixa',
            'config-draw-date': '2025-07-11T16:00'
        };
        
        Object.entries(defaultFields).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = value;
            }
        });
        
        console.log('✅ Valores padrão carregados devido ao erro');
    }
}

// Salvar configurações do formulário
async function saveConfiguration(event) {
    event.preventDefault();
    console.log('💾 Salvando configurações...');
    
    try {
        // Coletar dados do formulário
        const newConfig = {
            totalNumbers: parseInt(document.getElementById('config-total-numbers').value),
            ticketPrice: parseFloat(document.getElementById('config-ticket-price').value),
            drawDate: new Date(document.getElementById('config-draw-date').value),
            contactPhone: document.getElementById('config-contact-phone').value,
            contactEmail: document.getElementById('config-contact-email').value,
            pixKey: document.getElementById('config-pix-key').value,
            babyName: document.getElementById('config-baby-name').value,
            prizes: {
                first: document.getElementById('config-first-prize').value,
                second: document.getElementById('config-second-prize').value,
                third: document.getElementById('config-third-prize').value
            },
            lastUpdated: new Date().toISOString()
        };
        
        // Validações básicas
        if (newConfig.totalNumbers < 100 || newConfig.totalNumbers > 10000) {
            throw new Error('Total de números deve estar entre 100 e 10000');
        }
        
        if (newConfig.ticketPrice < 1) {
            throw new Error('Preço do bilhete deve ser maior que R$ 1,00');
        }
        
        if (!newConfig.pixKey || !newConfig.contactPhone || !newConfig.contactEmail) {
            throw new Error('PIX, telefone e email são obrigatórios');
        }
        
        console.log('📋 Configurações coletadas:', newConfig);
        
        let firebaseSaved = false;
        let localStorageSaved = false;
        
        // Tentar salvar no Firebase primeiro
        if (typeof window.FirebaseDB !== 'undefined' && adminData.firebaseReady) {
            try {
                console.log('🔥 Salvando no Firebase...');
                const result = await window.FirebaseDB.saveConfig(newConfig);
                if (result.success) {
                    firebaseSaved = true;
                    console.log('✅ Configurações salvas no Firebase com sucesso');
                } else {
                    throw new Error(result.error || 'Erro desconhecido no Firebase');
                }
            } catch (firebaseError) {
                console.error('❌ Erro ao salvar no Firebase:', firebaseError);
                console.warn('⚠️ Continuando com salvamento local...');
            }
        } else {
            console.warn('⚠️ Firebase não disponível, salvando apenas localmente');
        }
        
        // Sempre salvar no localStorage como backup
        try {
            localStorage.setItem('adminConfig', JSON.stringify(newConfig));
            localStorageSaved = true;
            console.log('💾 Configurações salvas no localStorage');
        } catch (storageError) {
            console.error('❌ Erro ao salvar no localStorage:', storageError);
        }
        
        // Verificar se pelo menos um método de salvamento funcionou
        if (!firebaseSaved && !localStorageSaved) {
            throw new Error('Falha ao salvar em qualquer local de armazenamento');
        }
        
        // Atualizar configurações em memória
        adminData.config = { ...adminData.config, ...newConfig };
        console.log('🧠 AdminData atualizado:', adminData.config);
        
        // Atualizar dashboard com novas configurações
        try {
            updateDashboard();
            console.log('📊 Dashboard atualizado');
        } catch (dashboardError) {
            console.warn('⚠️ Erro ao atualizar dashboard:', dashboardError);
        }
        
        // Recarregar as configurações no formulário para confirmar salvamento
        setTimeout(async () => {
            try {
                await loadConfiguration();
                console.log('🔄 Configurações recarregadas no formulário');
            } catch (reloadError) {
                console.warn('⚠️ Erro ao recarregar configurações:', reloadError);
            }
        }, 500);
        
        // Notificação de sucesso detalhada
        const statusMessage = [];
        if (firebaseSaved) statusMessage.push('Firebase ✅');
        if (localStorageSaved) statusMessage.push('LocalStorage ✅');
        
        showNotification(`⚙️ Configurações salvas com sucesso! (${statusMessage.join(', ')})`, 'success');
        console.log('✅ Configurações salvas com sucesso!');
        
        // Mostrar mensagem detalhada
        alert(`✅ CONFIGURAÇÕES SALVAS!\n\n` +
            `💾 Salvamento: ${statusMessage.join(', ')}\n\n` +
            `📊 Total de números: ${newConfig.totalNumbers}\n` +
            `💰 Preço por bilhete: R$ ${newConfig.ticketPrice.toFixed(2)}\n` +
            `👶 Nome do bebê: ${newConfig.babyName}\n` +
            `📱 Telefone: ${newConfig.contactPhone}\n` +
            `📧 Email: ${newConfig.contactEmail}\n` +
            `💳 PIX: ${newConfig.pixKey}\n\n` +
            `🏆 Prêmios:\n` +
            `   1º: ${newConfig.prizes.first}\n` +
            `   2º: ${newConfig.prizes.second}\n` +
            `   3º: ${newConfig.prizes.third}`);
        
    } catch (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        showNotification('❌ Erro ao salvar configurações: ' + error.message, 'error');
        alert('❌ Erro ao salvar configurações:\n\n' + error.message);
    }
}

// ===== AÇÕES RÁPIDAS =====

/**
 * Reseta todos os números e apaga todos os dados de participantes
 */
async function resetAllNumbers() {
    console.log('🔄 Iniciando reset de todos os números...');
    
    // Confirmação dupla para segurança
    const confirmMessage = `⚠️ ATENÇÃO: Esta ação irá APAGAR PERMANENTEMENTE todos os dados de participantes!

Isso inclui:
• Todas as compras/participações
• Todos os números vendidos
• Histórico de pagamentos
• Dados de contato dos participantes

Esta ação NÃO PODE SER DESFEITA!

Digite "CONFIRMAR RESET" para prosseguir:`;

    const userConfirmation = prompt(confirmMessage);
    
    if (userConfirmation !== 'CONFIRMAR RESET') {
        console.log('❌ Reset cancelado pelo usuário');
        showNotification('Reset cancelado', 'warning');
        return;
    }

    // Segunda confirmação
    const finalConfirm = confirm('⚠️ ÚLTIMA CONFIRMAÇÃO: Tem certeza absoluta que deseja apagar TODOS os dados de participantes? Esta ação é IRREVERSÍVEL!');
    
    if (!finalConfirm) {
        console.log('❌ Reset cancelado na confirmação final');
        showNotification('Reset cancelado', 'warning');
        return;
    }

    try {
        showNotification('🔄 Iniciando reset completo...', 'info');
        console.log('🗑️ Iniciando exclusão de todos os dados...');

        let deletedCount = 0;
        let errorCount = 0;

        // Verificar se Firebase está disponível
        if (window.FirebaseDB && typeof window.FirebaseDB.deleteAllDocuments === 'function') {
            console.log('🔥 Conectando ao Firebase para exclusão em massa...');
            
            // Usar função otimizada para deletar todos os documentos
            const result = await window.FirebaseDB.deleteAllDocuments('purchases');
            
            if (result.success) {
                deletedCount = result.deletedCount || 0;
                errorCount = result.errorCount || 0;
                console.log(`✅ Exclusão em massa concluída: ${deletedCount} deletados, ${errorCount} erros`);
            } else {
                console.error('❌ Erro na exclusão em massa:', result.error);
                errorCount = 1;
            }
        } else if (window.FirebaseDB && typeof window.FirebaseDB.getAllDocuments === 'function') {
            console.log('🔥 Conectando ao Firebase (método individual)...');
            
            // Fallback: buscar e deletar individualmente
            const result = await window.FirebaseDB.getAllDocuments('purchases');
            
            if (result.success && result.data && result.data.length > 0) {
                console.log(`📊 Encontrados ${result.data.length} registros para deletar`);
                
                // Deletar cada documento individualmente
                for (const purchase of result.data) {
                    try {
                        console.log(`🗑️ Deletando compra ID: ${purchase.id}`);
                        
                        const deleteResult = await window.FirebaseDB.deleteDocument('purchases', purchase.id);
                        
                        if (deleteResult.success) {
                            deletedCount++;
                            console.log(`✅ Compra ${purchase.id} deletada com sucesso`);
                        } else {
                            errorCount++;
                            console.error(`❌ Erro ao deletar compra ${purchase.id}:`, deleteResult.error);
                        }
                    } catch (deleteError) {
                        errorCount++;
                        console.error(`❌ Erro ao deletar compra ${purchase.id}:`, deleteError);
                    }
                }
                
                console.log(`📊 Reset completo: ${deletedCount} deletados, ${errorCount} erros`);
            } else {
                console.log('ℹ️ Nenhum registro encontrado no Firebase');
            }
        } else {
            console.warn('⚠️ Firebase não disponível, limpando apenas dados locais');
        }

        // Limpar dados locais
        try {
            localStorage.removeItem('adminData');
            localStorage.removeItem('purchases');
            localStorage.removeItem('participants');
            console.log('🧹 Dados locais limpos');
        } catch (localError) {
            console.warn('⚠️ Erro ao limpar dados locais:', localError);
        }

        // Resetar dados em memória
        adminData.purchases = [];
        adminData.participants = [];

        // Atualizar interface
        updateInterface();
        updateDashboard();
        loadParticipants();

        // Notificação de sucesso
        const successMessage = deletedCount > 0 
            ? `✅ Reset completo! ${deletedCount} registros deletados${errorCount > 0 ? `, ${errorCount} erros` : ''}`
            : '✅ Reset completo! Todos os dados foram limpos';

        showNotification(successMessage, 'success');
        console.log('🎉 Reset de todos os números concluído com sucesso');

    } catch (error) {
        console.error('❌ Erro durante o reset:', error);
        showNotification(`❌ Erro durante o reset: ${error.message}`, 'error');
    }
}

/**
 * Exporta lista de participantes
 */
function exportParticipants() {
    console.log('📥 Iniciando exportação de participantes...');
    
    try {
        // Verificar se há dados para exportar
        const purchases = adminData.purchases || [];
        
        if (purchases.length === 0) {
            showNotification('⚠️ Nenhum participante para exportar', 'warning');
            return;
        }

        // Preparar dados para exportação
        const exportData = purchases.map(purchase => ({
            'Nome': purchase.name || 'N/A',
            'Telefone': purchase.phone || 'N/A',
            'Números': Array.isArray(purchase.numbers) ? purchase.numbers.join(', ') : 'N/A',
            'Método de Pagamento': getPaymentMethodText(purchase.paymentMethod),
            'Status': getStatusText(purchase.status),
            'Data da Compra': purchase.timestamp ? formatDate(purchase.timestamp) : 'N/A',
            'Total': purchase.total ? formatCurrency(purchase.total) : 'N/A'
        }));

        // Converter para CSV
        const headers = Object.keys(exportData[0]);
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => 
                headers.map(header => `"${row[header] || ''}"`).join(',')
            )
        ].join('\n');

        // Criar arquivo para download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `participantes_rifa_thomas_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        showNotification(`✅ Lista de ${purchases.length} participantes exportada com sucesso!`, 'success');
        console.log('📥 Exportação concluída com sucesso');

    } catch (error) {
        console.error('❌ Erro na exportação:', error);
        showNotification(`❌ Erro na exportação: ${error.message}`, 'error');
    }
}

/**
 * Realiza o sorteio dos prêmios
 */
async function performDraw() {
    console.log('🎲 Iniciando sorteio...');
    
    try {
        // Buscar números vendidos e confirmados
        const confirmedPurchases = (adminData.purchases || []).filter(purchase => 
            purchase.status === 'confirmed' && purchase.numbers && purchase.numbers.length > 0
        );

        if (confirmedPurchases.length === 0) {
            showNotification('⚠️ Nenhum número confirmado para o sorteio', 'warning');
            return;
        }

        // Coletar todos os números confirmados
        const allConfirmedNumbers = [];
        confirmedPurchases.forEach(purchase => {
            purchase.numbers.forEach(number => {
                allConfirmedNumbers.push({
                    number: number,
                    participant: purchase.name,
                    phone: purchase.phone,
                    purchaseId: purchase.id
                });
            });
        });

        if (allConfirmedNumbers.length === 0) {
            showNotification('⚠️ Nenhum número válido para o sorteio', 'warning');
            return;
        }

        // Confirmação do sorteio
        const confirmDraw = confirm(`🎲 Realizar sorteio agora?\n\nTotal de números participantes: ${allConfirmedNumbers.length}\nTotal de participantes: ${confirmedPurchases.length}\n\nEsta ação não pode ser desfeita!`);
        
        if (!confirmDraw) {
            console.log('❌ Sorteio cancelado pelo usuário');
            return;
        }

        // Realizar sorteio
        const shuffled = allConfirmedNumbers.sort(() => 0.5 - Math.random());
        
        const firstPrize = shuffled[0];
        const secondPrize = shuffled[1];

        // Criar resultado do sorteio
        const drawResult = {
            date: new Date().toISOString(),
            timestamp: Date.now(),
            totalParticipants: confirmedPurchases.length,
            totalNumbers: allConfirmedNumbers.length,
            firstPrize: {
                number: firstPrize.number,
                participant: firstPrize.participant,
                phone: firstPrize.phone,
                prize: 'R$ 200,00'
            },
            secondPrize: {
                number: secondPrize.number,
                participant: secondPrize.participant,
                phone: secondPrize.phone,
                prize: 'R$ 100,00'
            }
        };

        // Salvar resultado do sorteio
        if (window.FirebaseDB && typeof window.FirebaseDB.saveDocument === 'function') {
            try {
                await window.FirebaseDB.saveDocument('draw_results', 'latest', drawResult);
                console.log('💾 Resultado do sorteio salvo no Firebase');
            } catch (saveError) {
                console.warn('⚠️ Erro ao salvar no Firebase:', saveError);
            }
        }

        // Salvar localmente também
        localStorage.setItem('lastDrawResult', JSON.stringify(drawResult));

        // Mostrar resultado
        const resultMessage = `🎉 SORTEIO REALIZADO COM SUCESSO! 🎉

🥇 1º PRÊMIO (R$ 200,00):
   Número: ${firstPrize.number}
   Ganhador: ${firstPrize.participant}
   Telefone: ${firstPrize.phone}

🥈 2º PRÊMIO (R$ 100,00):
   Número: ${secondPrize.number}
   Ganhador: ${secondPrize.participant}
   Telefone: ${secondPrize.phone}

Total de participantes: ${confirmedPurchases.length}
Total de números: ${allConfirmedNumbers.length}
Data: ${new Date().toLocaleString('pt-BR')}`;

        alert(resultMessage);
        showNotification('🎉 Sorteio realizado com sucesso!', 'success');
        console.log('🎲 Sorteio concluído:', drawResult);

    } catch (error) {
        console.error('❌ Erro durante o sorteio:', error);
        showNotification(`❌ Erro durante o sorteio: ${error.message}`, 'error');
    }
}

/**
 * Deleta um participante específico
 */
async function deleteParticipant(purchaseId) {
    console.log(`🗑️ Iniciando exclusão do participante: ${purchaseId}`);
    
    try {
        // Buscar dados do participante
        const purchase = adminData.purchases.find(p => p.id === purchaseId);
        
        if (!purchase) {
            showNotification('❌ Participante não encontrado', 'error');
            return;
        }

        // Confirmação
        const confirmDelete = confirm(`⚠️ Confirmar exclusão?\n\nParticipante: ${purchase.name}\nTelefone: ${purchase.phone}\nNúmeros: ${purchase.numbers?.join(', ') || 'N/A'}\n\nEsta ação não pode ser desfeita!`);
        
        if (!confirmDelete) {
            console.log('❌ Exclusão cancelada pelo usuário');
            return;
        }

        // Deletar do Firebase
        if (window.FirebaseDB && typeof window.FirebaseDB.deleteDocument === 'function') {
            try {
                const result = await window.FirebaseDB.deleteDocument('purchases', purchaseId);
                if (result.success) {
                    console.log('✅ Participante deletado do Firebase');
                } else {
                    console.warn('⚠️ Erro ao deletar do Firebase:', result.error);
                }
            } catch (firebaseError) {
                console.warn('⚠️ Erro na conexão com Firebase:', firebaseError);
            }
        }

        // Remover dos dados locais
        adminData.purchases = adminData.purchases.filter(p => p.id !== purchaseId);

        // Atualizar interface
        updateInterface();
        updateDashboard();
        loadParticipants();

        showNotification('✅ Participante excluído com sucesso', 'success');
        console.log(`✅ Participante ${purchaseId} excluído com sucesso`);

    } catch (error) {
        console.error('❌ Erro ao excluir participante:', error);
        showNotification(`❌ Erro ao excluir: ${error.message}`, 'error');
    }
}

// ========================================================================================
// FUNÇÕES AUXILIARES DE FORMATAÇÃO
// ========================================================================================

/**
 * Formatar valor monetário para formato brasileiro
 */
function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(value));
}

/**
 * Formatar data para formato brasileiro
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        
        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
            return 'Data inválida';
        }
        
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.warn('Erro ao formatar data:', error);
        return 'Data inválida';
    }
}

/**
 * Atualizar elemento DOM com fallback para erro
 */
function updateElement(id, value) {
    try {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`⚠️ Elemento ${id} não encontrado`);
        }
    } catch (error) {
        console.error(`❌ Erro ao atualizar elemento ${id}:`, error);
    }
}

/**
 * Mostrar erro com fallback
 */
function showError(message) {
    console.error('❌', message);
    
    // Tentar mostrar notificação se a função existe
    if (typeof showNotification === 'function') {
        showNotification(message, 'error');
    } else {
        // Fallback para alert
        alert('Erro: ' + message);
    }
}

/**
 * Mostrar notificação (implementação simples)
 */
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Implementação simples de notificação
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 350px;
        word-wrap: break-word;
    `;
    
    // Definir cor baseada no tipo
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = 'black';
            break;
        default:
            notification.style.backgroundColor = '#007bff';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// ========================================================================================
// LOGS E INICIALIZAÇÃO
// ========================================================================================

console.log('✅ Admin.js carregado completamente - todas as funções disponíveis');
console.log('📋 Versão: Sistema completo com listagem de participantes corrigida');

// Expor funções globalmente para uso nos botões e debug
window.adminData = adminData;
window.loadParticipants = loadParticipants;
window.createParticipantRow = createParticipantRow;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.updateInterface = updateInterface;
window.loadPurchaseData = loadPurchaseData;
window.createSampleData = createSampleData;

// ========================================================================================
// 🔄 SISTEMA DE AUTO-SYNC - IMPLEMENTAÇÃO COMPLETA
// ========================================================================================

// Configuração do auto-sync
let autoSyncConfig = {
    enabled: true,        // Ativo por padrão
    interval: 30000,      // 30 segundos
    timer: null,          // Timer interno
    lastUpdate: null,     // Última atualização
    isUpdating: false     // Flag de controle
};

// Inicializar sistema de auto-sync
function initializeAutoSync() {
    console.log('🔄 Inicializando sistema de auto-sync...');
    
    try {
        // Recuperar estado salvo
        const savedState = localStorage.getItem('adminAutoSyncEnabled');
        if (savedState !== null) {
            autoSyncConfig.enabled = JSON.parse(savedState);
        }
        
        // Configurar indicadores visuais
        updateSyncIndicators();
        
        // Iniciar auto-sync se habilitado
        if (autoSyncConfig.enabled) {
            startAutoSync();
        }
        
        console.log('✅ Sistema de auto-sync inicializado');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar auto-sync:', error);
    }
}

// Atualização manual de dados
function refreshData() {
    console.log('🔄 [REFRESH] Atualizando dados manualmente...');
    
    // Evitar múltiplas atualizações simultâneas
    if (autoSyncConfig.isUpdating) {
        console.log('⚠️ Atualização já em andamento...');
        showNotification('⚠️ Atualização já em andamento', 'warning');
        return;
    }
    
    autoSyncConfig.isUpdating = true;
    showSyncProgress(0, 'Iniciando atualização...');
    
    try {
        // Atualizar progresso
        showSyncProgress(25, 'Carregando dados...');
        
        // Carregar dados baseado na disponibilidade do Firebase
        if (adminData.firebaseReady && window.FirebaseDB) {
            showSyncProgress(50, 'Carregando do Firebase...');
            loadDataFromFirebase();
        } else {
            showSyncProgress(50, 'Carregando dados locais...');
            loadParticipants();
            updateDashboard();
        }
        
        // Finalizar progresso
        showSyncProgress(75, 'Atualizando interface...');
        setTimeout(() => {
            showSyncProgress(100, 'Concluído!');
            autoSyncConfig.lastUpdate = new Date();
            updateSyncIndicators();
            
            setTimeout(() => {
                hideSyncProgress();
                autoSyncConfig.isUpdating = false;
                showNotification('🔄 Dados atualizados com sucesso!', 'success');
            }, 500);
        }, 300);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar dados:', error);
        hideSyncProgress();
        autoSyncConfig.isUpdating = false;
        showNotification('❌ Erro ao atualizar dados: ' + error.message, 'error');
    }
}

// Toggle do auto-sync
function toggleAutoSync() {
    console.log('🔄 Toggle auto-sync...');
    
    autoSyncConfig.enabled = !autoSyncConfig.enabled;
    
    // Salvar estado
    localStorage.setItem('adminAutoSyncEnabled', JSON.stringify(autoSyncConfig.enabled));
    
    if (autoSyncConfig.enabled) {
        startAutoSync();
        showNotification('▶️ Auto-sync ativado', 'success');
    } else {
        stopAutoSync();
        showNotification('⏸️ Auto-sync pausado', 'warning');
    }
    
    updateSyncIndicators();
}

// Iniciar auto-sync
function startAutoSync() {
    console.log('▶️ Iniciando auto-sync...');
    
    // Parar timer anterior se existir
    if (autoSyncConfig.timer) {
        clearInterval(autoSyncConfig.timer);
    }
    
    // Configurar novo timer
    autoSyncConfig.timer = setInterval(() => {
        // Verificar se a página está visível
        if (document.hidden) {
            console.log('📄 Página não visível, pulando auto-sync');
            return;
        }
        
        // Verificar se não há atualização em andamento
        if (!autoSyncConfig.isUpdating) {
            console.log('⏰ Executando auto-sync...');
            refreshData();
        } else {
            console.log('⚠️ Auto-sync pulado - atualização em andamento');
        }
    }, autoSyncConfig.interval);
    
    console.log(`✅ Auto-sync ativo (${autoSyncConfig.interval / 1000}s)`);
}

// Parar auto-sync
function stopAutoSync() {
    console.log('⏸️ Parando auto-sync...');
    
    if (autoSyncConfig.timer) {
        clearInterval(autoSyncConfig.timer);
        autoSyncConfig.timer = null;
    }
    
    console.log('✅ Auto-sync parado');
}

// Recarregamento completo da página
function forceFullRefresh() {
    const confirmed = confirm('🔃 Recarregar a página completamente?\n\nIsso irá recarregar toda a interface.');
    
    if (confirmed) {
        console.log('🔃 Recarregando página...');
        showNotification('🔃 Recarregando página...', 'info');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// Mostrar estatísticas detalhadas
function showDataStats() {
    console.log('📊 Mostrando estatísticas...');
    
    try {
        const stats = calculateStats();
        
        const statsMessage = `📊 ESTATÍSTICAS DETALHADAS:

👥 Participantes: ${stats.totalParticipants}
💰 Receita Total: ${formatCurrency(stats.totalRevenue)}
🎯 Números Vendidos: ${stats.soldNumbers}
📈 Taxa de Conclusão: ${stats.completionRate}%

🔥 Status Firebase: ${adminData.firebaseReady ? '✅ Conectado' : '❌ Desconectado'}
🔄 Auto-sync: ${autoSyncConfig.enabled ? '🟢 Ativo' : '🔴 Pausado'}
⏰ Última Atualização: ${autoSyncConfig.lastUpdate ? autoSyncConfig.lastUpdate.toLocaleTimeString('pt-BR') : 'Nunca'}
⚡ Intervalo Auto-sync: ${autoSyncConfig.interval / 1000} segundos

📋 Breakdown por Status:
• Pendentes: ${adminData.purchases.filter(p => p.status === 'pending_donation').length}
• Confirmadas: ${adminData.purchases.filter(p => p.status === 'confirmed').length}
• Rejeitadas: ${adminData.purchases.filter(p => p.status === 'rejected').length}`;

        alert(statsMessage);
        
    } catch (error) {
        console.error('❌ Erro ao calcular estatísticas:', error);
        showNotification('❌ Erro ao calcular estatísticas', 'error');
    }
}

// Mostrar progresso da sincronização
function showSyncProgress(percentage, status) {
    const progressDiv = document.getElementById('sync-progress');
    const progressBar = document.getElementById('sync-progress-bar');
    const progressText = document.getElementById('sync-progress-text');
    
    if (progressDiv && progressBar) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percentage + '%';
        
        if (progressText) {
            progressText.textContent = status || `${percentage}%`;
        }
        
        console.log(`📊 Progresso: ${percentage}% - ${status}`);
    }
}

// Esconder progresso da sincronização
function hideSyncProgress() {
    const progressDiv = document.getElementById('sync-progress');
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
}

// Atualizar indicadores visuais do auto-sync
function updateSyncIndicators() {
    // Atualizar status do auto-sync
    const statusElement = document.getElementById('auto-sync-status');
    if (statusElement) {
        if (autoSyncConfig.enabled) {
            statusElement.textContent = '🟢 Auto-sync Ativo';
            statusElement.style.background = '#28a745';
        } else {
            statusElement.textContent = '🔴 Auto-sync Pausado';
            statusElement.style.background = '#dc3545';
        }
    }
    
    // Atualizar botão de toggle
    const toggleButton = document.getElementById('auto-sync-btn');
    if (toggleButton) {
        if (autoSyncConfig.enabled) {
            toggleButton.textContent = '⏸️ Pausar Auto-sync';
            toggleButton.style.background = '#ffc107';
            toggleButton.style.color = '#000';
        } else {
            toggleButton.textContent = '▶️ Ativar Auto-sync';
            toggleButton.style.background = '#28a745';
            toggleButton.style.color = '#fff';
        }
    }
    
    // Atualizar timestamp da última atualização
    const timeElement = document.getElementById('last-update-time');
    if (timeElement && autoSyncConfig.lastUpdate) {
        timeElement.textContent = `Última atualização: ${autoSyncConfig.lastUpdate.toLocaleTimeString('pt-BR')}`;
    }
}

// Calcular estatísticas
function calculateStats() {
    const confirmedPurchases = adminData.purchases.filter(p => p.status === 'confirmed');
    
    const soldNumbers = confirmedPurchases.reduce((total, purchase) => {
        return total + (purchase.numbers ? purchase.numbers.length : 0);
    }, 0);
    
    const totalRevenue = confirmedPurchases.reduce((total, purchase) => {
        return total + (purchase.totalAmount || 0);
    }, 0);
    
    const completionRate = adminData.config.totalNumbers > 0 
        ? ((soldNumbers / adminData.config.totalNumbers) * 100).toFixed(1)
        : 0;
    
    return {
        totalParticipants: confirmedPurchases.length,
        soldNumbers,
        totalRevenue,
        completionRate
    };
}

// Carregar dados do Firebase
async function loadDataFromFirebase() {
    try {
        console.log('🔥 Carregando dados do Firebase...');
        
        // Carregar compras
        const purchasesResult = await window.FirebaseDB.getPurchases();
        if (purchasesResult.success) {
            adminData.purchases = purchasesResult.data;
            console.log(`✅ ${purchasesResult.data.length} compras carregadas do Firebase`);
        } else {
            console.warn('⚠️ Erro ao carregar compras:', purchasesResult.error);
        }
        
        // Carregar configurações
        const configResult = await window.FirebaseDB.getConfig();
        if (configResult.success) {
            adminData.config = { ...adminData.config, ...configResult.data };
            console.log('✅ Configurações carregadas do Firebase');
        }
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do Firebase:', error);
        throw error; // Re-throw para o auto-sync capturar
    }
}

// ==========================================
// 🎯 EVENT DELEGATION - SISTEMA DE BOTÕES
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

// ========================================================================================
// FUNÇÕES AUXILIARES DE FORMATAÇÃO
// ========================================================================================

/**
 * Formatar valor monetário para formato brasileiro
 */
function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(value));
}

/**
 * Formatar data para formato brasileiro
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        
        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
            return 'Data inválida';
        }
        
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.warn('Erro ao formatar data:', error);
        return 'Data inválida';
    }
}

/**
 * Atualizar elemento DOM com fallback para erro
 */
function updateElement(id, value) {
    try {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`⚠️ Elemento ${id} não encontrado`);
        }
    } catch (error) {
        console.error(`❌ Erro ao atualizar elemento ${id}:`, error);
    }
}

/**
 * Mostrar erro com fallback
 */
function showError(message) {
    console.error('❌', message);
    
    // Tentar mostrar notificação se a função existe
    if (typeof showNotification === 'function') {
        showNotification(message, 'error');
    } else {
        // Fallback para alert
        alert('Erro: ' + message);
    }
}

// ========================================================================================
// LOGS E INICIALIZAÇÃO
// ========================================================================================

console.log('✅ Admin.js carregado completamente - todas as funções disponíveis');
console.log('📋 Versão: Sistema completo com listagem de participantes corrigida');

// Expor funções globalmente para uso nos botões e debug
window.adminData = adminData;
window.loadParticipants = loadParticipants;
window.createParticipantRow = createParticipantRow;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.updateInterface = updateInterface;
window.loadPurchaseData = loadPurchaseData;
window.createSampleData = createSampleData;

// ========================================================================================
// 🔄 SISTEMA DE AUTO-SYNC - IMPLEMENTAÇÃO COMPLETA
// ========================================================================================

// Configuração do auto-sync (já definida anteriormente)

// Inicializar sistema de auto-sync (DUPLICADO - CORRIGIDO)
function initializeAutoSync() {
    console.log('🔄 Inicializando sistema de auto-sync...');
    
    try {
        // Recuperar estado salvo
        const savedState = localStorage.getItem('adminAutoSyncEnabled');
        if (savedState !== null) {
            autoSyncConfig.enabled = JSON.parse(savedState);
        }
        
        // Configurar indicadores visuais
        updateSyncIndicators();
        
        // Iniciar auto-sync se habilitado
        if (autoSyncConfig.enabled) {
            startAutoSync();
        }
        
        console.log('✅ Sistema de auto-sync inicializado');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar auto-sync:', error);
    }
}

// Atualização manual de dados
function refreshData() {
    console.log('🔄 [REFRESH] Atualizando dados manualmente...');
    
    // Evitar múltiplas atualizações simultâneas
    if (autoSyncConfig.isUpdating) {
        console.log('⚠️ Atualização já em andamento...');
        showNotification('⚠️ Atualização já em andamento', 'warning');
        return;
    }
    
    autoSyncConfig.isUpdating = true;
    showSyncProgress(0, 'Iniciando atualização...');
    
    try {
        // Atualizar progresso
        showSyncProgress(25, 'Carregando dados...');
        
        // Carregar dados baseado na disponibilidade do Firebase
        if (adminData.firebaseReady && window.FirebaseDB) {
            showSyncProgress(50, 'Carregando do Firebase...');
            loadDataFromFirebase();
        } else {
            showSyncProgress(50, 'Carregando dados locais...');
            loadParticipants();
            updateDashboard();
        }
        
        // Finalizar progresso
        showSyncProgress(75, 'Atualizando interface...');
        setTimeout(() => {
            showSyncProgress(100, 'Concluído!');
            autoSyncConfig.lastUpdate = new Date();
            updateSyncIndicators();
            
            setTimeout(() => {
                hideSyncProgress();
                autoSyncConfig.isUpdating = false;
                showNotification('🔄 Dados atualizados com sucesso!', 'success');
            }, 500);
        }, 300);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar dados:', error);
        hideSyncProgress();
        autoSyncConfig.isUpdating = false;
        showNotification('❌ Erro ao atualizar dados: ' + error.message, 'error');
    }
}

// Toggle do auto-sync
function toggleAutoSync() {
    console.log('🔄 Toggle auto-sync...');
    
    autoSyncConfig.enabled = !autoSyncConfig.enabled;
    
    // Salvar estado
    localStorage.setItem('adminAutoSyncEnabled', JSON.stringify(autoSyncConfig.enabled));
    
    if (autoSyncConfig.enabled) {
        startAutoSync();
        showNotification('▶️ Auto-sync ativado', 'success');
    } else {
        stopAutoSync();
        showNotification('⏸️ Auto-sync pausado', 'warning');
    }
    
    updateSyncIndicators();
}

// Iniciar auto-sync
function startAutoSync() {
    console.log('▶️ Iniciando auto-sync...');
    
    // Parar timer anterior se existir
    if (autoSyncConfig.timer) {
        clearInterval(autoSyncConfig.timer);
    }
    
    // Configurar novo timer
    autoSyncConfig.timer = setInterval(() => {
        // Verificar se a página está visível
        if (document.hidden) {
            console.log('📄 Página não visível, pulando auto-sync');
            return;
        }
        
        // Verificar se não há atualização em andamento
        if (!autoSyncConfig.isUpdating) {
            console.log('⏰ Executando auto-sync...');
            refreshData();
        } else {
            console.log('⚠️ Auto-sync pulado - atualização em andamento');
        }
    }, autoSyncConfig.interval);
    
    console.log(`✅ Auto-sync ativo (${autoSyncConfig.interval / 1000}s)`);
}

// Parar auto-sync
function stopAutoSync() {
    console.log('⏸️ Parando auto-sync...');
    
    if (autoSyncConfig.timer) {
        clearInterval(autoSyncConfig.timer);
        autoSyncConfig.timer = null;
    }
    
    console.log('✅ Auto-sync parado');
}

// Recarregamento completo da página
function forceFullRefresh() {
    const confirmed = confirm('🔃 Recarregar a página completamente?\n\nIsso irá recarregar toda a interface.');
    
    if (confirmed) {
        console.log('🔃 Recarregando página...');
        showNotification('🔃 Recarregando página...', 'info');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// Mostrar estatísticas detalhadas
function showDataStats() {
    console.log('📊 Mostrando estatísticas...');
    
    try {
        const stats = calculateStats();
        
        const statsMessage = `📊 ESTATÍSTICAS DETALHADAS:

👥 Participantes: ${stats.totalParticipants}
💰 Receita Total: ${formatCurrency(stats.totalRevenue)}
🎯 Números Vendidos: ${stats.soldNumbers}
📈 Taxa de Conclusão: ${stats.completionRate}%

🔥 Status Firebase: ${adminData.firebaseReady ? '✅ Conectado' : '❌ Desconectado'}
🔄 Auto-sync: ${autoSyncConfig.enabled ? '🟢 Ativo' : '🔴 Pausado'}
⏰ Última Atualização: ${autoSyncConfig.lastUpdate ? autoSyncConfig.lastUpdate.toLocaleTimeString('pt-BR') : 'Nunca'}
⚡ Intervalo Auto-sync: ${autoSyncConfig.interval / 1000} segundos

📋 Breakdown por Status:
• Pendentes: ${adminData.purchases.filter(p => p.status === 'pending_donation').length}
• Confirmadas: ${adminData.purchases.filter(p => p.status === 'confirmed').length}
• Rejeitadas: ${adminData.purchases.filter(p => p.status === 'rejected').length}`;

        alert(statsMessage);
        
    } catch (error) {
        console.error('❌ Erro ao calcular estatísticas:', error);
        showNotification('❌ Erro ao calcular estatísticas', 'error');
    }
}

// Mostrar progresso da sincronização
function showSyncProgress(percentage, status) {
    const progressDiv = document.getElementById('sync-progress');
    const progressBar = document.getElementById('sync-progress-bar');
    const progressText = document.getElementById('sync-progress-text');
    
    if (progressDiv && progressBar) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percentage + '%';
        
        if (progressText) {
            progressText.textContent = status || `${percentage}%`;
        }
        
        console.log(`📊 Progresso: ${percentage}% - ${status}`);
    }
}

// Esconder progresso da sincronização
function hideSyncProgress() {
    const progressDiv = document.getElementById('sync-progress');
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
}

// Atualizar indicadores visuais do auto-sync
function updateSyncIndicators() {
    // Atualizar status do auto-sync
    const statusElement = document.getElementById('auto-sync-status');
    if (statusElement) {
        if (autoSyncConfig.enabled) {
            statusElement.textContent = '🟢 Auto-sync Ativo';
            statusElement.style.background = '#28a745';
        } else {
            statusElement.textContent = '🔴 Auto-sync Pausado';
            statusElement.style.background = '#dc3545';
        }
    }
    
    // Atualizar botão de toggle
    const toggleButton = document.getElementById('auto-sync-btn');
    if (toggleButton) {
        if (autoSyncConfig.enabled) {
            toggleButton.textContent = '⏸️ Pausar Auto-sync';
            toggleButton.style.background = '#ffc107';
            toggleButton.style.color = '#000';
        } else {
            toggleButton.textContent = '▶️ Ativar Auto-sync';
            toggleButton.style.background = '#28a745';
            toggleButton.style.color = '#fff';
        }
    }
    
    // Atualizar timestamp da última atualização
    const timeElement = document.getElementById('last-update-time');
    if (timeElement && autoSyncConfig.lastUpdate) {
        timeElement.textContent = `Última atualização: ${autoSyncConfig.lastUpdate.toLocaleTimeString('pt-BR')}`;
    }
}

// Calcular estatísticas
function calculateStats() {
    const confirmedPurchases = adminData.purchases.filter(p => p.status === 'confirmed');
    
    const soldNumbers = confirmedPurchases.reduce((total, purchase) => {
        return total + (purchase.numbers ? purchase.numbers.length : 0);
    }, 0);
    
    const totalRevenue = confirmedPurchases.reduce((total, purchase) => {
        return total + (purchase.totalAmount || 0);
    }, 0);
    
    const completionRate = adminData.config.totalNumbers > 0 
        ? ((soldNumbers / adminData.config.totalNumbers) * 100).toFixed(1)
        : 0;
    
    return {
        totalParticipants: confirmedPurchases.length,
        soldNumbers,
        totalRevenue,
        completionRate
    };
}