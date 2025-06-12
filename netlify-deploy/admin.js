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

// Inicializar painel administrativo - VERSÃO CORRIGIDA
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 [CORRIGIDO] Admin.js carregado');
    
    // Aguardar o novo evento do sistema corrigido
    window.addEventListener('adminSystemReady', (event) => {
        console.log('✅ [CORRIGIDO] Sistema administrativo pronto, inicializando...', event.detail.user.email);
        adminData.currentUser = event.detail.user;
        initializeAdmin();
    });
    
    // Fallback para compatibilidade com versão antiga
    window.addEventListener('adminReady', (event) => {
        console.log('✅ [FALLBACK] Evento antigo recebido, inicializando...', event.detail.user.email);
        adminData.currentUser = event.detail.user;
        initializeAdmin();
    });
    
    // Timeout de segurança mais longo
    setTimeout(() => {
        if (!adminData.firebaseReady && typeof window.FirebaseDB !== 'undefined') {
            console.log('⏰ [CORRIGIDO] Timeout - tentando inicializar com verificação...');
            verifyAndInitialize();
        }
    }, 20000);
});

// Função auxiliar de verificação e inicialização
async function verifyAndInitialize() {
    try {
        if (typeof window.FirebaseDB === 'undefined') {
            console.error('❌ Firebase não disponível após timeout');
            return;
        }
        
        const result = await window.FirebaseDB.getCurrentAdmin();
        if (result.success && result.isAdmin) {
            console.log('✅ [TIMEOUT] Verificação bem-sucedida, inicializando...');
            adminData.currentUser = result.user;
            initializeAdmin();
        } else {
            console.log('❌ [TIMEOUT] Usuário não é admin válido');
        }
    } catch (error) {
        console.error('❌ [TIMEOUT] Erro na verificação:', error);
    }
}

// Função para inicializar o admin (renomeada)
function initializeAdmin() {
    // Aguardar Firebase estar pronto
    if (typeof window.FirebaseDB !== 'undefined') {
        initializeAdminWithFirebase();
    } else {
        // Aguardar evento firebaseReady
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
        console.log('🔥 Inicializando Firebase admin...');
        
        // A autenticação já foi verificada no admin.html
        // Então podemos pular direto para carregar os dados
        
        // Obter usuário atual (já sabemos que é admin)
        const currentAdmin = await window.FirebaseDB.getCurrentAdmin();
        if (currentAdmin.success) {
            adminData.currentUser = currentAdmin.user;
            console.log('✅ Usuário admin confirmado:', currentAdmin.user.email);
        }
        
        adminData.firebaseReady = true;
        
        adminData.currentUser = user;
        adminData.firebaseReady = true;
        
        // Carregar dados do Firebase
        await loadDataFromFirebase();
        
        // Escutar mudanças em tempo real
        adminData.unsubscribe = window.FirebaseDB.onPurchasesChange((purchases) => {
            adminData.purchases = purchases;
            loadParticipants();
            updateDashboard();
        });
        
        console.log('🔥 Admin Firebase conectado!');
        
    } catch (error) {
        console.error('Erro ao inicializar Firebase admin:', error);
        redirectToLogin();
    }
}

// Redirecionar para login
function redirectToLogin() {
    window.location.href = 'login.html';
}

