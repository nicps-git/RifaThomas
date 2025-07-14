// Configuração do Firebase para Rifa Thomas - Versão corrigida
// Firebase v9 compat para uso como script tradicional (não módulo)

// Configuração do Firebase com API Key correta
const firebaseConfig = {
  apiKey: "AIzaSyDrTY8pnDXwDPnWkTGYVxpKTxXy8p8zAmo",
  authDomain: "raffle-thomas.firebaseapp.com",
  projectId: "raffle-thomas",
  storageBucket: "raffle-thomas.firebasestorage.app",
  messagingSenderId: "159264133906",
  appId: "1:159264133906:web:4c02a04e29e5b0a896fe09"
};

console.log('🔄 Carregando Firebase...');

// Aguardar Firebase v9 compat estar disponível
function waitForFirebase() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50;
    
    const check = () => {
      if (typeof firebase !== 'undefined') {
        console.log('✅ Firebase compat carregado');
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('Timeout: Firebase não carregou'));
      } else {
        attempts++;
        setTimeout(check, 100);
      }
    };
    
    check();
  });
}

// Inicializar Firebase quando disponível
waitForFirebase().then(() => {
  console.log('🚀 Inicializando Firebase App...');
  
  // Inicializar Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase App inicializado');
  }
  
  // Obter instâncias dos serviços
  const db = firebase.firestore();
  const auth = firebase.auth();
  
  console.log('🔗 Serviços Firebase obtidos');
  
  // Criar objeto FirebaseDB global
  window.FirebaseDB = {
    // Inicializar autenticação anônima
    async initAuth() {
      try {
        console.log('🔐 Iniciando autenticação anônima...');
        const userCredential = await auth.signInAnonymously();
        console.log('✅ Autenticação bem-sucedida:', userCredential.user.uid);
        return userCredential.user;
      } catch (error) {
        console.error('❌ Erro na autenticação:', error);
        throw error;
      }
    },

    // Salvar configuração da rifa
    async saveConfig(config) {
      try {
        console.log('💾 Salvando configuração...', config);
        const docRef = firebase.firestore().collection('rifa_config').doc('main');
        await docRef.set(config, { merge: true });
        console.log('✅ Configuração salva');
        return { success: true };
      } catch (error) {
        console.error('❌ Erro ao salvar configuração:', error);
        return { success: false, error: error.message };
      }
    },

    // Carregar configuração da rifa
    async loadConfig() {
      try {
        console.log('📖 Carregando configuração...');
        const docRef = firebase.firestore().collection('rifa_config').doc('main');
        const doc = await docRef.get();
        
        if (doc.exists) {
          console.log('✅ Configuração carregada');
          return { success: true, data: doc.data() };
        } else {
          console.log('⚠️ Configuração não encontrada');
          return { success: false, error: 'Configuração não encontrada' };
        }
      } catch (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        return { success: false, error: error.message };
      }
    },

    // Salvar compra
    async savePurchase(purchaseData) {
      try {
        console.log('🛒 Salvando compra...', purchaseData);
        
        // Adicionar timestamp
        purchaseData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        purchaseData.status = 'pending';
        
        const docRef = await firebase.firestore().collection('purchases').add(purchaseData);
        console.log('✅ Compra salva com ID:', docRef.id);
        
        return { success: true, id: docRef.id };
      } catch (error) {
        console.error('❌ Erro ao salvar compra:', error);
        return { success: false, error: error.message };
      }
    },

    // Carregar compras
    async loadPurchases() {
      try {
        console.log('📋 Carregando compras...');
        const snapshot = await firebase.firestore()
          .collection('purchases')
          .orderBy('timestamp', 'desc')
          .get();
        
        const purchases = [];
        snapshot.forEach(doc => {
          purchases.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`✅ ${purchases.length} compras carregadas`);
        return { success: true, data: purchases };
      } catch (error) {
        console.error('❌ Erro ao carregar compras:', error);
        return { success: false, error: error.message };
      }
    },

    // Atualizar status da compra
    async updatePurchaseStatus(purchaseId, status) {
      try {
        console.log(`🔄 Atualizando compra ${purchaseId} para ${status}...`);
        const docRef = firebase.firestore().collection('purchases').doc(purchaseId);
        await docRef.update({ 
          status: status,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Status atualizado');
        return { success: true };
      } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
        return { success: false, error: error.message };
      }
    },

    // Escutar mudanças em tempo real
    listenToChanges(collection, callback) {
      try {
        console.log(`👂 Escutando mudanças em: ${collection}`);
        const unsubscribe = firebase.firestore()
          .collection(collection)
          .onSnapshot(snapshot => {
            const data = [];
            snapshot.forEach(doc => {
              data.push({
                id: doc.id,
                ...doc.data()
              });
            });
            callback(data);
          });
        
        console.log('✅ Listener configurado');
        return unsubscribe;
      } catch (error) {
        console.error('❌ Erro ao configurar listener:', error);
        return null;
      }
    },

    // Verificar se número está disponível
    async isNumberAvailable(number) {
      try {
        const snapshot = await firebase.firestore()
          .collection('purchases')
          .where('numbers', 'array-contains', number)
          .where('status', 'in', ['confirmed', 'pending'])
          .get();
        
        return snapshot.empty;
      } catch (error) {
        console.error('❌ Erro ao verificar número:', error);
        return false;
      }
    },

    // Obter estatísticas
    async getStats() {
      try {
        const snapshot = await firebase.firestore()
          .collection('purchases')
          .where('status', '==', 'confirmed')
          .get();
        
        let totalSold = 0;
        let totalRevenue = 0;
        
        snapshot.forEach(doc => {
          const data = doc.data();
          totalSold += data.numbers ? data.numbers.length : 0;
          totalRevenue += data.totalAmount || 0;
        });
        
        return {
          success: true,
          data: {
            totalSold,
            totalRevenue,
            totalPurchases: snapshot.size
          }
        };
      } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        return { success: false, error: error.message };
      }
    }
  };
  
  console.log('🎉 FirebaseDB configurado e disponível globalmente');
  
  // Trigger evento personalizado para informar que Firebase está pronto
  window.dispatchEvent(new CustomEvent('firebaseReady', { 
    detail: { firebaseDB: window.FirebaseDB } 
  }));
  
}).catch(error => {
  console.error('❌ Erro ao inicializar Firebase:', error);
  
  // Criar versão mock para desenvolvimento
  window.FirebaseDB = {
    initAuth: async () => ({ uid: 'mock-user' }),
    saveConfig: async () => ({ success: false, error: 'Firebase não disponível' }),
    loadConfig: async () => ({ success: false, error: 'Firebase não disponível' }),
    savePurchase: async () => ({ success: false, error: 'Firebase não disponível' }),
    loadPurchases: async () => ({ success: false, error: 'Firebase não disponível' }),
    updatePurchaseStatus: async () => ({ success: false, error: 'Firebase não disponível' }),
    listenToChanges: () => null,
    isNumberAvailable: async () => true,
    getStats: async () => ({ success: false, error: 'Firebase não disponível' })
  };
  
  console.log('⚠️ Usando versão mock do FirebaseDB');
});
