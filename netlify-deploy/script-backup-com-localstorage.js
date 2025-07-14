// Configurações da Rifa do Chá de Bebê Thomas
const RIFA_CONFIG = {
    totalNumbers: 150,
    ticketPrice: 40.00,
    drawDate: new Date('2025-07-18T16:00:00'),
    pixKey: 'contato@charifa.com',
    theme: 'astronauta',
    babyName: 'Thomas',
    prizes: {
        range1: { min: 1, max: 30, prize: '1 Fralda P' },
        range2: { min: 31, max: 100, prize: '1 Fralda M' },
        range3: { min: 101, max: 150, prize: '1 Fralda G' },
        pix1: 'R$ 100,00',
        pix2: 'R$ 200,00'
    }
};

// Estado da aplicação
let rifaState = {
    numbers: {},
    selectedNumbers: new Set(),
    soldNumbers: new Set(),
    reservedNumbers: new Set(),
    firebaseReady: false,
    unsubscribe: null
};

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM carregado, iniciando aplicação...');
    
    // Configurar eventos e UI básica primeiro
    setupEventListeners();
    startCountdown();
    generateNumbers();
    updateStatistics();
    
    // APENAS FIREBASE - sem localStorage
    console.log('🔥 Aguardando Firebase estar pronto...');
    
    if (typeof window.FirebaseDB !== 'undefined') {
        console.log('✅ FirebaseDB já disponível');
        initializeWithFirebase();
    } else {
        // Escutar evento firebaseReady
        window.addEventListener('firebaseReady', function(event) {
            console.log('🎉 Firebase está pronto, inicializando...');
            initializeWithFirebase();
        });
        
        // Timeout mais curto - falha se Firebase não carregar
        setTimeout(() => {
            if (!rifaState.firebaseReady) {
                console.error('❌ Firebase não carregou - aplicação não funcionará sem Firebase');
                showFirebaseError();
            }
        }, 10000); // 10 segundos apenas
    }
});

// Inicializar com Firebase
async function initializeWithFirebase() {
    try {
        console.log('🔄 Inicializando Firebase...');
        
        // Verificar se FirebaseDB está disponível
        if (typeof window.FirebaseDB === 'undefined') {
            throw new Error('FirebaseDB não carregado');
        }
        
        console.log('🔐 Inicializando autenticação anônima...');
        // Inicializar autenticação anônima
        const user = await window.FirebaseDB.initAuth();
        console.log('👤 Usuário autenticado:', user?.uid);
        
        rifaState.firebaseReady = true;
        
        // Inicializar configurações básicas
        initializeRifa();
        
        // Carregar números vendidos em tempo real
        console.log('📊 Carregando números vendidos...');
        await loadSoldNumbersFromFirebase();
        
        // Escutar mudanças em tempo real
        console.log('🔄 Configurando listener em tempo real...');
        rifaState.unsubscribe = window.FirebaseDB.listenToChanges('purchases', (purchases) => {
            console.log('📥 Atualização em tempo real:', purchases.length, 'compras');
            updateSoldNumbersFromPurchases(purchases);
            updateStatistics();
        });
        
        console.log('🔥 Firebase conectado com sucesso!');
    } catch (error) {
        console.error('❌ Erro crítico ao conectar Firebase:', error);
        rifaState.firebaseReady = false;
        showFirebaseError();
        throw error; // Re-lançar erro para não continuar sem Firebase
    }
}

