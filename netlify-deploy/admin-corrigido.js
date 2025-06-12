// Admin.js - Sistema Administrativo Corrigido
// Dados administrativos - Chá de Bebê Thomas
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

let currentPage = 1;
const itemsPerPage = 10;

// Aguardar o sistema administrativo estar pronto
window.addEventListener('adminSystemReady', (event) => {
    console.log('✅ Sistema administrativo pronto, inicializando painel...', event.detail.user.email);
    adminData.currentUser = event.detail.user;
    initializeAdminPanel();
});

// Função principal de inicialização do painel
async function initializeAdminPanel() {
    console.log('🚀 Inicializando painel administrativo...');
    
    try {
        // Verificar se Firebase está disponível
        if (typeof window.FirebaseDB === 'undefined') {
            console.error('❌ FirebaseDB não está disponível');
            return;
        }
        
        adminData.firebaseReady = true;
        
        // Carregar dados iniciais
        await loadAdminData();
        
        // Configurar listeners
        setupFirebaseListeners();
        
        // Configurar eventos da interface
        setupInterfaceEvents();
        
        // Atualizar estatísticas
        updateStats();
        
        console.log('✅ Painel administrativo inicializado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar painel administrativo:', error);
    }
}

// Carregar dados administrativos
async function loadAdminData() {
    console.log('📊 Carregando dados administrativos...');
    
    try {
        // Carregar configurações
        const configResult = await window.FirebaseDB.loadConfig();
        if (configResult.success) {
            adminData.config = { ...adminData.config, ...configResult.data };
            console.log('✅ Configurações carregadas');
        }
        
        // Carregar compras
        const purchasesResult = await window.FirebaseDB.loadPurchases();
        if (purchasesResult.success) {
            adminData.purchases = purchasesResult.data;
            console.log(`✅ ${adminData.purchases.length} compras carregadas`);
        }
        
        // Atualizar interface
        updateConfigForm();
        updateParticipantsTable();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
}

// Configurar listeners do Firebase
function setupFirebaseListeners() {
    console.log('👂 Configurando listeners do Firebase...');
    
    try {
        // Listener para compras
        adminData.unsubscribe = window.FirebaseDB.listenToChanges('purchases', (data) => {
            console.log(`🔄 Dados atualizados: ${data.length} compras`);
            adminData.purchases = data;
            updateParticipantsTable();
            updateStats();
        });
        
        console.log('✅ Listeners configurados');
    } catch (error) {
        console.error('❌ Erro ao configurar listeners:', error);
    }
}

// Configurar eventos da interface
function setupInterfaceEvents() {
    console.log('🎯 Configurando eventos da interface...');
    
    // Formulário de configurações
    const configForm = document.getElementById('config-form');
    if (configForm) {
        configForm.addEventListener('submit', saveConfiguration);
    }
    
    // Campo de busca de participantes
    const searchInput = document.getElementById('search-participant');
    if (searchInput) {
        searchInput.addEventListener('input', filterParticipants);
    }
    
    // Filtro de status
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterParticipants);
    }
    
    console.log('✅ Eventos da interface configurados');
}

// Atualizar estatísticas
function updateStats() {
    console.log('📈 Atualizando estatísticas...');
    
    try {
        const confirmedPurchases = adminData.purchases.filter(p => p.status === 'confirmed');
        
        const totalSold = confirmedPurchases.reduce((sum, p) => sum + (p.numbers ? p.numbers.length : 0), 0);
        const totalRevenue = confirmedPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const totalParticipants = confirmedPurchases.length;
        const percentageSold = ((totalSold / adminData.config.totalNumbers) * 100).toFixed(1);
        
        // Atualizar elementos da interface
        const elements = {
            'total-sold': totalSold.toString(),
            'total-revenue': `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`,
            'total-participants': totalParticipants.toString(),
            'percentage-sold': `${percentageSold}%`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        console.log(`✅ Stats: ${totalSold} vendidos, R$ ${totalRevenue.toFixed(2)}, ${totalParticipants} participantes`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar estatísticas:', error);
    }
}

// Atualizar formulário de configurações
function updateConfigForm() {
    console.log('📝 Atualizando formulário de configurações...');
    
    try {
        const config = adminData.config;
        
        const fields = {
            'config-total-numbers': config.totalNumbers,
            'config-ticket-price': config.ticketPrice,
            'config-pix-key': config.pixKey,
            'config-first-prize': config.prizes?.first || '',
            'config-second-prize': config.prizes?.second || '',
            'config-third-prize': config.prizes?.third || '',
            'config-contact-phone': config.contactPhone
        };
        
        // Data do sorteio
        if (config.drawDate) {
            const drawDate = new Date(config.drawDate.seconds ? config.drawDate.seconds * 1000 : config.drawDate);
            const drawDateElement = document.getElementById('config-draw-date');
            if (drawDateElement) {
                drawDateElement.value = drawDate.toISOString().slice(0, 16);
            }
        }
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value !== undefined) {
                element.value = value;
            }
        });
        
        console.log('✅ Formulário de configurações atualizado');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar formulário:', error);
    }
}

