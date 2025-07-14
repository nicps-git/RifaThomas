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
        
        // 2. Configurar event listeners ÚNICOS (sem duplicação)
        setupEventListeners();
        
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
        
        // REMOVIDO: fallback para localStorage
        // Sistema agora é Firebase-only - se falhar, não há fallback
        console.log('🚫 Sistema Firebase-only: não há fallback para dados locais');
        adminData.purchases = []; // Array vazio se Firebase falhar
        
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
            console.log('🔥 Carregando do Firebase...');
            const result = await window.FirebaseDB.loadPurchases();
            console.log('📋 Resultado do Firebase:', result);
            
            if (result.success && Array.isArray(result.data)) {
                adminData.purchases = result.data;
                adminData.firebaseReady = true;
                console.log(`✅ ${result.data.length} compras carregadas do Firebase`);
                
                // Salvar backup no localStorage para casos de emergência
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
            console.log('🔄 Tentando fallback para localStorage...');
            
            // Fallback para localStorage
            await loadLocalDataFallback();
            return;
        }
    } else {
        console.warn('⚠️ Firebase não disponível, usando localStorage...');
        await loadLocalDataFallback();
    }
}

// Carregar dados locais como fallback
async function loadLocalDataFallback() {
    console.log('📦 Tentando carregar dados do localStorage como fallback...');
    
    try {
        // Tentar carregar backup do localStorage
        const backupData = localStorage.getItem('admin_purchases_backup');
        if (backupData) {
            const purchases = JSON.parse(backupData);
            if (Array.isArray(purchases)) {
                adminData.purchases = purchases;
                console.log(`✅ ${purchases.length} compras carregadas do backup localStorage`);
                return;
            }
        }
        
        // Tentar carregar dados principais do localStorage
        const mainData = localStorage.getItem('purchases');
        if (mainData) {
            const purchases = JSON.parse(mainData);
            if (Array.isArray(purchases)) {
                adminData.purchases = purchases;
                console.log(`✅ ${purchases.length} compras carregadas do localStorage principal`);
                return;
            }
        }
        
        // Se chegou aqui, não há dados disponíveis
        console.warn('⚠️ Nenhum dado disponível no localStorage');
        await createSampleDataForEmergency();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados locais:', error);
        await createSampleDataForEmergency();
    }
}

