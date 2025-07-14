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

// Configuração atual carregada do Firebase
let currentConfig = { ...RIFA_CONFIG };

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
        
        // Inicializar configurações (carregando do Firebase)
        console.log('⚙️ Carregando configurações...');
        await initializeRifa();
        
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
        
        // Escutar mudanças nas configurações (documento específico)
        console.log('⚙️ Configurando listener específico para configurações...');
        if (typeof window.FirebaseDB.listenToConfigChanges === 'function') {
            window.FirebaseDB.listenToConfigChanges(async (configDoc) => {
                if (configDoc) {
                    console.log('🔧 Configuração atualizada via listener específico:', configDoc);
                    
                    // Mesclar configurações do Firebase com as padrões
                    const mergedConfig = {
                        ...RIFA_CONFIG,
                        ...configDoc,
                        // Garantir que certas propriedades existam
                        prizes: {
                            ...RIFA_CONFIG.prizes,
                            ...(configDoc.prizes || {})
                        }
                    };
                    
                    // Atualizar configuração global
                    currentConfig = mergedConfig;
                    console.log('🔄 Configuração global atualizada via listener específico:', currentConfig);
                    console.log('📅 Data do sorteio atualizada:', configDoc.drawDate);
                    console.log('💳 Chave PIX atualizada:', configDoc.pixKey);
                    
                    // Aplicar na interface
                    applyConfigurationToUI(mergedConfig);
                } else {
                    console.warn('⚠️ Configuração removida ou não encontrada');
                }
            });
        } else {
            // Fallback para o listener de coleção original
            console.log('⚙️ Usando listener de coleção como fallback...');
            window.FirebaseDB.listenToChanges('rifa_config', async (configs) => {
                console.log('📋 Configurações recebidas do listener:', configs);
                if (configs && configs.length > 0) {
                    // Procurar pelo documento 'main' ou usar o primeiro documento
                    const config = configs.find(c => c.id === 'main') || configs[0];
                    if (config) {
                        console.log('🔧 Configurações atualizadas do Firebase:', config);
                        
                        // Mesclar configurações do Firebase com as padrões
                        const mergedConfig = {
                            ...RIFA_CONFIG,
                            ...config,
                            // Garantir que certas propriedades existam
                            prizes: {
                                ...RIFA_CONFIG.prizes,
                                ...(config.prizes || {})
                            }
                        };
                        
                        // Atualizar configuração global
                        currentConfig = mergedConfig;
                        console.log('🔄 Configuração global atualizada via listener:', currentConfig);
                        
                        // Aplicar na interface
                        applyConfigurationToUI(mergedConfig);
                    } else {
                        console.warn('⚠️ Nenhuma configuração válida encontrada no listener');
                    }
                } else {
                    console.warn('⚠️ Listener de configurações retornou dados vazios');
                }
            });
        }
        
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
            
            console.log(`📋 Processando ${result.data.length} compras do Firebase...`);
            
            // Extrair números de todas as compras por status
            result.data.forEach((purchase, index) => {
                console.log(`📋 Compra ${index + 1}:`, {
                    id: purchase.id,
                    status: purchase.status,
                    numbers: purchase.numbers,
                    buyerName: purchase.buyerName
                });
                
                if (Array.isArray(purchase.numbers)) {
                    // Status confirmados vão para números vendidos (vermelhos)
                    if (purchase.status === 'confirmed') {
                        soldNumbersArray = soldNumbersArray.concat(purchase.numbers);
                        console.log(`✅ Números ${purchase.numbers.join(', ')} confirmados como VENDIDOS`);
                    } 
                    // Status pendentes ou reservados vão para números reservados (amarelos)
                    else if (['pending', 'reserved', 'pending_donation'].includes(purchase.status)) {
                        reservedNumbersArray = reservedNumbersArray.concat(purchase.numbers);
                        console.log(`⏳ Números ${purchase.numbers.join(', ')} marcados como RESERVADOS`);
                    }
                    // Log de status não reconhecidos
                    else {
                        console.warn(`⚠️ Status não reconhecido: ${purchase.status} para números ${purchase.numbers.join(', ')}`);
                    }
                } else {
                    console.warn('⚠️ Compra sem números válidos:', purchase);
                }
            });
            
            rifaState.soldNumbers = new Set(soldNumbersArray);
            rifaState.reservedNumbers = new Set(reservedNumbersArray);
            
            console.log('📊 CARREGAMENTO INICIAL CONCLUÍDO:');
            console.log(`  ✅ ${soldNumbersArray.length} números vendidos carregados`);
            console.log(`  ⏳ ${reservedNumbersArray.length} números reservados carregados`);
            console.log(`  🔢 Números vendidos: [${soldNumbersArray.sort((a,b) => a-b).join(', ')}]`);
            console.log(`  🔢 Números reservados: [${reservedNumbersArray.sort((a,b) => a-b).join(', ')}]`);
            
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
    console.log('🔄 Processando atualização em tempo real...', purchases.length, 'compras recebidas');
    
    const soldNumbers = new Set();
    const reservedNumbers = new Set();
    
    // Log detalhado para debug
    let confirmedCount = 0;
    let pendingCount = 0;
    
    purchases.forEach((purchase, index) => {
        console.log(`📋 Compra ${index + 1}:`, {
            id: purchase.id,
            status: purchase.status,
            numbers: purchase.numbers,
            buyerName: purchase.buyerName
        });
        
        if (purchase.numbers && Array.isArray(purchase.numbers)) {
            // Status confirmados vão para números vendidos (vermelhos)
            if (purchase.status === 'confirmed') {
                purchase.numbers.forEach(number => {
                    soldNumbers.add(number);
                    console.log(`✅ Número ${number} marcado como VENDIDO`);
                });
                confirmedCount++;
            } 
            // Status pendentes ou reservados vão para números reservados (amarelos)
            else if (['pending', 'reserved', 'pending_donation'].includes(purchase.status)) {
                purchase.numbers.forEach(number => {
                    reservedNumbers.add(number);
                    console.log(`⏳ Número ${number} marcado como RESERVADO`);
                });
                pendingCount++;
            }
            // Log de status não reconhecidos
            else {
                console.warn(`⚠️ Status não reconhecido: ${purchase.status} para números ${purchase.numbers.join(', ')}`);
            }
        } else {
            console.warn('⚠️ Compra sem números válidos:', purchase);
        }
    });
    
    // Atualizar estado
    const prevSoldCount = rifaState.soldNumbers.size;
    const prevReservedCount = rifaState.reservedNumbers.size;
    
    rifaState.soldNumbers = soldNumbers;
    rifaState.reservedNumbers = reservedNumbers;
    
    console.log('📊 RESUMO DA ATUALIZAÇÃO:');
    console.log(`  📈 Vendidos: ${prevSoldCount} → ${soldNumbers.size} (${soldNumbers.size - prevSoldCount >= 0 ? '+' : ''}${soldNumbers.size - prevSoldCount})`);
    console.log(`  📈 Reservados: ${prevReservedCount} → ${reservedNumbers.size} (${reservedNumbers.size - prevReservedCount >= 0 ? '+' : ''}${reservedNumbers.size - prevReservedCount})`);
    console.log(`  🔢 Números vendidos: [${Array.from(soldNumbers).sort((a,b) => a-b).join(', ')}]`);
    console.log(`  🔢 Números reservados: [${Array.from(reservedNumbers).sort((a,b) => a-b).join(', ')}]`);
    console.log(`  📋 Compras processadas: ${confirmedCount} confirmadas, ${pendingCount} pendentes`);
    
    // Forçar atualização da UI
    console.log('🎨 Atualizando interface...');
    updateNumbersDisplay();
    updateStatistics();
    
    console.log('✅ Sincronização em tempo real concluída!');
}