// Carregar números vendidos do Firebase
async function loadSoldNumbersFromFirebase() {
    try {
        console.log('📊 Buscando números vendidos no Firebase...');
        const result = await window.FirebaseDB.loadPurchases();
        console.log('📥 Resultado da busca:', result);
        
        if (result.success) {
            let soldNumbersArray = [];
            let reservedNumbersArray = [];
            
            // Extrair números de todas as compras por status
            result.data.forEach(purchase => {
                if (Array.isArray(purchase.numbers)) {
                    // Status confirmados vão para números vendidos
                    if (purchase.status === 'confirmed') {
                        soldNumbersArray = soldNumbersArray.concat(purchase.numbers);
                    } 
                    // Status pendentes ou reservados vão para números reservados
                    else if (['pending', 'reserved', 'pending_donation'].includes(purchase.status)) {
                        reservedNumbersArray = reservedNumbersArray.concat(purchase.numbers);
                    }
                }
            });
            
            rifaState.soldNumbers = new Set(soldNumbersArray);
            rifaState.reservedNumbers = new Set(reservedNumbersArray);
            
            console.log('✅ Números vendidos carregados:', soldNumbersArray.length);
            console.log('✅ Números reservados carregados:', reservedNumbersArray.length);
            
            // Forçar atualização da exibição
            updateNumbersDisplay();
            updateStatistics();
            
        } else {
            console.warn('⚠️ Nenhum número vendido encontrado:', result.error);
            // Mesmo sem números vendidos, atualizar a exibição
            updateNumbersDisplay();
        }
    } catch (error) {
        console.error('❌ Erro crítico ao carregar números vendidos:', error);
        
        // Mostrar notificação para o usuário
        const notification = document.getElementById('notification-area');
        if (notification) {
            notification.innerHTML = `
                <div class="alert alert-danger">
                    Erro ao conectar com o servidor. A aplicação não funcionará corretamente.
                    <button onclick="this.parentElement.remove()">×</button>
                </div>
            `;
            notification.style.display = 'block';
        }
        
        throw error; // Re-lançar para tratamento na função chamadora
    }
}

// Atualizar números vendidos a partir das compras
function updateSoldNumbersFromPurchases(purchases) {
    const soldNumbers = new Set();
    const reservedNumbers = new Set();
    
    purchases.forEach(purchase => {
        if (purchase.numbers && Array.isArray(purchase.numbers)) {
            // Status confirmados vão para números vendidos
            if (purchase.status === 'confirmed') {
                purchase.numbers.forEach(number => soldNumbers.add(number));
            } 
            // Status pendentes ou reservados vão para números reservados
            else if (['pending', 'reserved', 'pending_donation'].includes(purchase.status)) {
                purchase.numbers.forEach(number => reservedNumbers.add(number));
            }
        }
    });
    
    rifaState.soldNumbers = soldNumbers;
    rifaState.reservedNumbers = reservedNumbers;
    
    console.log('🔄 Atualizados em tempo real - Vendidos:', soldNumbers.size, 'Reservados:', reservedNumbers.size);
    
    // Atualizar UI
    updateNumbersDisplay();
}

// Inicializar configurações da rifa (APENAS FIREBASE)
function initializeRifa() {
    console.log('🎯 Inicializando configurações da rifa - MODO FIREBASE APENAS...');
    
    // Limpar estado local
    rifaState.selectedNumbers = new Set();
    rifaState.soldNumbers = new Set();
    rifaState.reservedNumbers = new Set();
    
    // Configurar informações na página
    document.getElementById('total-tickets').textContent = RIFA_CONFIG.totalNumbers;
    document.getElementById('ticket-price').textContent = `R$ ${RIFA_CONFIG.ticketPrice.toFixed(2)}`;
    document.getElementById('draw-date').textContent = 'Data do sorteio a definir';
    
    // Verificar se os números já foram gerados
    const grid = document.getElementById('numbers-grid');
    if (grid && grid.children.length === 0) {
        console.log('🔢 Gerando grade de números...');
        generateNumbers();
    }
    
    console.log('✅ Rifa inicializada - aguardando dados do Firebase');
}

// Configurar event listeners
function setupEventListeners() {
    // Menu mobile
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
    
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
    
    // Form de compra
    document.getElementById('purchase-form').addEventListener('submit', handlePurchase);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('purchase-modal');
        if (event.target === modal) {
            closePurchaseModal();
        }
    });
      // Máscaras para inputs
    document.getElementById('buyer-phone').addEventListener('input', function(e) {
        e.target.value = formatPhone(e.target.value);
    });
}

// Gerar grade de números
function generateNumbers() {
    const grid = document.getElementById('numbers-grid');
    if (!grid) {
        console.error('❌ Elemento numbers-grid não encontrado!');
        return;
    }
    
    console.log('🎲 Iniciando geração de números da rifa...');
    grid.innerHTML = '';
    
    for (let i = 1; i <= RIFA_CONFIG.totalNumbers; i++) {
        const numberCard = createNumberCard(i);
        grid.appendChild(numberCard);
    }
    
    console.log(`✅ ${RIFA_CONFIG.totalNumbers} números gerados com sucesso!`);
}