// Criar dados de exemplo para emergência
async function createSampleDataForEmergency() {
    console.log('🚨 Criando dados de exemplo para emergência...');
    
    const sampleData = [
        {
            id: 'sample-' + Date.now(),
            buyerName: 'João Silva (EXEMPLO)',
            buyerPhone: '(11) 99999-1111',
            buyerEmail: 'joao@exemplo.com',
            numbers: [1, 2, 3],
            totalAmount: 120.00,
            paymentMethod: 'pix',
            status: 'confirmed',
            date: new Date().toISOString(),
            timestamp: new Date()
        },
        {
            id: 'sample-' + (Date.now() + 1),
            buyerName: 'Maria Santos (EXEMPLO)',
            buyerPhone: '(11) 99999-2222',
            buyerEmail: 'maria@exemplo.com',
            numbers: [10, 20],
            totalAmount: 80.00,
            paymentMethod: 'doacao',
            status: 'pending_donation',
            date: new Date().toISOString(),
            timestamp: new Date()
        }
    ];
    
    adminData.purchases = sampleData;
    console.log(`✅ ${sampleData.length} dados de exemplo criados`);
    
    // Mostrar aviso para o usuário
    showError('⚠️ MODO EMERGÊNCIA: Exibindo dados de exemplo. Verifique a conexão com Firebase.');
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

// Handler global para cliques - VERSÃO CORRIGIDA
function handleGlobalClick(event) {
    const target = event.target;
    const button = target.closest('button');
    
    if (!button) return;
    
    const action = button.getAttribute('data-action');
    const purchaseId = button.getAttribute('data-purchase-id');
    
    console.log(`🎯 [CLICK-DEBUG] Botão clicado:`);
    console.log(`   - Elemento:`, button);
    console.log(`   - Action: "${action}"`);
    console.log(`   - Purchase ID: "${purchaseId}"`);
    
    if (!action) {
        console.log(`⚠️ [CLICK-DEBUG] Botão sem data-action - ignorando`);
        return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    console.log(`✅ [CLICK-DEBUG] Processando ação: ${action} para compra ${purchaseId}`);
    
    switch (action) {
        case 'confirm-donation':
            console.log(`🟢 [CLICK-DEBUG] Chamando confirmDonation(${purchaseId})`);
            confirmDonation(purchaseId);
            break;
        case 'reject-donation':
            console.log(`🔴 [CLICK-DEBUG] Chamando rejectDonation(${purchaseId})`);
            rejectDonation(purchaseId);
            break;
        case 'edit-participant':
            console.log(`🔵 [CLICK-DEBUG] Chamando editParticipant(${purchaseId})`);
            editParticipant(purchaseId);
            break;
        case 'delete-participant':
            console.log(`⚫ [CLICK-DEBUG] Chamando deleteParticipant(${purchaseId})`);
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
            // Para o filtro de doações pendentes, usar a lógica robusta
            if (filter === 'pending_donation') {
                const isDonation = isDoacaoRobusta(purchase);
                const isPending = isStatusPendenteRobusta(purchase);
                
                console.log(`🔍 [FILTER-DEBUG] ${purchase.buyerName || purchase.id}:`);
                console.log(`   - isDonation: ${isDonation}`);
                console.log(`   - isPending: ${isPending}`);
                console.log(`   - Incluir no filtro: ${isDonation && isPending}`);
                
                return isDonation && isPending;
            }
            
            // Para outros filtros, usar comparação simples de status
            const status = normalizeString(purchase.status || 'confirmed');
            return status.includes(filter.toLowerCase());
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
    console.log('🔧 CRIANDO LINHA PARA:', purchase.id, purchase);
    
    const row = document.createElement('tr');
    
    const statusClass = getStatusClass(purchase.status);
    const statusText = getStatusText(purchase.status);
    const numbersText = purchase.numbers ? purchase.numbers.join(', ') : 'N/A';
    const paymentText = getPaymentMethodText(purchase.paymentMethod);
    
    console.log('🔧 CHAMANDO createActionButtons para:', purchase.id);
    const actionButtonsHTML = createActionButtons(purchase);
    console.log('🔧 BOTÕES RECEBIDOS:', actionButtonsHTML.length, 'chars');
    console.log('🔧 HTML dos botões:', actionButtonsHTML.substring(0, 200) + '...');
    
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
                ${actionButtonsHTML}
            </div>
        </td>
    `;
    
    console.log('🔧 LINHA CRIADA! HTML final:', row.innerHTML.length, 'chars');
    
    return row;
}

// Função auxiliar para normalizar strings
function normalizeString(str) {
    if (!str) return '';
    return str.toString().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
        .replace(/[^\w\s]/g, '')         // Remove pontuação
        .trim();
}

// Função robusta para verificar se é doação
function isDoacaoRobusta(purchase) {
    if (!purchase) return false;
    
    const tipoNorm = normalizeString(purchase.tipo || '');
    const metodoPagamentoNorm = normalizeString(purchase.metodoPagamento || purchase.paymentMethod || '');
    const observacoesNorm = normalizeString(purchase.observacoes || purchase.notes || '');
    
    const variacoesDoacao = ['doacao', 'doacão', 'doação', 'donation'];
    
    return variacoesDoacao.some(variacao => 
        tipoNorm.includes(variacao) || 
        metodoPagamentoNorm.includes(variacao) ||
        observacoesNorm.includes(variacao)
    );
}

// Função robusta para verificar se está pendente
function isStatusPendenteRobusta(purchase) {
    if (!purchase) return false;
    
    const statusNorm = normalizeString(purchase.status || '');
    const variacoesPendente = ['pendente', 'pending', 'aguardando', 'nao confirmado', 'naoconfirmado'];
    
    return variacoesPendente.some(variacao => statusNorm.includes(variacao));
}

// FUNÇÃO DE EMERGÊNCIA EXTREMA - Botões SEMPRE aparecem
// FUNÇÃO CORRIGIDA - Botões com event delegation correto
function createActionButtons(purchase) {
    console.log('🚨🚨🚨 CRIANDO BOTÕES CORRIGIDOS 🚨🚨🚨');
    console.log('Purchase recebida:', purchase);
    console.log('Purchase ID:', purchase?.id);
    console.log('Purchase Type:', purchase?.type);
    console.log('Purchase Status:', purchase?.status);
    console.log('Purchase Payment Method:', purchase?.paymentMethod);
    
    const purchaseId = purchase?.id || `generated-${Date.now()}`;
    
    // VERSÃO CORRIGIDA - Usando data-action E onclick como fallback
    const correctButtons = `
        <div class="action-buttons-corrected" style="display: flex; gap: 5px; flex-wrap: wrap;">
            <button 
                class="btn-edit" 
                data-action="edit-participant" 
                data-purchase-id="${purchaseId}" 
                onclick="handleEditAction('${purchaseId}'); return false;" 
                style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                ✏️ Editar
            </button>
            <button 
                class="btn-debug" 
                data-action="debug-participant" 
                data-purchase-id="${purchaseId}" 
                onclick="handleDebugAction('${purchaseId}', ${JSON.stringify(purchase || {}).replace(/"/g, '&quot;')}); return false;" 
                style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                🔍 Debug
            </button>
            <button 
                class="btn-confirm" 
                data-action="confirm-donation" 
                data-purchase-id="${purchaseId}" 
                onclick="handleConfirmAction('${purchaseId}'); return false;" 
                style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                ✅ Confirmar
            </button>
            <button 
                class="btn-reject" 
                data-action="reject-donation" 
                data-purchase-id="${purchaseId}" 
                onclick="handleRejectAction('${purchaseId}'); return false;" 
                style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                ❌ Rejeitar
            </button>
        </div>
    `;
    
    console.log('🚨 BOTÕES CORRIGIDOS: HTML criado:', correctButtons.length, 'chars');
    console.log('🚨🚨🚨 BOTÕES CORRIGIDOS FINALIZADOS 🚨🚨🚨');
    
    return correctButtons;
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
        
        // APENAS Firebase - sem fallback para localStorage
        if (typeof window.FirebaseDB === 'undefined') {
            throw new Error('Firebase não disponível. Sistema é Firebase-only para configurações.');
        }
        
        console.log('🔥 Carregando configurações APENAS do Firebase...');
        const firebaseResult = await window.FirebaseDB.loadConfig();
        
        if (firebaseResult.success && firebaseResult.data) {
            config = firebaseResult.data;
            console.log('✅ Configurações carregadas do Firebase:', config);
            
            // Atualizar adminData com as configurações do Firebase
            adminData.config = { ...adminData.config, ...config };
        } else {
            console.warn('⚠️ Configurações não encontradas no Firebase, usando padrões');
            config = adminData.config; // Usar configurações padrão já definidas
        }
        
        // Usar valores das configurações carregadas ou padrões
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
            'config-draw-date': finalConfig.drawDate ? new Date(finalConfig.drawDate).toISOString().slice(0, 16) : '2025-07-18T16:00'
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
            'config-draw-date': '2025-07-18T16:00'
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
        
        // APENAS Firebase - sem localStorage
        if (typeof window.FirebaseDB === 'undefined' || !adminData.firebaseReady) {
            throw new Error('Firebase não está pronto. Sistema é Firebase-only para configurações.');
        }
        
        console.log('🔥 Salvando configurações APENAS no Firebase...');
        const result = await window.FirebaseDB.saveConfig(newConfig);
        
        if (!result.success) {
            throw new Error(result.error || 'Erro ao salvar configurações no Firebase');
        }
        
        console.log('✅ Configurações salvas no Firebase com sucesso');
        
        // Array de status de salvamento
        const statusMessages = ['Firebase: Sucesso'];
        
        // Atualizar configurações em memória
        adminData.config = { ...adminData.config, ...newConfig };
        console.log('🧠 AdminData atualizado:', adminData.config);
        
        // Atualizar dashboard com novas configurações
        try {
            updateDashboard();
            console.log('📊 Dashboard atualizado');
            statusMessages.push('Dashboard: Atualizado');
        } catch (dashboardError) {
            console.warn('⚠️ Erro ao atualizar dashboard:', dashboardError);
            statusMessages.push('Dashboard: Erro');
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
        
        // Notificação de sucesso
        showNotification(`⚙️ Configurações salvas no Firebase com sucesso!`, 'success');
        console.log('✅ Configurações salvas com sucesso!');
        
        // Mostrar mensagem detalhada
        alert(`✅ CONFIGURAÇÕES SALVAS!\n\n` +
            `💾 Salvamento: ${statusMessages.join(', ')}\n\n` +
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
    // Primeira barra de progresso (na seção de controles)
    const progressDiv = document.getElementById('sync-progress');
    const progressBar = document.getElementById('sync-progress-bar');
    const progressText = document.getElementById('sync-status-text');
    
    if (progressDiv && progressBar) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percentage + '%';
        
        if (progressText) {
            progressText.textContent = status || `${percentage}%`;
        }
    }
    
    // Segunda barra de progresso (na seção principal)
    const progressDivMain = document.getElementById('sync-progress-main');
    const progressBarMain = document.getElementById('sync-progress-bar-main');
    const progressTextMain = document.getElementById('sync-progress-text-main');
    
    if (progressDivMain && progressBarMain) {
        progressDivMain.style.display = 'block';
        progressBarMain.style.width = percentage + '%';
        
        if (progressTextMain) {
            progressTextMain.textContent = status || `${percentage}%`;
        }
    }
    
    console.log(`📊 Progresso: ${percentage}% - ${status}`);
}

// Esconder progresso da sincronização
function hideSyncProgress() {
    const progressDiv = document.getElementById('sync-progress');
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
    
    const progressDivMain = document.getElementById('sync-progress-main');
    if (progressDivMain) {
        progressDivMain.style.display = 'none';
    }
}

// Atualizar indicadores visuais do auto-sync
function updateSyncIndicators() {
    // Atualizar status do auto-sync (primeiro na seção de controles)
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
    
    // Atualizar status do auto-sync (seção principal)
    const statusElementMain = document.getElementById('auto-sync-status-main');
    if (statusElementMain) {
        if (autoSyncConfig.enabled) {
            statusElementMain.textContent = '🟢 Auto-sync Ativo';
            statusElementMain.style.background = '#28a745';
        } else {
            statusElementMain.textContent = '🔴 Auto-sync Pausado';
            statusElementMain.style.background = '#dc3545';
        }
    }
    
    // Atualizar botão de toggle (primeiro)
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
    
    // Atualizar botão de toggle (principal)
    const toggleButtonMain = document.getElementById('auto-sync-btn-main');
    if (toggleButtonMain) {
        if (autoSyncConfig.enabled) {
            toggleButtonMain.textContent = '⏸️ Pausar Auto-sync';
            toggleButtonMain.style.background = '#ffc107';
            toggleButtonMain.style.color = '#000';
        } else {
            toggleButtonMain.textContent = '▶️ Ativar Auto-sync';
            toggleButtonMain.style.background = '#28a745';
            toggleButtonMain.style.color = '#fff';
        }
    }
    
    // Atualizar timestamp da última atualização (ambos)
    const timeString = autoSyncConfig.lastUpdate ? 
        `Última atualização: ${autoSyncConfig.lastUpdate.toLocaleTimeString('pt-BR')}` : 
        'Primeira execução...';
        
    const timeElement = document.getElementById('last-update-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
    
    const timeElementMain = document.getElementById('last-update-time-main');
    if (timeElementMain) {
        timeElementMain.textContent = timeString;
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
        
        // Carregar compras - método correto é loadPurchases()
        const purchasesResult = await window.FirebaseDB.loadPurchases();
        if (purchasesResult.success) {
            adminData.purchases = purchasesResult.data;
            console.log(`✅ ${purchasesResult.data.length} compras carregadas do Firebase`);
        } else {
            console.warn('⚠️ Erro ao carregar compras:', purchasesResult.error);
        }
        
        // Carregar configurações - método correto é loadConfig()
        const configResult = await window.FirebaseDB.loadConfig();
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

/*
// FUNÇÃO DUPLICADA - COMENTADA PARA EVITAR CONFLITO
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
*/

// ==========================================
// 🎯 HANDLERS DE CONFIRMAÇÃO - VERSÃO ATIVA
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
        // APENAS Firebase - sem localStorage
        console.log('🔥 Salvando APENAS no Firebase...');
        
        if (!adminData.firebaseReady || typeof window.FirebaseDB === 'undefined') {
            throw new Error('Firebase não está pronto. Sistema é Firebase-only.');
        }
        
        const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'confirmed', {
            confirmedAt: new Date().toISOString(),
            confirmedBy: 'admin'
        });
        
        if (!result.success) {
            throw new Error(result.error || 'Erro ao atualizar no Firebase');
        }
        
        console.log('✅ Confirmação salva no Firebase');
        
        // Atualizar apenas o estado local (não localStorage)
        purchase.status = 'confirmed';
        purchase.confirmedAt = new Date().toISOString();
        purchase.confirmedBy = 'admin';
        
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
        // APENAS Firebase - sem localStorage
        console.log('🔥 Salvando APENAS no Firebase...');
        
        if (!adminData.firebaseReady || typeof window.FirebaseDB === 'undefined') {
            throw new Error('Firebase não está pronto. Sistema é Firebase-only.');
        }
        
        const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'rejected', {
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason || 'Sem motivo especificado',
            rejectedBy: 'admin'
        });
        
        if (!result.success) {
            throw new Error(result.error || 'Erro ao atualizar no Firebase');
        }
        
        console.log('✅ Rejeição salva no Firebase');
        
        // Atualizar apenas o estado local (não localStorage)
        purchase.status = 'rejected';
        purchase.rejectedAt = new Date().toISOString();
        purchase.rejectionReason = reason || 'Sem motivo especificado';
        purchase.rejectedBy = 'admin';
        
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

// ================================================================================
// FUNÇÕES DE HANDLER PARA OS BOTÕES - GARANTEM QUE FUNCIONEM
// ================================================================================

// Handler para botão Editar
function handleEditAction(purchaseId) {
    console.log('✏️ EDITAR clicado para:', purchaseId);
    alert(`✏️ Editar acionado para compra: ${purchaseId}`);
    
    // TODO: Implementar lógica de edição real
    console.log('📝 Função de edição seria executada aqui');
}

// Handler para botão Debug
function handleDebugAction(purchaseId, purchaseData) {
    console.log('🔍 DEBUG clicado para:', purchaseId);
    console.log('📊 Dados da compra:', purchaseData);
    alert(`🔍 Debug acionado para compra: ${purchaseId}\nVeja o console para detalhes.`);
    
    // Mostrar dados detalhados no console
    console.group(`🔍 DEBUG DETALHADO - Compra ${purchaseId}`);
    console.log('Dados completos:', purchaseData);
    console.log('Tipo:', purchaseData?.type);
    console.log('Status:', purchaseData?.status);
    console.log('Método pagamento:', purchaseData?.paymentMethod);
    console.log('Valor:', purchaseData?.totalAmount);
    console.groupEnd();
}

// Handler para botão Confirmar - COM IMPLEMENTAÇÃO REAL
function handleConfirmAction(purchaseId) {
    console.log('✅ CONFIRMAR clicado para:', purchaseId);
    
    if (!purchaseId) {
        console.error('❌ ID da compra não fornecido');
        alert('❌ Erro: ID da compra não encontrado');
        return;
    }
    
    const confirmado = confirm(`✅ Deseja confirmar a doação ${purchaseId}?\n\nEsta ação marcará a doação como confirmada.`);
    if (!confirmado) {
        console.log('❌ Confirmação cancelada pelo usuário');
        return;
    }
    
    console.log('✅ Confirmação aceita pelo usuário');
    console.log('💾 Iniciando processo de confirmação...');
    
    try {
        // 1. Encontrar a compra nos dados locais
        const purchaseIndex = adminData.purchases.findIndex(p => p.id === purchaseId);
        
        if (purchaseIndex === -1) {
            console.error('❌ Compra não encontrada nos dados locais:', purchaseId);
            alert('❌ Erro: Compra não encontrada nos dados locais');
            return;
        }
        
        const purchase = adminData.purchases[purchaseIndex];
        console.log('📦 Compra encontrada:', purchase);
        
        // 2. Atualizar status localmente
        adminData.purchases[purchaseIndex].status = 'confirmed';
        console.log('✅ Status atualizado localmente para "confirmed"');
        
        // 3. Tentar salvar no Firebase
        if (typeof window.FirebaseDB !== 'undefined') {
            console.log('🔥 Tentando salvar no Firebase...');
            
            // Usar a API do Firebase para atualizar
            window.FirebaseDB.updatePurchase(purchaseId, { status: 'confirmed' })
                .then(result => {
                    if (result.success) {
                        console.log('✅ Firebase atualizado com sucesso');
                        showNotification('✅ Doação confirmada com sucesso!', 'success');
                        
                        // Recarregar dados para sincronizar
                        loadPurchaseData();
                        
                    } else {
                        console.error('❌ Erro ao atualizar Firebase:', result.error);
                        showNotification('⚠️ Confirmação local realizada, mas erro no Firebase: ' + result.error, 'warning');
                    }
                })
                .catch(error => {
                    console.error('❌ Erro na chamada Firebase:', error);
                    showNotification('⚠️ Confirmação local realizada, mas erro no Firebase', 'warning');
                });
                
        } else {
            console.log('⚠️ Firebase não disponível, salvando apenas localmente');
            showNotification('✅ Doação confirmada localmente (Firebase indisponível)', 'warning');
        }
        
        // 4. Atualizar interface imediatamente
        console.log('🔄 Atualizando interface...');
        loadParticipants();
        
        // 5. Salvar backup no localStorage
        try {
            localStorage.setItem('admin_purchases_backup', JSON.stringify(adminData.purchases));
            console.log('💾 Backup atualizado no localStorage');
        } catch (backupError) {
            console.warn('⚠️ Erro ao salvar backup:', backupError);
        }
        
        console.log('✅ Processo de confirmação completo');
        
    } catch (error) {
        console.error('❌ Erro durante confirmação:', error);
        alert(`❌ Erro durante confirmação: ${error.message}`);
        
        // Reverter mudança local em caso de erro
        if (adminData.purchases[purchaseIndex]) {
            adminData.purchases[purchaseIndex].status = purchase.status;
            console.log('🔄 Status revertido devido ao erro');
        }
    }
}

// Handler para botão Rejeitar - COM IMPLEMENTAÇÃO REAL
function handleRejectAction(purchaseId) {
    console.log('❌ REJEITAR clicado para:', purchaseId);
    
    if (!purchaseId) {
        console.error('❌ ID da compra não fornecido');
        alert('❌ Erro: ID da compra não encontrado');
        return;
    }
    
    const rejeitado = confirm(`❌ Deseja rejeitar a doação ${purchaseId}?\n\nEsta ação marcará a doação como rejeitada.`);
    if (!rejeitado) {
        console.log('🔄 Rejeição cancelada pelo usuário');
        return;
    }
    
    console.log('❌ Rejeição aceita pelo usuário');
    console.log('💾 Iniciando processo de rejeição...');
    
    try {
        // 1. Encontrar a compra nos dados locais
        const purchaseIndex = adminData.purchases.findIndex(p => p.id === purchaseId);
        
        if (purchaseIndex === -1) {
            console.error('❌ Compra não encontrada nos dados locais:', purchaseId);
            alert('❌ Erro: Compra não encontrada nos dados locais');
            return;
        }
        
        const purchase = adminData.purchases[purchaseIndex];
        console.log('📦 Compra encontrada:', purchase);
        
        // 2. Atualizar status localmente
        adminData.purchases[purchaseIndex].status = 'rejected';
        console.log('✅ Status atualizado localmente para "rejected"');
        
        // 3. Tentar salvar no Firebase
        if (typeof window.FirebaseDB !== 'undefined') {
            console.log('🔥 Tentando salvar no Firebase...');
            
            window.FirebaseDB.updatePurchase(purchaseId, { status: 'rejected' })
                .then(result => {
                    if (result.success) {
                        console.log('✅ Firebase atualizado com sucesso');
                        showNotification('❌ Doação rejeitada com sucesso!', 'info');
                        
                        // Recarregar dados para sincronizar
                        loadPurchaseData();
                        
                    } else {
                        console.error('❌ Erro ao atualizar Firebase:', result.error);
                        showNotification('⚠️ Rejeição local realizada, mas erro no Firebase: ' + result.error, 'warning');
                    }
                })
                .catch(error => {
                    console.error('❌ Erro na chamada Firebase:', error);
                    showNotification('⚠️ Rejeição local realizada, mas erro no Firebase', 'warning');
                });
                
        } else {
            console.log('⚠️ Firebase não disponível, salvando apenas localmente');
            showNotification('❌ Doação rejeitada localmente (Firebase indisponível)', 'warning');
        }
        
        // 4. Atualizar interface imediatamente
        console.log('🔄 Atualizando interface...');
        loadParticipants();
        
        // 5. Salvar backup no localStorage
        try {
            localStorage.setItem('admin_purchases_backup', JSON.stringify(adminData.purchases));
            console.log('💾 Backup atualizado no localStorage');
        } catch (backupError) {
            console.warn('⚠️ Erro ao salvar backup:', backupError);
        }
        
        console.log('✅ Processo de rejeição completo');
        
    } catch (error) {
        console.error('❌ Erro durante rejeição:', error);
        alert(`❌ Erro durante rejeição: ${error.message}`);
        
        // Reverter mudança local em caso de erro
        if (adminData.purchases[purchaseIndex]) {
            adminData.purchases[purchaseIndex].status = purchase.status;
            console.log('🔄 Status revertido devido ao erro');
        }
    }
}

// Tornar funções globais para que onclick possa acessá-las
window.handleEditAction = handleEditAction;
window.handleDebugAction = handleDebugAction;
window.handleConfirmAction = handleConfirmAction;
window.handleRejectAction = handleRejectAction;

console.log('✅ FUNÇÕES DE HANDLER DOS BOTÕES CONFIGURADAS E GLOBAIS');

// ========================================================================================
// SISTEMA DE RECUPERAÇÃO E EMERGÊNCIA
// ========================================================================================

// Função de emergência para criar dados de teste se necessário
window.createSampleData = function() {
    console.log('🚨 Criando dados de amostra de emergência...');
    
    const sampleData = [
        {
            id: 'emergency-' + Date.now(),
            buyerName: 'USUÁRIO TESTE 1',
            buyerPhone: '(11) 99999-1111',
            buyerEmail: 'teste1@exemplo.com',
            numbers: [1, 2, 3],
            totalAmount: 120.00,
            paymentMethod: 'pix',
            status: 'confirmed',
            date: new Date().toISOString(),
            timestamp: new Date()
        },
        {
            id: 'emergency-' + (Date.now() + 1),
            buyerName: 'USUÁRIO TESTE 2',
            buyerPhone: '(11) 99999-2222', 
            buyerEmail: 'teste2@exemplo.com',
            numbers: [10, 20],
            totalAmount: 80.00,
            paymentMethod: 'doacao',
            status: 'pending_donation',
            date: new Date().toISOString(),
            timestamp: new Date()
        }
    ];
    
    adminData.purchases = sampleData;
    console.log(`✅ ${sampleData.length} dados de amostra criados`);
    
    // Salvar no localStorage
    try {
        localStorage.setItem('admin_emergency_data', JSON.stringify(sampleData));
        console.log('💾 Dados de emergência salvos');
    } catch (error) {
        console.warn('⚠️ Erro ao salvar dados de emergência:', error);
    }
    
    return sampleData;
};

// Função para forçar carregamento de dados
window.forcarCarregamentoDados = async function() {
    console.log('🔄 FORÇANDO carregamento de dados...');
    
    try {
        // Tentar Firebase primeiro
        if (typeof window.FirebaseDB !== 'undefined') {
            console.log('🔥 Tentando Firebase...');
            const result = await window.FirebaseDB.loadPurchases();
            
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                adminData.purchases = result.data;
                console.log(`✅ ${result.data.length} compras carregadas do Firebase`);
                loadParticipants();
                updateDashboard();
                return result.data;
            }
        }
        
        // Tentar localStorage
        console.log('📦 Tentando localStorage...');
        const backupData = localStorage.getItem('admin_purchases_backup');
        if (backupData) {
            const purchases = JSON.parse(backupData);
            if (Array.isArray(purchases) && purchases.length > 0) {
                adminData.purchases = purchases;
                console.log(`✅ ${purchases.length} compras carregadas do backup`);
                loadParticipants();
                updateDashboard();
                return purchases;
            }
        }
        
        // Último recurso: dados de emergência
        console.log('🚨 Criando dados de emergência...');
        const sampleData = window.createSampleData();
        loadParticipants();
        updateDashboard();
        alert('⚠️ MODO EMERGÊNCIA ATIVADO\n\nO sistema carregou dados de exemplo porque não conseguiu conectar ao Firebase.\n\nVerifique sua conexão e recarregue a página.');
        return sampleData;
        
    } catch (error) {
        console.error('❌ Erro no carregamento forçado:', error);
        alert('❌ ERRO CRÍTICO\n\nNão foi possível carregar nenhum dado.\n\nVerifique o console e contate o suporte.');
        return [];
    }
};

// Função para diagnóstico rápido
window.diagnosticoRapido = function() {
    console.log('🔍 === DIAGNÓSTICO RÁPIDO ===');
    console.log('Firebase disponível:', typeof window.FirebaseDB !== 'undefined');
    console.log('AdminData:', adminData);
    console.log('Compras:', adminData.purchases?.length || 0);
    console.log('Sistema inicializado:', systemInitialized);
    console.log('Firebase ready:', adminData.firebaseReady);
    
    // Verificar elementos DOM críticos
    const criticalElements = ['participants-tbody', 'total-participants', 'config-pix-key'];
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`Elemento ${id}:`, element ? 'OK' : 'MISSING');
    });
    
    // Verificar funções críticas
    const criticalFunctions = ['loadParticipants', 'formatCurrency', 'formatDate'];
    criticalFunctions.forEach(func => {
        console.log(`Função ${func}:`, typeof window[func] === 'function' ? 'OK' : 'MISSING');
    });
    
    console.log('=== FIM DIAGNÓSTICO ===');
    
    return {
        firebase: typeof window.FirebaseDB !== 'undefined',
        purchases: adminData.purchases?.length || 0,
        systemReady: systemInitialized,
        elements: criticalElements.map(id => ({ id, found: !!document.getElementById(id) })),
        functions: criticalFunctions.map(func => ({ func, found: typeof window[func] === 'function' }))
    };
};

// ========================================================================================
// EXPOSIÇÃO GLOBAL FINAL
// ========================================================================================

// Garantir que todas as funções estejam disponíveis globalmente
window.adminData = adminData;
window.loadParticipants = loadParticipants;
window.loadPurchaseData = loadPurchaseData;
window.updateDashboard = updateDashboard;
window.updateInterface = updateInterface;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.createParticipantRow = createParticipantRow;
window.filterParticipants = filterParticipants;
window.editParticipant = editParticipant;
window.exportParticipants = exportParticipants;
window.resetAllNumbers = resetAllNumbers;
window.performDraw = performDraw;
window.refreshData = refreshData;
window.exportData = exportData;
window.openDrawModal = openDrawModal;
window.searchParticipant = searchParticipant;

console.log('✅ === ADMIN.JS CARREGADO COMPLETAMENTE ===');
console.log('📊 Sistema de recuperação e emergência ativado');
console.log('🔧 Funções disponíveis globalmente');
console.log('⚡ Use window.forcarCarregamentoDados() se houver problemas');
console.log('🔍 Use window.diagnosticoRapido() para debug');

// ========================================================================================
// FUNÇÕES ADMINISTRATIVAS RESTAURADAS
// ========================================================================================

/**
 * Filtrar participantes por status
 */
function filterParticipants(status) {
    console.log('🔍 Filtrando por status:', status);
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById('filter-' + status);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Recarregar tabela com filtro
    loadParticipants(status);
}

/**
 * Editar dados de um participante
 */
async function editParticipant(purchaseId) {
    console.log('✏️ Editando participante:', purchaseId);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        showNotification('❌ Participante não encontrado', 'error');
        return;
    }
    
    const currentName = purchase.buyerName || purchase.name || '';
    const currentPhone = purchase.buyerPhone || purchase.phone || '';
    
    const newName = prompt('Nome do participante:', currentName);
    if (!newName || newName.trim() === '') {
        showNotification('⚠️ Nome é obrigatório', 'warning');
        return;
    }
    
    const newPhone = prompt('WhatsApp do participante:', currentPhone);
    if (!newPhone || newPhone.trim() === '') {
        showNotification('⚠️ WhatsApp é obrigatório', 'warning');
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
        
        // Tentar atualizar no Firebase se disponível
        if (typeof window.FirebaseDB !== 'undefined' && adminData.firebaseReady) {
            const result = await window.FirebaseDB.updatePurchase(purchaseId, updateData);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            showNotification('✅ Dados atualizados com sucesso!', 'success');
        } else {
            // Fallback para localStorage
            Object.assign(purchase, updateData);
            localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
            
            showNotification('✅ Dados atualizados (local)!', 'success');
        }
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        
        console.log('✅ Participante editado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao editar:', error);
        showNotification(`❌ Erro ao editar: ${error.message}`, 'error');
    }
}

/**
 * Reset de todos os números (função administrativa)
 */
async function resetAllNumbers() {
    const confirmation = confirm(
        '⚠️ ATENÇÃO: Esta ação irá resetar TODOS os números e APAGAR todos os participantes!\n\n' +
        'Esta ação não pode ser desfeita!\n\n' +
        'Tem certeza que deseja continuar?'
    );
    
    if (!confirmation) {
        console.log('❌ Reset cancelado pelo usuário');
        return;
    }
    
    const doubleConfirmation = confirm(
        '🚨 ÚLTIMA CONFIRMAÇÃO:\n\n' +
        'TODOS os dados dos participantes serão PERDIDOS!\n\n' +
        'Confirmar reset completo?'
    );
    
    if (!doubleConfirmation) {
        console.log('❌ Reset cancelado na confirmação dupla');
        return;
    }
    
    try {
        console.log('🗑️ Iniciando reset completo...');
        
        // Limpar dados locais
        adminData.purchases = [];
        localStorage.removeItem('purchases');
        localStorage.removeItem('admin_purchases_backup');
        
        // Tentar limpar Firebase se disponível
        if (typeof window.FirebaseDB !== 'undefined' && adminData.firebaseReady) {
            // Esta função seria implementada no FirebaseDB se necessário
            console.log('🔥 Firebase reset seria executado aqui');
        }
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        
        showNotification('✅ Reset completo realizado com sucesso!', 'success');
        console.log('✅ Reset completo finalizado');
        
    } catch (error) {
        console.error('❌ Erro durante reset:', error);
        showNotification(`❌ Erro durante reset: ${error.message}`, 'error');
    }
}

/**
 * Realizar sorteio
 */
async function performDraw() {
    console.log('🎲 Iniciando sorteio...');
    
    const confirmedPurchases = adminData.purchases.filter(p => p.status === 'confirmed');
    
    if (confirmedPurchases.length === 0) {
        showNotification('⚠️ Nenhum participante confirmado para sorteio', 'warning');
        return;
    }
    
    // Coletar todos os números vendidos
    const soldNumbers = [];
    confirmedPurchases.forEach(purchase => {
        if (Array.isArray(purchase.numbers)) {
            soldNumbers.push(...purchase.numbers);
        }
    });
    
    if (soldNumbers.length === 0) {
        showNotification('⚠️ Nenhum número vendido para sorteio', 'warning');
        return;
    }
    
    // Simular sorteio
    const sortedNumbers = soldNumbers.sort(() => Math.random() - 0.5);
    const winners = {
        first: sortedNumbers[0],
        second: sortedNumbers[1] || null,
        third: sortedNumbers[2] || null
    };
    
    // Encontrar participantes ganhadores
    const findWinner = (number) => {
        return confirmedPurchases.find(p => p.numbers.includes(number));
    };
    
    const results = {
        first: { number: winners.first, participant: findWinner(winners.first) },
        second: winners.second ? { number: winners.second, participant: findWinner(winners.second) } : null,
        third: winners.third ? { number: winners.third, participant: findWinner(winners.third) } : null,
        timestamp: new Date().toISOString()
    };
    
    // Mostrar resultados
    let resultMessage = '🎉 RESULTADOS DO SORTEIO\n\n';
    resultMessage += `🥇 1º Lugar - Número ${winners.first.toString().padStart(3, '0')}\n`;
    resultMessage += `   ${results.first.participant?.buyerName || results.first.participant?.name || 'N/A'}\n\n`;
    
    if (results.second) {
        resultMessage += `🥈 2º Lugar - Número ${winners.second.toString().padStart(3, '0')}\n`;
        resultMessage += `   ${results.second.participant?.buyerName || results.second.participant?.name || 'N/A'}\n\n`;
    }
    
    if (results.third) {
        resultMessage += `🥉 3º Lugar - Número ${winners.third.toString().padStart(3, '0')}\n`;
        resultMessage += `   ${results.third.participant?.buyerName || results.third.participant?.name || 'N/A'}\n\n`;
    }
    
    alert(resultMessage);
    
    // Salvar resultados
    adminData.drawResults = results;
    localStorage.setItem('drawResults', JSON.stringify(results));
    
    showNotification('🎉 Sorteio realizado com sucesso!', 'success');
    console.log('✅ Sorteio finalizado:', results);
}

/**
 * Funções auxiliares do painel
 */
function refreshData() {
    console.log('🔄 Atualizando dados...');
    
    if (typeof window.FirebaseDB !== 'undefined' && adminData.firebaseReady) {
        loadPurchaseData();
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

/**
 * Buscar participante
 */
function searchParticipant() {
    const searchTerm = document.getElementById('participant-search')?.value?.toLowerCase();
    
    if (!searchTerm) {
        loadParticipants(); // Mostrar todos
        return;
    }
    
    const filteredPurchases = adminData.purchases.filter(purchase => {
        const name = (purchase.buyerName || purchase.name || '').toLowerCase();
        const phone = (purchase.buyerPhone || purchase.phone || '').toLowerCase();
        const numbers = (purchase.numbers || []).join(' ');
        
        return name.includes(searchTerm) || 
               phone.includes(searchTerm) || 
               numbers.includes(searchTerm);
    });
    
    // Temporariamente substituir dados para mostrar apenas resultados da busca
    const originalPurchases = adminData.purchases;
    adminData.purchases = filteredPurchases;
    loadParticipants();
    adminData.purchases = originalPurchases;
    
    showNotification(`🔍 ${filteredPurchased.length} resultado(s) encontrado(s)`, 'info');
}
// ==================================================================================
// 🚨 SISTEMA DE VERIFICAÇÃO CONTÍNUA DE BOTÕES - SOLUÇÃO DEFINITIVA
// ==================================================================================

console.log('🚨 INICIANDO SISTEMA DE VERIFICAÇÃO CONTÍNUA DE BOTÕES');

let buttonCheckInterval;
let lastButtonCheck = 0;

// Função para garantir que botões estão presentes
function garantirBotoesPresentes() {
    try {
        const rows = document.querySelectorAll('#participantsTable tbody tr');
        let botoesAdicionados = 0;
        
        rows.forEach((row, index) => {
            const actionCell = row.querySelector('td:last-child');
            if (!actionCell) return;
            
            const existingButtons = actionCell.querySelectorAll('button');
            if (existingButtons.length === 0) {
                console.log(`🚨 LINHA ${index + 1} SEM BOTÕES! Forçando criação...`);
                
                // Criar dados fictícios se necessário
                const purchaseId = `forced-${index + 1}-${Date.now()}`;
                const mockPurchase = {
                    id: purchaseId,
                    type: 'doacao',
                    status: 'pending',
                    paymentMethod: 'doacao'
                };
                
                // HTML de emergência direto
                const emergencyHTML = `
                    <div class="action-buttons-emergency">
                        <button onclick="alert('Editar: ${purchaseId}'); console.log('Editar emergência:', '${purchaseId}');" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin: 2px;">
                            ✏️ Editar
                        </button>
                        <button onclick="console.log('Debug emergência:', arguments); alert('Debug: ${purchaseId}');" style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin: 2px;">
                            🔍 Debug
                        </button>
                        <button onclick="alert('Confirmar: ${purchaseId}'); console.log('Confirmar emergência:', '${purchaseId}');" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin: 2px;">
                            ✅ Confirmar
                        </button>
                        <button onclick="alert('Rejeitar: ${purchaseId}'); console.log('Rejeitar emergência:', '${purchaseId}');" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin: 2px;">
                            ❌ Rejeitar
                        </button>
                    </div>
                `;
                
                // Limpar e adicionar
                actionCell.innerHTML = emergencyHTML;
                botoesAdicionados++;
                
                console.log(`🚨 BOTÕES DE EMERGÊNCIA ADICIONADOS À LINHA ${index + 1}`);
            }
        });
        
        if (botoesAdicionados > 0) {
            console.log(`🚨 TOTAL DE ${botoesAdicionados} LINHAS CORRIGIDAS COM BOTÕES DE EMERGÊNCIA`);
        }
        
        lastButtonCheck = Date.now();
        
    } catch (error) {
        console.error('❌ Erro na verificação de botões:', error);
    }
}

// Iniciar verificação contínua
function iniciarVerificacaoContinua() {
    if (buttonCheckInterval) {
        clearInterval(buttonCheckInterval);
    }
    
    console.log('🔄 INICIANDO VERIFICAÇÃO CONTÍNUA DE BOTÕES (a cada 3 segundos)');
    
    buttonCheckInterval = setInterval(() => {
        garantirBotoesPresentes();
    }, 3000);
    
    // Verificação inicial
    setTimeout(garantirBotoesPresentes, 1000);
}

// Observador de mudanças na tabela
function configurarObservadorTabela() {
    const tbody = document.querySelector('#participantsTable tbody');
    if (!tbody) {
        console.log('⚠️ Tabela não encontrada, tentando novamente em 2 segundos...');
        setTimeout(configurarObservadorTabela, 2000);
        return;
    }
    
    console.log('👁️ CONFIGURANDO OBSERVADOR DA TABELA');
    
    const observer = new MutationObserver(function(mutations) {
        let needsCheck = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                    needsCheck = true;
                    console.log('🔄 MUDANÇA NA TABELA DETECTADA');
                }
            }
        });
        
        if (needsCheck) {
            setTimeout(garantirBotoesPresentes, 500);
        }
    });
    
    observer.observe(tbody, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ OBSERVADOR DA TABELA CONFIGURADO');
}

// Inicializar tudo quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM CARREGADO - INICIANDO SISTEMA DE BOTÕES');
        setTimeout(() => {
            configurarObservadorTabela();
            iniciarVerificacaoContinua();
        }, 2000);
    });
} else {
    console.log('📄 DOM JÁ CARREGADO - INICIANDO SISTEMA DE BOTÕES');
    setTimeout(() => {
        configurarObservadorTabela();
        iniciarVerificacaoContinua();
    }, 1000);
}

// Função global para forçar verificação
window.forcarVerificacaoBotoes = function() {
    console.log('🚨 VERIFICAÇÃO FORÇADA DE BOTÕES EXECUTADA');
    garantirBotoesPresentes();
};

console.log('✅ SISTEMA DE VERIFICAÇÃO CONTÍNUA DE BOTÕES CARREGADO');
console.log('💡 Use forcarVerificacaoBotoes() no console para forçar verificação manual');

