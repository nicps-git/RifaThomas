// Configuração de segurança para produção
// Use este arquivo se quiser implementar variáveis de ambiente

// Função para obter configuração do Firebase
function getFirebaseConfig() {
    // Em produção, você pode usar variáveis de ambiente do Netlify
    // Para configurar: Site Settings → Environment Variables no Netlify
    
    const config = {
        apiKey: "AIzaSyDrTY8pnDXwDPnWkTGYVxpKTxXy8p8zAmo",
        authDomain: "raffle-thomas.firebaseapp.com",
        projectId: "raffle-thomas",
        storageBucket: "raffle-thomas.firebasestorage.app",
        messagingSenderId: "159264133906",
        appId: "1:159264133906:web:4c02a04e29e5b0a896fe09"
    };

    // Verificar se está em desenvolvimento
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
        console.log('🔧 Modo desenvolvimento detectado');
    } else {
        console.log('🚀 Modo produção - Netlify');
    }

    return config;
}

// Exportar configuração
const firebaseConfig = getFirebaseConfig();

// Verificar se configuração está válida
function validateConfig(config) {
    const required = ['apiKey', 'authDomain', 'projectId'];
    const invalid = required.filter(key => 
        !config[key] || 
        config[key].includes('SUBSTITUA') || 
        config[key].includes('SUA_')
    );

    if (invalid.length > 0) {
        console.error('❌ Configuração do Firebase incompleta!');
        console.error('Campos faltando:', invalid);
        return false;
    }

    console.log('✅ Configuração do Firebase válida');
    return true;
}

// Validar antes de inicializar
if (!validateConfig(firebaseConfig)) {
    alert('Erro: Configure o Firebase antes de usar a aplicação!');
}

// O resto do código permanece igual...
export { firebaseConfig };