// Carregar dados do Firebase
async function loadDataFromFirebase() {
    try {
        // Carregar compras
        const purchasesResult = await window.FirebaseDB.getPurchases();
        if (purchasesResult.success) {
            adminData.purchases = purchasesResult.data;
        }
        
        // Carregar configurações
        const configResult = await window.FirebaseDB.getConfig();
        if (configResult.success) {
            adminData.config = { ...adminData.config, ...configResult.data };
        }
        
        // Carregar resultados do sorteio
        const drawResult = await window.FirebaseDB.getDrawResults();
        if (drawResult.success) {
            adminData.drawResults = drawResult.data;
        }
        
        // Atualizar interface
        loadParticipants();
        updateDashboard();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Inicializar configurações do admin
function initializeAdmin() {
    // Verificar autenticação (simplificado para demonstração)
    if (!localStorage.getItem('adminAuth')) {
        const password = prompt('Digite a senha do administrador:');
        if (password === 'admin123') {
            localStorage.setItem('adminAuth', 'true');
        } else {
            alert('Senha incorreta!');
            window.location.href = 'index.html';
            return;
        }
    }
}

// Carregar dados administrativos
function loadAdminData() {
    // Carregar compras
    const purchases = localStorage.getItem('purchases');
    if (purchases) {
        adminData.purchases = JSON.parse(purchases);
        ensurePurchaseIds(); // Garantir que todas as compras tenham IDs
    }
    
    // Carregar configurações
    const config = localStorage.getItem('adminConfig');
    if (config) {
        adminData.config = { ...adminData.config, ...JSON.parse(config) };
    }
    
    // Carregar resultados do sorteio
    const drawResults = localStorage.getItem('drawResults');
    if (drawResults) {
        adminData.drawResults = JSON.parse(drawResults);
    }
}

// Configurar event listeners do admin
function setupAdminEventListeners() {
    // Formulário de configuração
    document.getElementById('config-form').addEventListener('submit', saveConfiguration);
    
    // Smooth scrolling para links do admin
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

// Atualizar dashboard
function updateDashboard() {
    const totalSold = getTotalSoldNumbers();
    const totalRevenue = getTotalRevenue();
    const totalParticipants = adminData.purchases.length;
    const completionRate = ((totalSold / adminData.config.totalNumbers) * 100).toFixed(1);
    
    document.getElementById('total-sold').textContent = totalSold;
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('total-participants').textContent = totalParticipants;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    
    // Atualizar barra de progresso
    const progressBar = document.getElementById('admin-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${completionRate}%`;
    }
    
    document.getElementById('progress-sold').textContent = totalSold;
    document.getElementById('progress-total').textContent = adminData.config.totalNumbers;
}

// Obter total de números vendidos (apenas confirmados)
function getTotalSoldNumbers() {
    return adminData.purchases.reduce((total, purchase) => {
        if (purchase.status === 'confirmed' || !purchase.status) {
            return total + purchase.numbers.length;
        }
        return total;
    }, 0);
}

// Obter receita total (apenas confirmados)
function getTotalRevenue() {
    return adminData.purchases.reduce((total, purchase) => {
        if (purchase.status === 'confirmed' || !purchase.status) {
            return total + purchase.totalAmount;
        }
        return total;
    }, 0);
}

// Carregar participantes na tabela
function loadParticipants(filter = 'all') {
    const tbody = document.getElementById('participants-tbody');
    tbody.innerHTML = '';
    
    let filteredPurchases = adminData.purchases;
    
    if (filter !== 'all') {
        filteredPurchases = adminData.purchases.filter(purchase => {
            const status = purchase.status || 'confirmed';
            return status === filter;
        });
    }
    
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
                <button class="btn-confirm" onclick="confirmDonation(${purchase.id})">
                    <i class="fas fa-check"></i> Confirmar
                </button>
                <button class="btn-reject" onclick="rejectDonation(${purchase.id})">
                    <i class="fas fa-times"></i> Rejeitar
                </button>
            </div>
        `;
    } else {
        actionButtons = `
            <div class="action-buttons">
                <button class="btn-edit" onclick="editParticipant(${purchase.id})">
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
        <td>${purchase.name}</td>
        <td>${purchase.phone}</td>
        <td title="${numbersText}">${purchase.numbers.length} números</td>
        <td>${formatCurrency(purchase.totalAmount)}</td>
        <td>${paymentDisplay}</td>
        <td>${statusBadge}</td>
        <td>${formatDate(purchase.date)}</td>
        <td>${actionButtons}</td>
    `;
      return row;
}

// Obter status do participante
function getParticipantStatus(purchase) {
    // Verificar se foi há mais de 24 horas
    const hoursAgo = (Date.now() - new Date(purchase.date).getTime()) / (1000 * 60 * 60);
    
    if (purchase.status === 'confirmed' || purchase.confirmed) {
        return { class: 'confirmed', text: 'Confirmado' };
    } else if (purchase.status === 'pending_donation') {
        return { class: 'pending', text: 'Doação Pendente' };
    } else if (purchase.status === 'rejected') {
        return { class: 'cancelled', text: 'Rejeitado' };
    } else if (hoursAgo > 24) {
        return { class: 'cancelled', text: 'Expirado' };
    } else {
        return { class: 'pending', text: 'Pendente' };
    }
}

// Carregar configurações
function loadConfiguration() {
    document.getElementById('config-total-numbers').value = adminData.config.totalNumbers;
    document.getElementById('config-ticket-price').value = adminData.config.ticketPrice;
    document.getElementById('config-draw-date').value = '2025-07-11T16:00';
    document.getElementById('config-pix-key').value = adminData.config.pixKey;
    document.getElementById('config-first-prize').value = adminData.config.prizes.first;
    document.getElementById('config-second-prize').value = adminData.config.prizes.second;
    document.getElementById('config-third-prize').value = adminData.config.prizes.third;
    document.getElementById('config-contact-phone').value = adminData.config.contactPhone;
}

// Salvar configurações (versão Firebase)
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
        
        adminData.config = { ...adminData.config, ...newConfig };
        showNotification('Configurações salvas com sucesso!', 'success');
        updateDashboard();
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showNotification('Erro ao salvar configurações: ' + error.message, 'error');
    }
}

// Adicionar botão de logout no painel admin
function addLogoutButton() {
    if (adminData.firebaseReady && adminData.currentUser) {
        const nav = document.querySelector('.nav-menu');
        if (nav && !document.getElementById('logout-btn')) {
            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = '<a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Sair</a>';
            nav.appendChild(logoutLi);
            
            document.getElementById('logout-btn').addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Deseja realmente sair do painel administrativo?')) {
                    // Fazer logout
                    if (adminData.unsubscribe) {
                        adminData.unsubscribe();
                    }
                    window.location.href = 'login.html';
                }
            });
        }
    }
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', function() {
    if (adminData.unsubscribe) {
        adminData.unsubscribe();
    }
});

// Ações rápidas
function markNumberAsSold() {
    const number = prompt('Digite o número a ser marcado como vendido (1-' + adminData.config.totalNumbers + '):');
    if (number && !isNaN(number)) {
        const num = parseInt(number);
        if (num >= 1 && num <= adminData.config.totalNumbers) {
            // Verificar se já não está vendido
            const existingPurchase = adminData.purchases.find(p => p.numbers.includes(num));
            if (existingPurchase) {
                alert('Este número já foi vendido!');
                return;
            }
            
            // Criar venda manual
            const manualSale = {
                id: Date.now(),
                name: 'Venda Manual',
                phone: '(00) 00000-0000',
                numbers: [num],
                totalAmount: adminData.config.ticketPrice,
                date: new Date().toISOString(),
                status: 'confirmed',
                paymentMethod: 'pix',
                manual: true
            };
            
            adminData.purchases.push(manualSale);
            savePurchases();
            updateDashboard();
            loadParticipants();
            
            showNotification('Número ' + num.toString().padStart(3, '0') + ' marcado como vendido!', 'success');
        } else {
            alert('Número inválido!');
        }
    }
}

function markNumberAsReserved() {
    const number = prompt('Digite o número a ser marcado como reservado:');
    if (number && !isNaN(number)) {
        const num = parseInt(number);
        if (num >= 1 && num <= adminData.config.totalNumbers) {
            // Adicionar aos números reservados na página principal
            const rifaData = JSON.parse(localStorage.getItem('rifaData') || '{}');
            if (!rifaData.reservedNumbers) rifaData.reservedNumbers = [];
            
            if (rifaData.reservedNumbers.includes(num)) {
                alert('Este número já está reservado!');
                return;
            }
            
            rifaData.reservedNumbers.push(num);
            localStorage.setItem('rifaData', JSON.stringify(rifaData));
            
            showNotification('Número ' + num.toString().padStart(3, '0') + ' marcado como reservado!', 'success');
        }
    }
}

function freeNumber() {
    const number = prompt('Digite o número a ser liberado:');
    if (number && !isNaN(number)) {
        const num = parseInt(number);
        if (num >= 1 && num <= adminData.config.totalNumbers) {
            // Remover das vendas
            const purchaseIndex = adminData.purchases.findIndex(p => p.numbers.includes(num));
            if (purchaseIndex !== -1) {
                const purchase = adminData.purchases[purchaseIndex];
                purchase.numbers = purchase.numbers.filter(n => n !== num);
                purchase.totalAmount = purchase.numbers.length * adminData.config.ticketPrice;
                
                if (purchase.numbers.length === 0) {
                    adminData.purchases.splice(purchaseIndex, 1);
                }
                
                savePurchases();
            }
            
            // Remover dos reservados
            const rifaData = JSON.parse(localStorage.getItem('rifaData') || '{}');
            if (rifaData.reservedNumbers) {
                rifaData.reservedNumbers = rifaData.reservedNumbers.filter(n => n !== num);
                localStorage.setItem('rifaData', JSON.stringify(rifaData));
            }
            
            updateDashboard();
            loadParticipants();
            
            showNotification('Número ' + num.toString().padStart(3, '0') + ' foi liberado!', 'success');
        }
    }
}

// Gerar relatório
function generateReport() {
    const report = {
        geradoEm: new Date().toLocaleString('pt-BR'),
        totalNumeros: adminData.config.totalNumbers,
        numerosVendidos: getTotalSoldNumbers(),
        receitaTotal: getTotalRevenue(),
        totalParticipantes: adminData.purchases.length,
        percentualVendido: ((getTotalSoldNumbers() / adminData.config.totalNumbers) * 100).toFixed(2),
        participantes: adminData.purchases.map(p => ({
            nome: p.name,
            whatsapp: p.phone,
            email: p.email,
            cpf: p.cpf,
            numeros: p.numbers.join(', '),
            total: p.totalAmount,
            data: new Date(p.date).toLocaleString('pt-BR'),
            status: getParticipantStatus(p).text
        }))
    };
      // Criar e baixar arquivo
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'relatorio-rifa-' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Relatório gerado com sucesso!', 'success');
}

// Realizar sorteio
function performDraw() {
    const soldNumbers = [];
    adminData.purchases.forEach(purchase => {
        if (purchase.confirmed !== false) {
            soldNumbers.push(...purchase.numbers);
        }
    });
    
    if (soldNumbers.length < 3) {
        alert('É necessário ter pelo menos 3 números vendidos para realizar o sorteio!');
        return;
    }
    
    document.getElementById('draw-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Iniciar sorteio
function startDraw() {
    const soldNumbers = [];
    adminData.purchases.forEach(purchase => {
        if (purchase.confirmed !== false) {
            soldNumbers.push(...purchase.numbers);
        }
    });
    
    if (soldNumbers.length < 3) {
        alert('Números insuficientes para o sorteio!');
        return;
    }
    
    // Embaralhar números
    const shuffled = [...soldNumbers].sort(() => Math.random() - 0.5);
    
    // Selecionar vencedores
    const winners = {
        first: shuffled[0],
        second: shuffled[1],
        third: shuffled[2]
    };
    
    // Animar sorteio
    animateDraw(winners);
}

// Animar sorteio
function animateDraw(winners) {
    const positions = ['first-place', 'second-place', 'third-place'];
    const winnerNumbers = [winners.first, winners.second, winners.third];
    
    document.getElementById('start-draw-btn').disabled = true;
    document.getElementById('start-draw-btn').innerHTML = '<span class="loading"></span> Sorteando...';
    
    let completed = 0;
    
    positions.forEach((positionId, index) => {
        const element = document.getElementById(positionId);
        let counter = 0;
        
        const interval = setInterval(() => {
            const randomNum = Math.floor(Math.random() * adminData.config.totalNumbers) + 1;
            element.textContent = randomNum.toString().padStart(3, '0');
            counter++;
            
            if (counter > 30 + (index * 10)) {
                clearInterval(interval);
                element.textContent = winnerNumbers[index].toString().padStart(3, '0');
                element.classList.add('winner');
                
                completed++;
                if (completed === 3) {
                    finishDraw(winners);
                }
            }
        }, 100);
    });
}

// Finalizar sorteio
function finishDraw(winners) {
    adminData.drawResults = {
        date: new Date().toISOString(),
        winners: winners,
        participants: adminData.purchases.map(p => ({
            name: p.name,
            numbers: p.numbers,
            isWinner: p.numbers.includes(winners.first) || 
                     p.numbers.includes(winners.second) || 
                     p.numbers.includes(winners.third)
        }))
    };
    
    // Mostrar resultados
    document.getElementById('draw-results').style.display = 'block';
    displayWinners(winners);
    
    document.getElementById('start-draw-btn').style.display = 'none';
}

// Exibir vencedores
function displayWinners(winners) {
    const winnersList = document.getElementById('winners-list');
    winnersList.innerHTML = '';
    
    const prizes = ['1º Lugar', '2º Lugar', '3º Lugar'];
    const prizeValues = [
        adminData.config.prizes.first,
        adminData.config.prizes.second,
        adminData.config.prizes.third
    ];
    const winnerNumbers = [winners.first, winners.second, winners.third];
    
    winnerNumbers.forEach((number, index) => {
        const winner = findParticipantByNumber(number);
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'winner-item';
        winnerDiv.innerHTML = `            <div>
                <strong>' + prizes[index] + '</strong> - Número ' + number.toString().padStart(3, '0') + '<br>
                <span>' + (winner ? winner.name : 'Participante não encontrado') + '</span>
            </div>
            <div><strong>' + prizeValues[index] + '</strong></div>
        `;
        winnersList.appendChild(winnerDiv);
    });
}

// Encontrar participante por número
function findParticipantByNumber(number) {
    return adminData.purchases.find(p => p.numbers.includes(number));
}

// Salvar resultados do sorteio
function saveDrawResults() {
    localStorage.setItem('drawResults', JSON.stringify(adminData.drawResults));
    closeDrawModal();
    showNotification('Resultados do sorteio salvos com sucesso!', 'success');
}

// Exportar participantes
function exportParticipants() {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'participantes-rifa-' + new Date().toISOString().split('T')[0] + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    showNotification('Lista de participantes exportada!', 'success');
}

// Gerar CSV
function generateCSV() {
    const headers = ['Nome', 'WhatsApp', 'Email', 'CPF', 'Números', 'Total', 'Data', 'Status'];
    const rows = adminData.purchases.map(p => [
        p.name,
        p.phone,
        p.email,
        p.cpf,
        p.numbers.join(';'),
        p.totalAmount,
        new Date(p.date).toLocaleString('pt-BR'),
        getParticipantStatus(p).text
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return '\ufeff' + csvContent; // BOM para UTF-8
}

// Resetar números
function resetAllNumbers() {
    if (confirm('ATENÇÃO: Esta ação irá liberar todos os números vendidos e reservados. Deseja continuar?')) {
        if (confirm('Tem certeza? Esta ação não pode ser desfeita!')) {
            localStorage.removeItem('rifaData');
            localStorage.removeItem('purchases');
            adminData.purchases = [];
            
            updateDashboard();
            loadParticipants();
            
            showNotification('Todos os números foram resetados!', 'warning');
        }
    }
}

// Limpar todos os dados
function clearAllData() {
    if (confirm('ATENÇÃO: Esta ação irá apagar TODOS os dados da rifa (participantes, configurações, etc.). Deseja continuar?')) {
        if (confirm('TEM CERTEZA? Esta ação é IRREVERSÍVEL!')) {
            localStorage.clear();
            localStorage.setItem('adminAuth', 'true');
            location.reload();
        }
    }
}

// Filtrar participantes por status
function filterByStatus(status) {
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('filter-' + status).classList.add('active');
    
    // Recarregar tabela com filtro
    loadParticipants(status);
}

// Confirmar doação de fraldas (versão Firebase)
async function confirmDonation(purchaseId) {
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Compra não encontrada!');
        return;
    }
    
    const numbersText = purchase.numbers.map(n => n.toString().padStart(3, '0')).join(', ');
    const confirmMessage = 'Confirmar doação de fraldas de ' + purchase.name + '?\n\nNúmeros: ' + numbersText + '\nTotal: R$ ' + purchase.totalAmount.toFixed(2);
    
    if (confirm(confirmMessage)) {
        try {
            // Atualizar no Firebase se disponível
            if (adminData.firebaseReady) {
                const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'confirmed', {
                    confirmedAt: new Date().toISOString(),
                    confirmedBy: adminData.currentUser.uid
                });
                
                if (!result.success) {
                    throw new Error(result.error);
                }
                
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
            console.error('Erro ao confirmar doação:', error);
            showNotification('Erro ao confirmar doação: ' + error.message, 'error');
        }
    }
}

// Rejeitar doação de fraldas (versão Firebase)
async function rejectDonation(purchaseId) {
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Compra não encontrada!');
        return;
    }
    
    const promptMessage = 'Rejeitar doação de ' + purchase.name + '?\n\nMotivo (opcional):';
    const reason = prompt(promptMessage);
    if (reason !== null) {
        try {
            // Atualizar no Firebase se disponível
            if (adminData.firebaseReady) {
                const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, 'rejected', {
                    rejectedAt: new Date().toISOString(),
                    rejectionReason: reason,
                    rejectedBy: adminData.currentUser.uid
                });
                
                if (!result.success) {
                    throw new Error(result.error);
                }
                
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
            console.error('Erro ao rejeitar doação:', error);
            showNotification('Erro ao rejeitar doação: ' + error.message, 'error');
        }
    }
}

// Editar participante
function editParticipant(purchaseId) {
    const purchase = adminData.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Participante não encontrado!');
        return;
    }
    
    const newName = prompt('Nome:', purchase.name);
    if (newName && newName.trim()) {
        purchase.name = newName.trim();
        
        const newPhone = prompt('WhatsApp:', purchase.phone);
        if (newPhone && newPhone.trim()) {
            purchase.phone = newPhone.trim();
            
            // Salvar alterações
            localStorage.setItem('purchases', JSON.stringify(adminData.purchases));
            loadParticipants();
            
            alert('✅ Dados atualizados com sucesso!');
        }
    }
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Funções para adicionar IDs únicos às compras se não existirem
function ensurePurchaseIds() {
    adminData.purchases.forEach(function(purchase) {
        if (!purchase.id) {
            purchase.id = Date.now() + Math.random();
        }
    });
}

// Função para buscar participante
function searchParticipant() {
    const searchTerm = document.getElementById('participant-search').value.toLowerCase();
    const rows = document.querySelectorAll('#participants-tbody tr');
    
    rows.forEach(function(row) {
        const name = row.cells[0].textContent.toLowerCase();
        const phone = row.cells[1].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || phone.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Fechar modal de sorteio
function closeDrawModal() {
    document.getElementById('draw-modal').style.display = 'none';
    document.body.style.overflow = '';
}

// Mostrar notificação
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

// Funções utilitárias
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('pt-BR');
}

function formatDateForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
}

function formatCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
