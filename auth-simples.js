// ===== SISTEMA DE AUTENTICAÇÃO ADMIN SIMPLIFICADO =====

// Senha admin simplificada
const ADMIN_PASSWORD = 'inecAdmin2024';

// Função para criar autenticação simples com UI melhorada
function createSimpleAuth() {
    console.log('🔐 [AUTH] Criando sistema de autenticação simplificado...');
    
    // Verificar se já está autenticado
    const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
    const authTime = localStorage.getItem('admin_auth_time');
    
    // Verificar se a autenticação não expirou (8 horas)
    if (isAuthenticated && authTime) {
        const now = Date.now();
        const authTimestamp = parseInt(authTime);
        const eightHours = 8 * 60 * 60 * 1000; // 8 horas em ms
        
        if (now - authTimestamp < eightHours) {
            console.log('✅ [AUTH] Usuário já autenticado');
            return true;
        } else {
            console.log('⏰ [AUTH] Sessão expirada');
            localStorage.removeItem('admin_authenticated');
            localStorage.removeItem('admin_auth_time');
        }
    }
    
    // Solicitar senha com tentativas limitadas
    let tentativas = 0;
    const maxTentativas = 3;
    
    while (tentativas < maxTentativas) {
        tentativas++;
        const mensagem = tentativas === 1 
            ? '🔐 Área Administrativa - Digite a senha:' 
            : `🔐 Senha incorreta (${tentativas}/${maxTentativas}). Tente novamente:`;
            
        const senha = prompt(mensagem);
        
        // Se cancelou o prompt
        if (senha === null) {
            console.log('🚫 [AUTH] Usuário cancelou a autenticação');
            return false;
        }
        
        if (senha === ADMIN_PASSWORD) {
            localStorage.setItem('admin_authenticated', 'true');
            localStorage.setItem('admin_auth_time', Date.now().toString());
            console.log('✅ [AUTH] Autenticação bem-sucedida');
            alert('✅ Acesso autorizado! Bem-vindo à área administrativa.');
            return true;
        } else {
            console.log(`❌ [AUTH] Tentativa ${tentativas} - Senha incorreta`);
            if (tentativas < maxTentativas) {
                alert(`❌ Senha incorreta! Tentativa ${tentativas} de ${maxTentativas}.`);
            }
        }
    }
    
    // Esgotou as tentativas
    console.log('🚫 [AUTH] Número máximo de tentativas excedido');
    alert('❌ Número máximo de tentativas excedido. Acesso negado!');
    return false;
}

// Função para logout
function adminLogout() {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_time');
    console.log('🚪 [AUTH] Logout realizado');
    window.location.href = 'index.html';
}

// Função para verificar se está autenticado
function isAdminAuthenticated() {
    const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
    const authTime = localStorage.getItem('admin_auth_time');
    
    if (isAuthenticated && authTime) {
        const now = Date.now();
        const authTimestamp = parseInt(authTime);
        const eightHours = 8 * 60 * 60 * 1000;
        
        return (now - authTimestamp < eightHours);
    }
    
    return false;
}

// Criar objeto bingoAuth compatível
window.bingoAuth = {
    isAuthenticated: isAdminAuthenticated,
    logout: adminLogout,
    requireAuth: () => {
        console.log('🔐 [AUTH] requireAuth chamado');
        
        // Sempre forçar verificação, mesmo se já autenticado
        if (!isAdminAuthenticated()) {
            console.log('🔐 [AUTH] Usuário não autenticado, iniciando fluxo de login');
            const resultado = createSimpleAuth();
            console.log('🔐 [AUTH] Resultado do createSimpleAuth:', resultado);
            return resultado;
        } else {
            console.log('🔐 [AUTH] Usuário já está autenticado');
            return true;
        }
    },
    forceAuth: () => {
        console.log('🔐 [AUTH] forceAuth chamado - sempre solicitar senha');
        return createSimpleAuth();
    },
    currentUser: {
        username: 'admin',
        email: 'admin@bingo.com'
    }
};

console.log('🔐 [AUTH] Sistema de autenticação simplificado carregado');

// Adicionar logs de debug
console.log('🔍 [AUTH DEBUG] Verificando estado inicial:');
console.log('🔍 [AUTH DEBUG] localStorage admin_authenticated:', localStorage.getItem('admin_authenticated'));
console.log('🔍 [AUTH DEBUG] localStorage admin_auth_time:', localStorage.getItem('admin_auth_time'));
console.log('🔍 [AUTH DEBUG] isAdminAuthenticated():', isAdminAuthenticated());
