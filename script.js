// Configurações da Rifa do Chá de Bebê Thomas
const RIFA_CONFIG = {
    totalNumbers: 150,
    ticketPrice: 40.00,
    drawDate: new Date('2025-07-11T16:00:00'),
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
    // Aguardar Firebase estar disponível
    if (typeof FirebaseDB !== 'undefined') {
        initializeWithFirebase();
    } else {
        // Fallback para localStorage se Firebase não estiver disponível
        initializeRifa();
    }
    
    setupEventListeners();
    startCountdown();
    generateNumbers();
    updateStatistics();
});

// Inicializar com Firebase
async function initializeWithFirebase() {
    try {
        // Inicializar autenticação anônima
        await FirebaseDB.initAuth();
        rifaState.firebaseReady = true;
        
        // Carregar números vendidos em tempo real
        loadSoldNumbersFromFirebase();
        
        // Escutar mudanças em tempo real
        rifaState.unsubscribe = FirebaseDB.onPurchasesChange((purchases) => {
            updateSoldNumbersFromPurchases(purchases);
            updateStatistics();
        });
        
        console.log('🔥 Firebase conectado com sucesso!');
    } catch (error) {
        console.warn('⚠️ Erro ao conectar Firebase, usando localStorage:', error);
        rifaState.firebaseReady = false;
        initializeRifa();
    }
}

// Carregar números vendidos do Firebase
async function loadSoldNumbersFromFirebase() {
    try {
        const result = await FirebaseDB.getSoldNumbers();
        if (result.success) {
            rifaState.soldNumbers = new Set(result.data);
            updateNumbersDisplay();
        }
    } catch (error) {
        console.warn('Erro ao carregar números vendidos:', error);
    }
}

// Atualizar números vendidos a partir das compras
function updateSoldNumbersFromPurchases(purchases) {
    const soldNumbers = new Set();
    
    purchases.forEach(purchase => {
        if (purchase.status === 'confirmed' && purchase.numbers) {
            purchase.numbers.forEach(number => soldNumbers.add(number));
        }
    });
    
    rifaState.soldNumbers = soldNumbers;
    updateNumbersDisplay();
}

// Inicializar configurações da rifa
function initializeRifa() {
    // Limpar dados antigos para garantir que todos os números estejam disponíveis
    localStorage.removeItem('rifaData');
    localStorage.removeItem('purchases');
    
    // Reinicializar estado limpo
    rifaState.soldNumbers = new Set();
    rifaState.reservedNumbers = new Set();
    rifaState.selectedNumbers = new Set();
    
    // Configurar informações na página
    document.getElementById('total-tickets').textContent = RIFA_CONFIG.totalNumbers;
    document.getElementById('ticket-price').textContent = `R$ ${RIFA_CONFIG.ticketPrice.toFixed(2)}`;
    document.getElementById('draw-date').textContent = 'Sorteio: 11 de Julho de 2025 às 16h';
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
    grid.innerHTML = '';
    
    for (let i = 1; i <= RIFA_CONFIG.totalNumbers; i++) {
        const numberCard = createNumberCard(i);
        grid.appendChild(numberCard);
    }
}

// Criar card de número
function createNumberCard(number) {
    const card = document.createElement('div');
    card.className = 'number-card';
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
    
    const formData = new FormData(e.target);
    const purchaseData = {
        name: formData.get('buyer-name') || document.getElementById('buyer-name').value,
        phone: formData.get('buyer-phone') || document.getElementById('buyer-phone').value,
        paymentMethod: formData.get('payment-method') || document.getElementById('payment-method').value,
        numbers: Array.from(rifaState.selectedNumbers),
        totalAmount: rifaState.selectedNumbers.size * RIFA_CONFIG.ticketPrice,
        date: new Date().toISOString(),
        status: 'pending' // Para doações, ficará pendente até confirmação admin
    };
    
    // Validar dados
    if (!validatePurchaseData(purchaseData)) {
        return;
    }
    
    // Determinar status baseado no método de pagamento
    if (purchaseData.paymentMethod === 'doacao') {
        purchaseData.status = 'pending_donation';
    } else {
        purchaseData.status = 'reserved';
    }
    
    try {
        // Salvar no Firebase se disponível, senão localStorage
        if (rifaState.firebaseReady) {
            const result = await FirebaseDB.savePurchase(purchaseData);
            if (!result.success) {
                throw new Error(result.error);
            }
            console.log('✅ Compra salva no Firebase:', result.id);
        } else {
            // Fallback para localStorage
            savePurchaseData(purchaseData);
        }
        
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
        alert('Erro ao processar compra. Tente novamente ou entre em contato via WhatsApp.');
    }
}

// Validar dados da compra
function validatePurchaseData(data) {
    if (!data.name.trim()) {
        alert('Por favor, informe seu nome completo.');
        return false;
    }
    
    if (!data.phone.trim()) {
        alert('Por favor, informe seu WhatsApp.');
        return false;
    }
    
    if (!data.paymentMethod) {
        alert('Por favor, selecione a forma de pagamento.');
        return false;
    }
    
    return true;
}

// Atualizar display de todos os números
function updateNumbersDisplay() {
    for (let i = 1; i <= RIFA_CONFIG.totalNumbers; i++) {
        updateNumberDisplay(i);
    }
}

// Função para salvar no localStorage (fallback)
function savePurchaseData(data) {
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    data.id = Date.now() + Math.random();
    purchases.push(data);
    localStorage.setItem('purchases', JSON.stringify(purchases));
    console.log('💾 Compra salva no localStorage');
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