// Atualizar tabela de participantes
function updateParticipantsTable() {
    console.log('📋 Atualizando tabela de participantes...');
    
    try {
        const tbody = document.getElementById('participants-tbody');
        if (!tbody) {
            console.warn('⚠️ Tabela de participantes não encontrada');
            return;
        }
        
        const filteredPurchases = getFilteredPurchases();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex);
        
        tbody.innerHTML = paginatedPurchases.map(purchase => {
            const statusClass = getStatusClass(purchase.status);
            const formattedDate = formatDate(purchase.timestamp);
            const numbersDisplay = formatNumbers(purchase.numbers);
            
            return `
                <tr>
                    <td><strong>${purchase.buyerName || 'N/A'}</strong></td>
                    <td>${purchase.buyerPhone || 'N/A'}</td>
                    <td>${numbersDisplay}</td>
                    <td>R$ ${(purchase.totalAmount || 0).toFixed(2).replace('.', ',')}</td>
                    <td><span class="status-badge ${statusClass}">${getStatusText(purchase.status)}</span></td>
                    <td>${formattedDate}</td>
                    <td>
                        <div class="action-buttons">
                            ${purchase.status === 'pending' ? `<button onclick="confirmPurchase('${purchase.id}')" class="btn-confirm" title="Confirmar">✓</button>` : ''}
                            ${purchase.status === 'pending' ? `<button onclick="cancelPurchase('${purchase.id}')" class="btn-cancel" title="Cancelar">✗</button>` : ''}
                            <button onclick="viewPurchaseDetails('${purchase.id}')" class="btn-view" title="Ver Detalhes">👁</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        updatePagination(filteredPurchases.length);
        
        console.log(`✅ Tabela atualizada com ${paginatedPurchases.length} itens`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar tabela:', error);
    }
}

// Funções auxiliares para a tabela
function getFilteredPurchases() {
    const searchTerm = document.getElementById('search-participant')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || 'all';
    
    return adminData.purchases.filter(purchase => {
        const matchesSearch = !searchTerm || 
            (purchase.buyerName && purchase.buyerName.toLowerCase().includes(searchTerm)) ||
            (purchase.buyerPhone && purchase.buyerPhone.includes(searchTerm));
        
        const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
}

function getStatusClass(status) {
    const classes = {
        'confirmed': 'status-confirmed',
        'pending': 'status-pending',
        'cancelled': 'status-cancelled'
    };
    return classes[status] || 'status-unknown';
}

function getStatusText(status) {
    const texts = {
        'confirmed': 'Confirmado',
        'pending': 'Pendente',
        'cancelled': 'Cancelado'
    };
    return texts[status] || 'Desconhecido';
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatNumbers(numbers) {
    if (!numbers || !Array.isArray(numbers)) return 'N/A';
    
    if (numbers.length <= 3) {
        return numbers.join(', ');
    }
    
    return `${numbers.slice(0, 3).join(', ')} (+${numbers.length - 3})`;
}

// Atualizar paginação
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (pageInfo) {
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

// Funções de ação
function changePage(direction) {
    const filteredPurchases = getFilteredPurchases();
    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
    
    currentPage += direction;
    
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    updateParticipantsTable();
}

function filterParticipants() {
    currentPage = 1;
    updateParticipantsTable();
}

// Salvar configurações
async function saveConfiguration(event) {
    event.preventDefault();
    
    console.log('💾 Salvando configurações...');
    
    try {
        const formData = new FormData(event.target);
        const config = {
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
        
        const result = await window.FirebaseDB.saveConfig(config);
        
        if (result.success) {
            adminData.config = { ...adminData.config, ...config };
            alert('✅ Configurações salvas com sucesso!');
            console.log('✅ Configurações salvas');
        } else {
            alert('❌ Erro ao salvar configurações: ' + result.error);
            console.error('❌ Erro ao salvar:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        alert('❌ Erro inesperado: ' + error.message);
    }
}

// Confirmar compra
async function confirmPurchase(purchaseId) {
    if (!confirm('Confirmar esta compra?')) return;
    
    console.log(`✅ Confirmando compra: ${purchaseId}`);
    
    try {
        const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'confirmed');
        
        if (result.success) {
            console.log('✅ Compra confirmada');
        } else {
            alert('❌ Erro ao confirmar compra: ' + result.error);
        }
        
    } catch (error) {
        console.error('❌ Erro ao confirmar compra:', error);
        alert('❌ Erro inesperado: ' + error.message);
    }
}

// Cancelar compra
async function cancelPurchase(purchaseId) {
    if (!confirm('Cancelar esta compra? Esta ação não pode ser desfeita.')) return;
    
    console.log(`❌ Cancelando compra: ${purchaseId}`);
    
    try {
        const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'cancelled');
        
        if (result.success) {
            console.log('✅ Compra cancelada');
        } else {
            alert('❌ Erro ao cancelar compra: ' + result.error);
        }
        
    } catch (error) {
        console.error('❌ Erro ao cancelar compra:', error);
        alert('❌ Erro inesperado: ' + error.message);
    }
}

// Ver detalhes da compra
function viewPurchaseDetails(purchaseId) {
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Compra não encontrada');
        return;
    }
    
    const modal = document.getElementById('action-modal');
    const title = document.getElementById('action-modal-title');
    const body = document.getElementById('action-modal-body');
    
    title.textContent = 'Detalhes da Compra';
    body.innerHTML = `
        <div class="purchase-details">
            <h3>👤 Informações do Comprador</h3>
            <p><strong>Nome:</strong> ${purchase.buyerName || 'N/A'}</p>
            <p><strong>WhatsApp:</strong> ${purchase.buyerPhone || 'N/A'}</p>
            
            <h3>🎫 Detalhes da Compra</h3>
            <p><strong>Números:</strong> ${purchase.numbers ? purchase.numbers.join(', ') : 'N/A'}</p>
            <p><strong>Quantidade:</strong> ${purchase.numbers ? purchase.numbers.length : 0}</p>
            <p><strong>Valor Total:</strong> R$ ${(purchase.totalAmount || 0).toFixed(2).replace('.', ',')}</p>
            <p><strong>Status:</strong> ${getStatusText(purchase.status)}</p>
            <p><strong>Data:</strong> ${formatDate(purchase.timestamp)}</p>
            
            ${purchase.paymentProof ? `
                <h3>💳 Comprovante de Pagamento</h3>
                <img src="${purchase.paymentProof}" alt="Comprovante" style="max-width: 100%; height: auto; border-radius: 5px;">
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Fechar modal
function closeActionModal() {
    document.getElementById('action-modal').style.display = 'none';
}

// Atualizar dados
async function refreshData() {
    console.log('🔄 Atualizando dados...');
    await loadAdminData();
    updateStats();
    alert('✅ Dados atualizados!');
}

// Exportar dados
function exportData() {
    console.log('📊 Exportando dados...');
    
    try {
        const data = {
            config: adminData.config,
            purchases: adminData.purchases,
            stats: {
                totalSold: adminData.purchases.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (p.numbers ? p.numbers.length : 0), 0),
                totalRevenue: adminData.purchases.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (p.totalAmount || 0), 0),
                totalParticipants: adminData.purchases.filter(p => p.status === 'confirmed').length
            },
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rifa-thomas-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Dados exportados');
        
    } catch (error) {
        console.error('❌ Erro ao exportar dados:', error);
        alert('❌ Erro ao exportar: ' + error.message);
    }
}

// Funções de sorteio (simplificadas)
function openDrawModal() {
    document.getElementById('draw-modal').style.display = 'block';
}

function closeDrawModal() {
    document.getElementById('draw-modal').style.display = 'none';
}

function startDraw() {
    alert('🎉 Funcionalidade de sorteio em desenvolvimento!');
}

// Funções de zona de perigo
function resetAllNumbers() {
    if (!confirm('⚠️ ATENÇÃO: Isso irá resetar todos os números vendidos. Esta ação é IRREVERSÍVEL. Tem certeza?')) return;
    if (!confirm('🚨 ÚLTIMA CONFIRMAÇÃO: Todos os dados de vendas serão perdidos. Continuar?')) return;
    
    alert('🔧 Funcionalidade em desenvolvimento - contate o desenvolvedor');
}

function clearAllData() {
    if (!confirm('🚨 PERIGO: Isso irá apagar TODOS os dados da rifa. Esta ação é IRREVERSÍVEL. Tem certeza?')) return;
    if (!confirm('⚠️ ÚLTIMA CHANCE: Todos os dados serão perdidos permanentemente. Continuar?')) return;
    
    alert('🔧 Funcionalidade em desenvolvimento - contate o desenvolvedor');
}

// Cleanup quando sair da página
window.addEventListener('beforeunload', () => {
    if (adminData.unsubscribe) {
        adminData.unsubscribe();
        console.log('🧹 Listeners do Firebase desconectados');
    }
});

console.log('📄 Admin.js corrigido carregado - aguardando sistema estar pronto...');