// Criar card de número
function createNumberCard(number) {
    const card = document.createElement('div');
    card.className = 'number-card';
    card.id = `number-${number}`; // Adicionar ID para permitir busca na updateNumbersDisplay
    card.textContent = number.toString().padStart(3, '0');
    card.dataset.number = number;
    
    updateNumberStatus(card, number);
    
    card.addEventListener('click', function() {
        if (!rifaState.soldNumbers.has(number) && !rifaState.reservedNumbers.has(number)) {
            toggleNumberSelection(number);
        }
    });
    
    return card;
}

// Atualizar status do número
function updateNumberStatus(card, number) {
    card.classList.remove('available', 'selected', 'sold', 'reserved');
    
    if (rifaState.soldNumbers.has(number)) {
        card.classList.add('sold');
    } else if (rifaState.reservedNumbers.has(number)) {
        card.classList.add('reserved');
    } else if (rifaState.selectedNumbers.has(number)) {
        card.classList.add('selected');
    } else {
        card.classList.add('available');
    }
}

// Alternar seleção de número
function toggleNumberSelection(number) {
    if (rifaState.selectedNumbers.has(number)) {
        rifaState.selectedNumbers.delete(number);
    } else {
        rifaState.selectedNumbers.add(number);
    }
    
    updateNumberDisplay(number);
    updateSelectionSummary();
}

// Atualizar visualização do número
function updateNumberDisplay(number) {
    const card = document.querySelector(`[data-number="${number}"]`);
    if (card) {
        updateNumberStatus(card, number);
    }
}

// Atualizar resumo da seleção
function updateSelectionSummary() {
    const selectedCount = rifaState.selectedNumbers.size;
    const totalAmount = selectedCount * RIFA_CONFIG.ticketPrice;
    
    document.getElementById('selected-count').textContent = selectedCount;
    document.getElementById('total-amount').textContent = totalAmount.toFixed(2);
    
    // Atualizar lista de números selecionados
    const selectedNumbersDiv = document.getElementById('selected-numbers');
    selectedNumbersDiv.innerHTML = '';
    
    Array.from(rifaState.selectedNumbers).sort((a, b) => a - b).forEach(number => {
        const badge = document.createElement('span');
        badge.className = 'selected-number-badge';
        badge.textContent = number.toString().padStart(3, '0');
        selectedNumbersDiv.appendChild(badge);
    });
    
    // Habilitar/desabilitar botão de compra
    const buyButton = document.getElementById('buy-button');
    buyButton.disabled = selectedCount === 0;
}

// Filtros de visualização
function showAvailable() {
    filterNumbers('available');
    setActiveFilter(0);
}

function showSelected() {
    filterNumbers('selected');
    setActiveFilter(1);
}

function showSold() {
    filterNumbers('sold');
    setActiveFilter(2);
}

function showAll() {
    filterNumbers('all');
    setActiveFilter(3);
}

function filterNumbers(type) {
    const cards = document.querySelectorAll('.number-card');
    
    cards.forEach(card => {
        const number = parseInt(card.dataset.number);
        let show = false;
        
        switch (type) {
            case 'available':
                show = !rifaState.soldNumbers.has(number) && 
                       !rifaState.reservedNumbers.has(number) && 
                       !rifaState.selectedNumbers.has(number);
                break;
            case 'selected':
                show = rifaState.selectedNumbers.has(number);
                break;
            case 'sold':
                show = rifaState.soldNumbers.has(number) || rifaState.reservedNumbers.has(number);
                break;
            case 'all':
                show = true;
                break;
        }
        
        card.style.display = show ? 'flex' : 'none';
    });
}

function setActiveFilter(index) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

// Buscar número específico
function searchNumber() {
    const searchInput = document.getElementById('search-number');
    const number = parseInt(searchInput.value);
    
    if (number >= 1 && number <= RIFA_CONFIG.totalNumbers) {
        const card = document.querySelector(`[data-number="${number}"]`);
        if (card) {
            // Mostrar todos os números primeiro
            showAll();
            
            // Scroll para o número
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Destacar temporariamente
            card.style.animation = 'none';
            setTimeout(() => {
                card.style.animation = 'pulse 1s ease-in-out 3';
            }, 10);
        }
    }
    
    searchInput.value = '';
}

