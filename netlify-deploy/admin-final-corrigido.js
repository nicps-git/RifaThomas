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
        const purchasesResult = await window.FirebaseDB.getPurchases();
        if (purchasesResult.success) {
            adminData.purchases = purchasesResult.data;
            console.log(`✅ ${purchasesResult.data.length} compras carregadas`);
        }
        
        // Carregar configurações
        const configResult = await window.FirebaseDB.getConfig();
        if (configResult.success) {
            adminData.config = { ...adminData.config, ...configResult.data };
            console.log('✅ Configurações carregadas');
        }
        
        // Configurar listeners
        setupEventListeners();
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        loadConfiguration();
        
        // Escutar mudanças em tempo real
        window.FirebaseDB.onPurchasesChange((purchases) => {
            console.log('🔄 Dados atualizados em tempo real');
            adminData.purchases = purchases;
            loadParticipants();
            updateDashboard();
        });
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
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
                </td>
            </tr>
        `;
        return;
    }
    
    filteredPurchases.forEach(purchase => {
        const row = createParticipantRow(purchase);
        tbody.appendChild(row);
    });
    
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
    console.log(`✅ Confirmando doação: ${purchaseId}`);
    
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Compra não encontrada!');
        return;
    }
    
    const buyerName = purchase.buyerName || purchase.name || 'Comprador';
    const confirmMessage = `Confirmar doação de ${buyerName}?\n\nNúmeros: ${purchase.numbers.join(', ')}\nTotal: R$ ${purchase.totalAmount.toFixed(2)}`;
    
    if (confirm(confirmMessage)) {
        try {
            const additionalData = {
                confirmedAt: new Date().toISOString(),
                confirmedBy: adminData.currentUser.uid
            };
            
            const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'confirmed', additionalData);
            
            if (result.success) {
                showNotification('✅ Doação confirmada com sucesso!', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Erro ao confirmar:', error);
            showNotification(`Erro ao confirmar doação: ${error.message}`, 'error');
        }
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
            const additionalData = {
                rejectedAt: new Date().toISOString(),
                rejectionReason: reason,
                rejectedBy: adminData.currentUser.uid
            };
            
            const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'rejected', additionalData);
            
            if (result.success) {
                showNotification('❌ Doação rejeitada. Números liberados.', 'warning');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Erro ao rejeitar:', error);
            showNotification(`Erro ao rejeitar doação: ${error.message}`, 'error');
        }
    }
}

// Filtrar participantes
function filterParticipants(status) {
    console.log(`🔍 Aplicando filtro: ${status}`);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('filter-' + status).classList.add('active');
    
    loadParticipants(status);
}

// Atualizar dashboard
function updateDashboard() {
    const totalSold = getTotalSoldNumbers();
    const totalRevenue = getTotalRevenue();
    const totalParticipants = adminData.purchases.length;
    const completionRate = ((totalSold / adminData.config.totalNumbers) * 100).toFixed(1);
    
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

// Editar participante
async function editParticipant(purchaseId) {
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
            name: newName.trim(),
            phone: newPhone.trim(),
            updatedAt: new Date().toISOString()
        };
        
        const result = await window.FirebaseDB.updatePurchase(purchaseId, updateData);
        if (!result.success) {
            throw new Error(result.error);
        }
        
        showNotification('✅ Dados atualizados com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao editar:', error);
        showNotification('Erro ao editar participante: ' + error.message, 'error');
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

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    
    const iconClass = type === 'success' ? 'check' : (type === 'error' ? 'times' : 'exclamation');
    notification.innerHTML = '<i class="fas fa-' + iconClass + '"></i> ' + message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => { 
            if (notification.parentNode) {
                document.body.removeChild(notification); 
            }
        }, 300);
    }, 3000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Logs finais
console.log('✅ Admin.js carregado - aguardando inicialização ÚNICA');