// Carregar configurações do Firebase
async function loadConfigurationFromFirebase() {
    try {
        console.log('⚙️ Carregando configurações do Firebase...');
        
        if (typeof window.FirebaseDB === 'undefined') {
            console.warn('⚠️ Firebase não disponível, usando configurações padrão');
            return RIFA_CONFIG;
        }
        
        const result = await window.FirebaseDB.loadConfig();
        
        if (result.success && result.data) {
            console.log('✅ Configurações carregadas do Firebase:', result.data);
            
            // Mesclar configurações do Firebase com as padrões
            const firebaseConfig = {
                ...RIFA_CONFIG,
                ...result.data,
                // Garantir que certas propriedades existam
                prizes: {
                    ...RIFA_CONFIG.prizes,
                    ...(result.data.prizes || {})
                }
            };
            
            console.log('🔧 Configurações finais aplicadas:', firebaseConfig);
            console.log('📅 Data do sorteio Firebase:', result.data.drawDate);
            console.log('💳 Chave PIX Firebase:', result.data.pixKey);
            
            return firebaseConfig;
            
        } else {
            console.warn('⚠️ Configurações não encontradas no Firebase, usando padrão:', result.error);
            return RIFA_CONFIG;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar configurações do Firebase:', error);
        return RIFA_CONFIG;
    }
}

// Aplicar configurações na interface
function applyConfigurationToUI(config) {
    console.log('🎨 Aplicando configurações na interface:', config);
    
    try {
        // Atualizar elementos básicos
        const totalTicketsEl = document.getElementById('total-tickets');
        const ticketPriceEl = document.getElementById('ticket-price');
        const drawDateEl = document.getElementById('draw-date');
        
        if (totalTicketsEl) {
            totalTicketsEl.textContent = config.totalNumbers || 150;
        }
        
        if (ticketPriceEl) {
            const price = config.ticketPrice || 40.00;
            ticketPriceEl.textContent = `R$ ${price.toFixed(2)}`;
        }
        
        if (drawDateEl) {
            // Usar data do Firebase se disponível
            let dateText = 'Data do sorteio a definir';
            if (config.drawDate) {
                try {
                    // Tentar múltiplos formatos de data
                    let drawDate;
                    if (typeof config.drawDate === 'string') {
                        drawDate = new Date(config.drawDate);
                    } else if (config.drawDate.toDate && typeof config.drawDate.toDate === 'function') {
                        // Firebase Timestamp
                        drawDate = config.drawDate.toDate();
                    } else if (config.drawDate instanceof Date) {
                        drawDate = config.drawDate;
                    } else {
                        throw new Error('Formato de data não reconhecido');
                    }
                    
                    if (!isNaN(drawDate.getTime())) {
                        dateText = `Sorteio: ${drawDate.toLocaleDateString('pt-BR')} às ${drawDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
                        console.log(`📅 Data do sorteio formatada: ${dateText}`);
                    } else {
                        throw new Error('Data inválida');
                    }
                } catch (dateError) {
                    console.warn('⚠️ Erro ao formatar data do sorteio:', dateError);
                    console.log('📅 Valor da data recebida:', config.drawDate);
                }
            }
            drawDateEl.textContent = dateText;
            console.log(`📅 Elemento data do sorteio atualizado para: ${dateText}`);
        }
        
        // Atualizar informações de PIX se disponível
        if (config.pixKey) {
            const pixElements = document.querySelectorAll('[data-pix-key], .pix-key');
            console.log(`💳 Encontrados ${pixElements.length} elementos PIX para atualizar`);
            pixElements.forEach((el, index) => {
                const oldValue = el.textContent;
                el.textContent = config.pixKey;
                el.setAttribute('data-pix-key', config.pixKey);
                console.log(`💳 PIX elemento ${index + 1}: "${oldValue}" → "${config.pixKey}"`);
            });
            console.log(`🔑 PIX key atualizada para: ${config.pixKey}`);
        } else {
            console.warn('⚠️ Nenhuma chave PIX encontrada na configuração');
        }
        
        // Atualizar informações de contato se disponível
        if (config.contactPhone) {
            const phoneElements = document.querySelectorAll('[data-contact-phone]');
            phoneElements.forEach(el => {
                el.textContent = config.contactPhone;
                el.setAttribute('href', `tel:${config.contactPhone}`);
            });
            console.log(`📞 Telefone atualizado para: ${config.contactPhone}`);
        }

        // Atualizar email de contato se disponível
        if (config.contactEmail) {
            const emailElements = document.querySelectorAll('[data-contact-email]');
            emailElements.forEach(el => {
                el.textContent = config.contactEmail;
                el.setAttribute('href', `mailto:${config.contactEmail}`);
            });
            console.log(`📧 Email atualizado para: ${config.contactEmail}`);
        }
        
        // Atualizar nome do bebê se disponível
        if (config.babyName) {
            const babyNameElements = document.querySelectorAll('[data-baby-name], .baby-name');
            babyNameElements.forEach(el => {
                el.textContent = config.babyName;
            });
            console.log(`👶 Nome do bebê atualizado para: ${config.babyName}`);
        }
        
        console.log('✅ Configurações aplicadas na interface com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao aplicar configurações na interface:', error);
    }
}

// Inicializar configurações da rifa (FIREBASE + UI)
async function initializeRifa() {
    console.log('🎯 Inicializando configurações da rifa...');
    
    // Limpar estado local
    rifaState.selectedNumbers = new Set();
    rifaState.soldNumbers = new Set();
    rifaState.reservedNumbers = new Set();
    
    // Carregar configurações do Firebase
    const config = await loadConfigurationFromFirebase();
    
    // Atualizar configuração global
    currentConfig = { ...config };
    console.log('🔧 Configuração global atualizada:', currentConfig);
    
    // Aplicar configurações na interface
    applyConfigurationToUI(config);
    
    // Verificar se os números já foram gerados
    const grid = document.getElementById('numbers-grid');
    if (grid && grid.children.length === 0) {
        console.log('🔢 Gerando grade de números com configurações carregadas...');
        generateNumbers(config);  // Passar configuração
    }
    
    console.log('✅ Rifa inicializada com configurações carregadas');
    
    // Retornar configurações para uso posterior se necessário
    return config;
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

// Gerar grade de números (com configuração dinâmica)
function generateNumbers(config = null) {
    const grid = document.getElementById('numbers-grid');
    if (!grid) {
        console.error('❌ Elemento numbers-grid não encontrado!');
        return;
    }
    
    // Usar configuração fornecida ou padrão
    const totalNumbers = config?.totalNumbers || RIFA_CONFIG.totalNumbers;
    
    console.log('🎲 Iniciando geração de números da rifa...');
    console.log(`📊 Total de números: ${totalNumbers}`);
    grid.innerHTML = '';
    
    for (let i = 1; i <= totalNumbers; i++) {
        const numberCard = createNumberCard(i);
        grid.appendChild(numberCard);
    }
    
    console.log(`✅ ${totalNumbers} números gerados com sucesso!`);
}

// Criar card de número
function createNumberCard(number) {
    const card = document.createElement('div');
    card.className = 'number-card';
    card.id = `number-${number}`;
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
    const totalAmount = selectedCount * currentConfig.ticketPrice;
    
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
    
    if (number >= 1 && number <= currentConfig.totalNumbers) {
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
    const totalAmount = selectedNumbers.length * currentConfig.ticketPrice;
    
    const numbersDiv = document.getElementById('modal-selected-numbers');
    numbersDiv.innerHTML = selectedNumbers.map(num => 
        `<span class="selected-number-badge">${num.toString().padStart(3, '0')}</span>`
    ).join('');
    
    document.getElementById('modal-total-amount').textContent = totalAmount.toFixed(2);
}

// Processar compra - APENAS FIREBASE
async function handlePurchase(e) {
    e.preventDefault();
    
    console.log('🛒 Iniciando processo de compra...');
    
    const formData = new FormData(e.target);
    const purchaseData = {
        buyerName: formData.get('buyer-name') || document.getElementById('buyer-name').value,
        buyerPhone: formData.get('buyer-phone') || document.getElementById('buyer-phone').value,
        paymentMethod: formData.get('payment-method') || document.getElementById('payment-method').value,
        numbers: Array.from(rifaState.selectedNumbers),
        totalAmount: rifaState.selectedNumbers.size * currentConfig.ticketPrice,
        date: new Date().toISOString(),
        status: 'pending'
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

// Atualizar display de todos os números
function updateNumbersDisplay() {
    console.log('🔄 Atualizando exibição de números...');
    console.log(`📊 Estado atual: ${rifaState.soldNumbers.size} vendidos, ${rifaState.reservedNumbers.size} reservados, ${rifaState.selectedNumbers.size} selecionados`);
    
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
    const container = document.querySelector('.numbers-container');
    if (container) {
        container.classList.add('loading');
    }
    
    // Configurar timeout para garantir que algo seja exibido
    const displayTimeout = setTimeout(() => {
        if (container && container.classList.contains('loading')) {
            console.log('⏱️ Timeout na atualização de números, removendo status de loading...');
            container.classList.remove('loading');
        }
    }, 3000);
    
    try {
        let updatedCount = 0;
        let soldCount = 0;
        let reservedCount = 0;
        let availableCount = 0;
        let selectedCount = 0;
        
        // Atualizar visibilidade de cada número com base no estado atual
        for (let i = 1; i <= currentConfig.totalNumbers; i++) {
            const element = document.getElementById(`number-${i}`);
            if (!element) {
                console.warn(`⚠️ Elemento number-${i} não encontrado`);
                continue;
            }
            
            // Remover todas as classes de status
            element.classList.remove('sold', 'selected', 'reserved', 'available');
            
            // Aplicar classe apropriada baseada no estado
            if (rifaState.soldNumbers.has(i)) {
                element.classList.add('sold');
                soldCount++;
                // Log detalhado para números vendidos
                if (soldCount <= 5) { // Apenas primeiros 5 para não poluir log
                    console.log(`🔴 Número ${i} marcado como VENDIDO`);
                }
            } else if (rifaState.reservedNumbers.has(i)) {
                element.classList.add('reserved');
                reservedCount++;
                // Log detalhado para números reservados
                if (reservedCount <= 5) { // Apenas primeiros 5 para não poluir log
                    console.log(`🟡 Número ${i} marcado como RESERVADO`);
                }
            } else if (rifaState.selectedNumbers.has(i)) {
                element.classList.add('selected');
                selectedCount++;
            } else {
                element.classList.add('available');
                availableCount++;
            }
            
            updatedCount++;
        }
        
        // Remover loader quando terminar
        if (container) {
            container.classList.remove('loading');
        }
        clearTimeout(displayTimeout);
        
        console.log('📊 ATUALIZAÇÃO DE DISPLAY CONCLUÍDA:');
        console.log(`  🔴 ${soldCount} números marcados como vendidos`);
        console.log(`  🟡 ${reservedCount} números marcados como reservados`);
        console.log(`  🔵 ${selectedCount} números selecionados pelo usuário`);
        console.log(`  ⚪ ${availableCount} números disponíveis`);
        console.log(`  📈 Total atualizado: ${updatedCount}/${currentConfig.totalNumbers}`);
        
        if (soldCount > 0) {
            console.log(`  🔢 Números vendidos: [${Array.from(rifaState.soldNumbers).sort((a,b) => a-b).join(', ')}]`);
        }
        if (reservedCount > 0) {
            console.log(`  🔢 Números reservados: [${Array.from(rifaState.reservedNumbers).sort((a,b) => a-b).join(', ')}]`);
        }
        
        console.log('✅ Exibição de números atualizada com sucesso');
    } catch (error) {
        console.error('❌ Erro ao atualizar exibição:', error);
        // Garantir que o loader seja removido mesmo em caso de erro
        if (container) {
            container.classList.remove('loading');
        }
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

Chave PIX: ${currentConfig.pixKey || RIFA_CONFIG.pixKey}
Sorteio: 11 de Julho às 16h

Obrigado por ajudar na chegada do pequeno astronauta Thomas! 🌟`;
    
    alert(message);
}

// Contador regressivo
function startCountdown() {
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = (currentConfig.drawDate || RIFA_CONFIG.drawDate).getTime() - now;
        
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
        const percentage = (soldCount / currentConfig.totalNumbers) * 100;
        progressBar.style.width = `${percentage}%`;
    }
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

// Mostrar erro de Firebase
function showFirebaseError() {
    const numbersContainer = document.querySelector('.numbers-container');
    if (numbersContainer) {
        numbersContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <h3>❌ Erro de Conexão</h3>
                <p>Não foi possível conectar ao Firebase.</p>
                <p>A aplicação não funcionará sem conexão com o servidor.</p>
                <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    🔄 Recarregar Página
                </button>
            </div>
        `;
    }
}

// ========================================
// FUNÇÕES DE DEBUG PARA SINCRONIZAÇÃO
// ========================================

// Função global para debug da sincronização
window.debugRifaSync = async function() {
    console.log('🔧 INICIANDO DEBUG DA SINCRONIZAÇÃO');
    console.log('=====================================');
    
    try {
        // 1. Verificar estado atual
        console.log('📊 ESTADO ATUAL:');
        console.log('  Firebase Ready:', rifaState.firebaseReady);
        console.log('  Números vendidos:', Array.from(rifaState.soldNumbers).sort((a,b) => a-b));
        console.log('  Números reservados:', Array.from(rifaState.reservedNumbers).sort((a,b) => a-b));
        console.log('  Listener ativo:', rifaState.unsubscribe ? 'Sim' : 'Não');
        
        // 2. Recarregar dados do Firebase
        console.log('\n🔄 RECARREGANDO DADOS DO FIREBASE...');
        if (typeof window.FirebaseDB !== 'undefined') {
            await loadSoldNumbersFromFirebase();
        } else {
            console.error('❌ FirebaseDB não disponível');
        }
        
        // 3. Forçar atualização visual
        console.log('\n🎨 FORÇANDO ATUALIZAÇÃO VISUAL...');
        updateNumbersDisplay();
        updateStatistics();
        
        console.log('\n✅ DEBUG CONCLUÍDO');
        console.log('=====================================');
        
        return {
            firebaseReady: rifaState.firebaseReady,
            soldNumbers: Array.from(rifaState.soldNumbers),
            reservedNumbers: Array.from(rifaState.reservedNumbers),
            hasListener: !!rifaState.unsubscribe
        };
        
    } catch (error) {
        console.error('❌ ERRO NO DEBUG:', error);
        return { error: error.message };
    }
};

// Função para simular mudança do admin (para teste)
window.simulateAdminUpdate = async function(purchaseId, newStatus = 'confirmed') {
    console.log(`🎭 SIMULANDO ATUALIZAÇÃO ADMIN: ${purchaseId} → ${newStatus}`);
    
    try {
        if (typeof window.FirebaseDB === 'undefined') {
            throw new Error('Firebase não disponível');
        }
        
        const result = await window.FirebaseDB.updatePurchaseStatus(purchaseId, newStatus);
        
        if (result.success) {
            console.log('✅ Simulação bem-sucedida - aguardando listener...');
            return { success: true };
        } else {
            console.error('❌ Falha na simulação:', result.error);
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error('❌ Erro na simulação:', error);
        return { success: false, error: error.message };
    }
};

// Função para comparar dados entre recarregamento e listener
window.compareDataSources = async function() {
    console.log('🔍 COMPARANDO FONTES DE DADOS');
    console.log('==============================');
    
    try {
        // Dados atuais do estado
        const currentSold = Array.from(rifaState.soldNumbers).sort((a,b) => a-b);
        const currentReserved = Array.from(rifaState.reservedNumbers).sort((a,b) => a-b);
        
        console.log('📊 DADOS ATUAIS (do listener):');
        console.log('  Vendidos:', currentSold);
        console.log('  Reservados:', currentReserved);
        
        // Carregar dados direto do Firebase
        console.log('\n📡 CARREGANDO DIRETO DO FIREBASE...');
        const result = await window.FirebaseDB.loadPurchases();
        
        if (result.success) {
            const freshSold = [];
            const freshReserved = [];
            
            result.data.forEach(purchase => {
                if (Array.isArray(purchase.numbers)) {
                    if (purchase.status === 'confirmed') {
                        freshSold.push(...purchase.numbers);
                    } else if (['pending', 'reserved', 'pending_donation'].includes(purchase.status)) {
                        freshReserved.push(...purchase.numbers);
                    }
                }
            });
            
            freshSold.sort((a,b) => a-b);
            freshReserved.sort((a,b) => a-b);
            
            console.log('\n📡 DADOS FRESCOS (direto do Firebase):');
            console.log('  Vendidos:', freshSold);
            console.log('  Reservados:', freshReserved);
            
            // Comparar
            const soldMatch = JSON.stringify(currentSold) === JSON.stringify(freshSold);
            const reservedMatch = JSON.stringify(currentReserved) === JSON.stringify(freshReserved);
            
            console.log('\n🔍 COMPARAÇÃO:');
            console.log('  Vendidos sincronizados:', soldMatch ? '✅' : '❌');
            console.log('  Reservados sincronizados:', reservedMatch ? '✅' : '❌');
            
            if (!soldMatch) {
                console.log('  Diferença vendidos - Atual:', currentSold, 'Fresh:', freshSold);
            }
            if (!reservedMatch) {
                console.log('  Diferença reservados - Atual:', currentReserved, 'Fresh:', freshReserved);
            }
            
            return {
                synchronized: soldMatch && reservedMatch,
                current: { sold: currentSold, reserved: currentReserved },
                fresh: { sold: freshSold, reserved: freshReserved }
            };
            
        } else {
            console.error('❌ Erro ao carregar dados frescos:', result.error);
            return { error: result.error };
        }
        
    } catch (error) {
        console.error('❌ Erro na comparação:', error);
        return { error: error.message };
    }
};

console.log('🔧 Funções de debug carregadas:');
console.log('  - window.debugRifaSync() - Debug completo');
console.log('  - window.simulateAdminUpdate(id, status) - Simular mudança admin');
console.log('  - window.compareDataSources() - Comparar dados listener vs Firebase');