// Modal de compra
function openPurchaseModal() {
    if (rifaState.selectedNumbers.size === 0) return;
    
    const modal = document.getElementById('purchase-modal');
    updateModalSummary();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closePurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateModalSummary() {
    const selectedNumbers = Array.from(rifaState.selectedNumbers).sort((a, b) => a - b);
    const totalAmount = selectedNumbers.length * RIFA_CONFIG.ticketPrice;
    
    const numbersDiv = document.getElementById('modal-selected-numbers');
    numbersDiv.innerHTML = selectedNumbers.map(num => 
        `<span class="selected-number-badge">${num.toString().padStart(3, '0')}</span>`
    ).join('');
    
    document.getElementById('modal-total-amount').textContent = totalAmount.toFixed(2);
}

// Processar compra
// Função de compra atualizada para Firebase
async function handlePurchase(e) {
    e.preventDefault();
    
    console.log('🛒 Iniciando processo de compra...');
    
    const formData = new FormData(e.target);
    const purchaseData = {
        buyerName: formData.get('buyer-name') || document.getElementById('buyer-name').value,
        buyerPhone: formData.get('buyer-phone') || document.getElementById('buyer-phone').value,
        paymentMethod: formData.get('payment-method') || document.getElementById('payment-method').value,
        numbers: Array.from(rifaState.selectedNumbers),
        totalAmount: rifaState.selectedNumbers.size * RIFA_CONFIG.ticketPrice,
        date: new Date().toISOString(),
        status: 'pending' // Para doações, ficará pendente até confirmação admin
    };
    
    console.log('📋 Dados da compra:', purchaseData);
    
    // Validar dados
    if (!validatePurchaseData(purchaseData)) {
        console.error('❌ Validação falhou');
        return;
    }
    
    // Determinar status baseado no método de pagamento
    if (purchaseData.paymentMethod === 'doacao') {
        purchaseData.status = 'pending_donation';
    } else {
        purchaseData.status = 'reserved';
    }
    
    console.log('🔥 Firebase pronto:', rifaState.firebaseReady);
    console.log('🔧 Status final:', purchaseData.status);
    
    try {
        // Verificar se Firebase está inicializado
        if (typeof window.FirebaseDB === 'undefined') {
            throw new Error('FirebaseDB não está disponível');
        }
        
        // APENAS FIREBASE - sem fallback para localStorage
        if (!rifaState.firebaseReady) {
            throw new Error('Firebase não está pronto. Aguarde e tente novamente.');
        }
        
        console.log('💾 Salvando no Firebase...');
        const result = await window.FirebaseDB.savePurchase(purchaseData);
        
        console.log('📤 Resultado do Firebase:', result);
        
        if (!result.success) {
            throw new Error(result.error || 'Erro desconhecido do Firebase');
        }
        console.log('✅ Compra salva no Firebase:', result.id);
        
        // Reservar números localmente (atualização imediata)
        purchaseData.numbers.forEach(number => {
            rifaState.reservedNumbers.add(number);
            rifaState.selectedNumbers.delete(number);
            updateNumberDisplay(number);
        });
        
        // Atualizar interface
        updateSelectionSummary();
        updateStatistics();
        closePurchaseModal();
        
        // Mostrar confirmação
        showSuccessMessage(purchaseData);
        
        // Limpar formulário
        document.getElementById('purchase-form').reset();
        
    } catch (error) {
        console.error('Erro ao salvar compra:', error);
        
        if (error.message.includes('Firebase não está pronto')) {
            alert('Sistema ainda carregando. Aguarde alguns segundos e tente novamente.');
        } else {
            alert('Erro ao processar compra. Verifique sua conexão e tente novamente.');
        }
    }
}

// Validar dados da compra
function validatePurchaseData(data) {
    if (!data.buyerName || !data.buyerName.trim()) {
        alert('Por favor, informe seu nome completo.');
        return false;
    }
    
    if (!data.buyerPhone || !data.buyerPhone.trim()) {
        alert('Por favor, informe seu WhatsApp.');
        return false;
    }
    
    if (!data.paymentMethod) {
        alert('Por favor, selecione a forma de pagamento.');
        return false;
    }
    
    return true;
}

// Carregar números do localStorage como fallback
function loadNumbersFromLocalStorage() {
    try {
        // Tentar carregar de rifaData primeiro
        const savedData = localStorage.getItem('rifaData');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.soldNumbers && Array.isArray(data.soldNumbers)) {
                rifaState.soldNumbers = new Set(data.soldNumbers);
                console.log('📦 Números vendidos carregados do rifaData:', data.soldNumbers.length);
            }
            if (data.reservedNumbers && Array.isArray(data.reservedNumbers)) {
                rifaState.reservedNumbers = new Set(data.reservedNumbers);
                console.log('📦 Números reservados carregados do rifaData:', data.reservedNumbers.length);
            }
            updateNumbersDisplay();
            return true;
        }
        
        // Se não há rifaData, tentar carregar das compras diretamente
        console.log('📦 rifaData não encontrado, carregando das compras...');
        return loadSoldNumbersFromLocalStorage();
        
    } catch (error) {
        console.warn('⚠️ Erro ao carregar números do localStorage:', error);
        // Fallback final: tentar carregar das compras
        return loadSoldNumbersFromLocalStorage();
    }
}

// Salvar números no localStorage como fallback
function saveNumbersToLocalStorage() {
    try {
        const data = {
            soldNumbers: [...rifaState.soldNumbers],
            reservedNumbers: [...rifaState.reservedNumbers],
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('rifaData', JSON.stringify(data));
        console.log('💾 Números salvos no localStorage');
    } catch (error) {
        console.warn('⚠️ Erro ao salvar números no localStorage:', error);
    }
}

// Carregar números vendidos do localStorage (processar compras confirmadas)
function loadSoldNumbersFromLocalStorage() {
    console.log('📦 Carregando números das compras confirmadas no localStorage...');
    
    try {
        const purchasesData = localStorage.getItem('purchases');
        if (purchasesData) {
            const purchases = JSON.parse(purchasesData);
            const soldNumbers = new Set();
            const reservedNumbers = new Set();
            
            console.log(`📊 Processando ${purchases.length} compras do localStorage...`);
            
            purchases.forEach(purchase => {
                if (purchase.numbers && Array.isArray(purchase.numbers)) {
                    // Status confirmados vão para números vendidos (vermelhos)
                    if (purchase.status === 'confirmed') {
                        purchase.numbers.forEach(number => soldNumbers.add(number));
                        console.log(`✅ Número ${purchase.numbers.join(', ')} confirmado como vendido`);
                    } 
                    // Status pendentes vão para números reservados (amarelos)
                    else if (['pending', 'reserved', 'pending_donation'].includes(purchase.status)) {
                        purchase.numbers.forEach(number => reservedNumbers.add(number));
                        console.log(`⏳ Número ${purchase.numbers.join(', ')} marcado como reservado`);
                    }
                }
            });
            
            rifaState.soldNumbers = soldNumbers;
            rifaState.reservedNumbers = reservedNumbers;
            
            console.log(`🔢 LocalStorage: ${soldNumbers.size} vendidos, ${reservedNumbers.size} reservados`);
            console.log(`📋 Números vendidos: [${Array.from(soldNumbers).sort((a,b) => a-b).join(', ')}]`);
            console.log(`📋 Números reservados: [${Array.from(reservedNumbers).sort((a,b) => a-b).join(', ')}]`);
            
            // Salvar no rifaData para backup
            saveNumbersToLocalStorage();
            
            return true;
        } else {
            console.log('📦 Nenhuma compra encontrada no localStorage');
            rifaState.soldNumbers = new Set();
            rifaState.reservedNumbers = new Set();
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar números do localStorage:', error);
        rifaState.soldNumbers = new Set();
        rifaState.reservedNumbers = new Set();
        return false;
    }
}

// Atualizar display de todos os números
function updateNumbersDisplay() {
    console.log('🔄 Atualizando exibição de números...');
    
    // Verificar se há grid na página
    const grid = document.getElementById('numbers-grid');
    if (!grid) {
        console.warn('⚠️ Grid não encontrada no DOM');
        return;
    }
    
    // Verificar se a grade está vazia e gerar números se necessário
    if (grid && grid.children.length === 0) {
        console.log('🔢 Grid vazia, gerando números...');
        generateNumbers();
    }
    
    // Mostrar loader temporário
    document.querySelector('.numbers-container').classList.add('loading');
    
    // Configurar timeout para garantir que algo seja exibido mesmo se FirebaseDB falhar
    const displayTimeout = setTimeout(() => {
        if (document.querySelector('.numbers-container').classList.contains('loading')) {
            console.log('⏱️ Timeout na atualização de números, removendo status de loading...');
            document.querySelector('.numbers-container').classList.remove('loading');
        }
    }, 3000);
    
    try {
        // Atualizar visibilidade de cada número com base no estado atual
        for (let i = 1; i <= RIFA_CONFIG.totalNumbers; i++) {
            const element = document.getElementById(`number-${i}`);
            if (!element) continue;
            
            // Remover todas as classes de status
            element.classList.remove('sold', 'selected', 'reserved', 'available');
            
            // Aplicar classe apropriada baseada no estado
            if (rifaState.soldNumbers.has(i)) {
                element.classList.add('sold');
            } else if (rifaState.reservedNumbers.has(i)) {
                element.classList.add('reserved');
            } else if (rifaState.selectedNumbers.has(i)) {
                element.classList.add('selected');
            } else {
                element.classList.add('available');
            }
        }
        
        // Remover loader quando terminar
        document.querySelector('.numbers-container').classList.remove('loading');
        clearTimeout(displayTimeout);
        console.log('✅ Exibição de números atualizada com sucesso');
    } catch (error) {
        console.error('❌ Erro ao atualizar exibição:', error);
        // Garantir que o loader seja removido mesmo em caso de erro
        document.querySelector('.numbers-container').classList.remove('loading');
        clearTimeout(displayTimeout);
    }
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', function() {
    if (rifaState.unsubscribe) {
        rifaState.unsubscribe();
    }
});

// Mostrar mensagem de sucesso
function showSuccessMessage(data) {
    let paymentInfo = '';
    if (data.paymentMethod === 'pix') {
        paymentInfo = '\n\n💳 Realize o pagamento via PIX e envie o comprovante!';
    } else if (data.paymentMethod === 'doacao') {
        paymentInfo = '\n\n🍼 Entre em contato para combinar a doação de fraldas!\n⚠️ Seus números ficam reservados até confirmação do admin.';
    }
    
    const message = `🚀 Participação confirmada no Chá Rifa Thomas!

Número(s) reservado(s): ${data.numbers.map(n => n.toString().padStart(3, '0')).join(', ')}
Total: R$ ${data.totalAmount.toFixed(2)}
Forma de Pagamento: ${data.paymentMethod === 'pix' ? 'PIX' : 'Doação de Fraldas'}${paymentInfo}

🎁 Prêmios por faixa:
• 1-30: 1 Fralda P + chance PIX R$ 100,00
• 31-100: 1 Fralda M + chance PIX R$ 200,00  
• 101-150: 1 Fralda G + chance PIX R$ 100,00

📱 Envie o comprovante de pagamento para confirmar.

Chave PIX: ${RIFA_CONFIG.pixKey}
Sorteio: 11 de Julho às 16h

Obrigado por ajudar na chegada do pequeno astronauta Thomas! 🌟`;
    
    alert(message);
}

// Contador regressivo
function startCountdown() {
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = RIFA_CONFIG.drawDate.getTime() - now;
        
        if (distance < 0) {
            document.getElementById('countdown').innerHTML = 'SORTEIO REALIZADO!';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('countdown').innerHTML = 
            `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Atualizar estatísticas
function updateStatistics() {
    const soldCount = rifaState.soldNumbers.size + rifaState.reservedNumbers.size;
    document.getElementById('sold-tickets').textContent = soldCount;
    
    // Atualizar barra de progresso (se existir)
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const percentage = (soldCount / RIFA_CONFIG.totalNumbers) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

// Salvar dados da rifa
function saveRifaData() {
    const data = {
        soldNumbers: Array.from(rifaState.soldNumbers),
        reservedNumbers: Array.from(rifaState.reservedNumbers),
        lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('rifaData', JSON.stringify(data));
}

// Funções utilitárias
function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCPF(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

function formatPhone(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[10])) return false;
    
    return true;
}

// Adicionar animação de pulse ao CSS
const style = document.createElement('style');
style.textContent = `
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(102, 126, 234, 0.6); }
    100% { transform: scale(1); }
}
`;
document.head.appendChild(style);

// Alternar informações de pagamento
function togglePaymentInfo() {
    const paymentMethod = document.getElementById('payment-method').value;
    const pixInfo = document.getElementById('pix-info');
    const doacaoInfo = document.getElementById('doacao-info');
    
    // Esconder todas as opções
    pixInfo.style.display = 'none';
    doacaoInfo.style.display = 'none';
    
    // Mostrar a opção selecionada
    if (paymentMethod === 'pix') {
        pixInfo.style.display = 'block';
    } else if (paymentMethod === 'doacao') {
        doacaoInfo.style.display = 'block';
    }
}

// Função de debug para recarregar números
function debugRifaNumbers() {
    console.log('🔧 Debug: Recarregando números da rifa...');
    
    // Mostrar notificação
    const notification = document.getElementById('notification-area');
    if (notification) {
        notification.innerHTML = `
            <div style="background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; border-left: 4px solid #17a2b8;">
                🔧 Debug: Recarregando dados... Verifique o console para logs detalhados.
            </div>
        `;
        notification.style.display = 'block';
    }
    
    // Log do estado atual
    console.log('📊 Estado atual da rifa:', {
        firebaseReady: rifaState.firebaseReady,
        soldNumbers: [...rifaState.soldNumbers],
        reservedNumbers: [...rifaState.reservedNumbers],
        selectedNumbers: [...rifaState.selectedNumbers]
    });
    
    // Tentar recarregar do Firebase
    if (typeof window.FirebaseDB !== 'undefined') {
        console.log('🔥 Tentando recarregar do Firebase...');
        loadSoldNumbersFromFirebase().then(() => {
            console.log('✅ Recarga do Firebase concluída');
            updateNotification('✅ Dados recarregados do Firebase', 'success');
        }).catch(error => {
            console.error('❌ Erro na recarga do Firebase:', error);
            // Tentar localStorage
            const loaded = loadNumbersFromLocalStorage();
            if (loaded) {
                updateNotification('⚠️ Dados carregados do localStorage (Firebase falhou)', 'warning');
            } else {
                updateNotification('❌ Falha ao carregar dados', 'error');
            }
        });
    } else {
        console.log('📦 Firebase não disponível, tentando localStorage...');
        const loaded = loadNumbersFromLocalStorage();
        if (loaded) {
            updateNotification('📦 Dados carregados do localStorage', 'info');
        } else {
            updateNotification('❌ Nenhum dado encontrado', 'error');
        }
    }
    
    // Forçar atualização da exibição
    setTimeout(() => {
        updateNumbersDisplay();
        updateStatistics();
        console.log('🔄 Exibição atualizada forçadamente');
    }, 1000);
}

// Função auxiliar para atualizar notificações
function updateNotification(message, type = 'info') {
    const notification = document.getElementById('notification-area');
    if (!notification) return;
    
    const colors = {
        success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
        error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
        warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
        info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
    };
    
    const color = colors[type] || colors.info;
    
    notification.innerHTML = `
        <div style="background: ${color.bg}; color: ${color.text}; padding: 10px; border-radius: 5px; border-left: 4px solid ${color.border};">
            ${message}
            <button onclick="this.parentElement.parentElement.style.display='none'" style="float: right; background: none; border: none; font-size: 16px; cursor: pointer;">×</button>
        </div>
    `;
    notification.style.display = 'block';
    
    // Auto-hide após 5 segundos
    setTimeout(() => {
        if (notification.style.display !== 'none') {
            notification.style.display = 'none';
        }
    }, 5000);
}

// Mostrar erro de Firebase
function showFirebaseError() {
    const numbersContainer = document.querySelector('.numbers-container');
    if (numbersContainer) {
        numbersContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <h3>❌ Erro de Conexão</h3>
                <p>Não foi possível conectar ao Firebase.</p>
                <p>Recarregue a página ou tente novamente em alguns minutos.</p>
                <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    🔄 Recarregar Página
                </button>
            </div>
        `;
    }
}
