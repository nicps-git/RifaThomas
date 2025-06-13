// Configuração do Firebase para Rifa Thomas - Versão corrigida
// Firebase v9 compat para uso como script tradicional (não módulo)

// Configuração do Firebase com API Key correta
const firebaseConfig = {
  apiKey: "AIzaSyDtB1YfeOLWm6_xH1pI8mXJzO-IxIC4vHc",
  authDomain: "rifa-cha-thomas.firebaseapp.com",
  projectId: "rifa-cha-thomas",
  storageBucket: "rifa-cha-thomas.firebasestorage.app",
  messagingSenderId: "761618695276",
  appId: "1:761618695276:web:bf72f84cbbf5026fa74449"
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
  
  // Teste de conectividade com o Firestore
  db.collection('test_connection').doc('ping')
    .set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() })
    .then(() => console.log('✅ Teste de conectividade com Firestore bem-sucedido'))
    .catch(err => console.error('❌ Erro de conectividade com Firestore:', err));

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
          const docData = doc.data();
          purchases.push({
            id: doc.id,
            ...docData
          });
          
          // Log detalhado para debug inicial
          console.log(`📋 Compra carregada ${doc.id}:`, {
            status: docData.status,
            numbers: docData.numbers,
            buyerName: docData.buyerName
          });
        });
        
        console.log(`✅ ${purchases.length} compras carregadas com ordenação`);
        return { success: true, data: purchases };
      } catch (error) {
        console.error('❌ Erro ao carregar compras:', error);
        return { success: false, error: error.message };
      }
    },

    // Atualizar status da compra
    async updatePurchaseStatus(purchaseId, status, additionalData = {}) {
      try {
        console.log(`🔄 Atualizando compra ${purchaseId} para ${status}...`);
        const docRef = firebase.firestore().collection('purchases').doc(purchaseId);
        await docRef.update({ 
          status: status,
          ...additionalData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Status atualizado');
        return { success: true };
      } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
        return { success: false, error: error.message };
      }
    },

    // Atualizar dados da compra (para migração)
    async updatePurchase(purchaseId, updateData) {
      try {
        console.log(`🔄 Atualizando compra ${purchaseId}...`, updateData);
        const docRef = firebase.firestore().collection('purchases').doc(purchaseId);
        await docRef.update({ 
          ...updateData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Compra atualizada');
        return { success: true };
      } catch (error) {
        console.error('❌ Erro ao atualizar compra:', error);
        return { success: false, error: error.message };
      }
    },

    // Escutar mudanças em tempo real
    listenToChanges(collection, callback) {
      try {
        console.log(`👂 Escutando mudanças em: ${collection}`);
        const unsubscribe = firebase.firestore()
          .collection(collection)
          .orderBy('timestamp', 'desc') // Ordenar por timestamp para consistência
          .onSnapshot(snapshot => {
            console.log(`📥 Snapshot recebido: ${snapshot.size} documentos`);
            const data = [];
            
            snapshot.forEach(doc => {
              const docData = doc.data();
              data.push({
                id: doc.id,
                ...docData
              });
              
              // Log detalhado para debug
              console.log(`📋 Doc ${doc.id}:`, {
                status: docData.status,
                numbers: docData.numbers,
                buyerName: docData.buyerName
              });
            });
            
            console.log(`🔄 Chamando callback com ${data.length} itens`);
            callback(data);
          }, error => {
            console.error('❌ Erro no listener:', error);
            // Tentar reconectar em caso de erro
            setTimeout(() => {
              console.log('🔄 Tentando reconectar listener...');
              this.listenToChanges(collection, callback);
            }, 5000);
          });
        
        console.log('✅ Listener configurado com ordenação e error handling');
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
    },

    // ========== FUNÇÕES DE ADMINISTRAÇÃO ==========
    
    // Email do único administrador permitido
    ADMIN_AUTORIZADO: 'admin@rifathomas.com',
    
    // Criar conta de administrador (RESTRITO)
    async createAdmin(email, password) {
      try {
        console.log('👤 Tentando criar conta de administrador...', email);
        
        // VERIFICAR SE É O EMAIL AUTORIZADO
        if (email !== this.ADMIN_AUTORIZADO) {
          console.log('❌ Email não autorizado:', email);
          return { 
            success: false, 
            error: 'Apenas o administrador autorizado pode ter uma conta. Contate o responsável.' 
          };
        }
        
        // Verificar se já existe um admin cadastrado
        const existingAdmins = await firebase.firestore()
          .collection('admin_users')
          .where('isAdmin', '==', true)
          .get();
        
        if (!existingAdmins.empty) {
          // Se já existe um admin, verificar se é o email correto
          let isCorrectAdmin = false;
          existingAdmins.forEach(doc => {
            if (doc.data().email === this.ADMIN_AUTORIZADO) {
              isCorrectAdmin = true;
            }
          });
          
          if (isCorrectAdmin) {
            console.log('⚠️ Admin autorizado já existe');
            return { 
              success: false, 
              error: 'Conta de administrador já existe. Use a opção de login.' 
            };
          } else {
            // Limpar admins não autorizados
            console.log('🧹 Removendo admins não autorizados...');
            const batch = firebase.firestore().batch();
            existingAdmins.forEach(doc => {
              batch.delete(doc.ref);
            });
            await batch.commit();
          }
        }
        
        // Criar usuário no Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Marcar usuário como admin no Firestore
        await firebase.firestore().collection('admin_users').doc(user.uid).set({
          email: email,
          isAdmin: true,
          isAuthorized: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: null
        });
        
        console.log('✅ Admin autorizado criado:', user.uid);
        return { success: true, user: user };
      } catch (error) {
        console.error('❌ Erro ao criar conta de administrador:', error);
        
        // Se o usuário já existe no Auth, tentar fazer login
        if (error.code === 'auth/email-already-in-use') {
          console.log('⚠️ Email já existe no Auth, tentando login...');
          return await this.adminLogin(email, password);
        }
        
        return { success: false, error: error.message };
      }
    },

    // Login de administrador (RESTRITO)
    async adminLogin(email, password) {
      try {
        console.log('🔐 Fazendo login de administrador...', email);
        
        // VERIFICAR SE É O EMAIL AUTORIZADO
        if (email !== this.ADMIN_AUTORIZADO) {
          console.log('❌ Login não autorizado:', email);
          return { 
            success: false, 
            error: 'Acesso negado. Apenas o administrador autorizado pode fazer login.' 
          };
        }
        
        // Fazer login no Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Verificar se o usuário tem registro como admin autorizado
        const adminDoc = await firebase.firestore().collection('admin_users').doc(user.uid).get();
        
        if (!adminDoc.exists) {
          // Se não existe registro, criar automaticamente
          await firebase.firestore().collection('admin_users').doc(user.uid).set({
            email: email,
            isAdmin: true,
            isAuthorized: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
          console.log('✅ Registro de admin criado automaticamente');
        } else {
          // Atualizar último login
          await firebase.firestore().collection('admin_users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            isAuthorized: true // Garantir que está marcado como autorizado
          });
        }
        
        console.log('✅ Login de administrador autorizado realizado:', user.uid);
        return { success: true, user: user };
      } catch (error) {
        console.error('❌ Erro no login de administrador:', error);
        
        // Personalizar mensagens de erro
        let errorMessage = error.message;
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Usuário não encontrado';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Senha incorreta';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
        }
        
        return { success: false, error: errorMessage };
      }
    },

    // Verificar se usuário é administrador (COM VERIFICAÇÃO DE AUTORIZAÇÃO)
    async isAdmin(uid) {
      try {
        console.log('🔍 Verificando se usuário é admin autorizado...', uid);
        
        const docRef = firebase.firestore().collection('admin_users').doc(uid);
        const doc = await docRef.get();
        
        if (doc.exists) {
          const data = doc.data();
          
          // Verificar se é admin E se é autorizado E se tem o email correto
          const isAdmin = data.isAdmin === true;
          const isAuthorized = data.isAuthorized === true;
          const hasCorrectEmail = data.email === this.ADMIN_AUTORIZADO;
          
          const isValidAdmin = isAdmin && isAuthorized && hasCorrectEmail;
          
          console.log(`✅ Verificação de admin: isAdmin=${isAdmin}, isAuthorized=${isAuthorized}, correctEmail=${hasCorrectEmail}, valid=${isValidAdmin}`);
          
          // Se não é autorizado ou não tem email correto, remover da coleção
          if (isAdmin && (!isAuthorized || !hasCorrectEmail)) {
            console.log('🧹 Removendo admin não autorizado...');
            await docRef.delete();
            return false;
          }
          
          return isValidAdmin;
        } else {
          console.log('⚠️ Usuário não encontrado na coleção admin_users');
          return false;
        }
      } catch (error) {
        console.error('❌ Erro ao verificar admin:', error);
        return false;
      }
    },

    // Logout de administrador
    async adminLogout() {
      try {
        console.log('🚪 Fazendo logout de administrador...');
        await auth.signOut();
        console.log('✅ Logout realizado');
        return { success: true };
      } catch (error) {
        console.error('❌ Erro no logout:', error);
        return { success: false, error: error.message };
      }
    },

    // Verificar se há admin autenticado
    async getCurrentAdmin() {
      try {
        console.log('🔍 Verificando admin atual...');
        
        // Verificar se Auth está inicializado
        if (!firebase.auth()) {
          console.error('❌ Firebase Auth não inicializado');
          return { success: false, error: 'Firebase Auth não está disponível' };
        }
        
        // Aguardar o estado de autenticação ser resolvido com timeout
        const user = await Promise.race([
          new Promise((resolve) => {
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
              unsubscribe();
              resolve(user);
            });
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout na verificação de autenticação')), 5000))
        ]).catch(error => {
          console.error('⏱️ Timeout ou erro na verificação de auth:', error);
          return null;
        });
        
        if (user) {
          console.log(`✓ Usuário encontrado: ${user.email} (${user.uid})`);
          try {
            const isAdmin = await this.isAdmin(user.uid);
            
            if (isAdmin) {
              console.log('✓ Usuário confirmado como admin');
              return { success: true, user: user, isAdmin: true };
            } else {
              console.log('✗ Usuário não tem permissões de admin');
              return { success: false, error: 'Usuário não tem permissões de administrador' };
            }
          } catch (adminError) {
            console.error('❌ Erro ao verificar permissões de admin:', adminError);
            return { success: false, error: 'Falha ao verificar permissões de admin: ' + adminError.message };
          }
        } else {
          console.log('✗ Nenhum usuário autenticado');
          return { success: false, error: 'Nenhum administrador autenticado' };
        }
      } catch (error) {
        console.error('❌ Erro ao verificar admin atual:', error);
        return { success: false, error: error.message };
      }
    },

    // Listar todos os administradores
    async listAdmins() {
      try {
        console.log('📋 Listando administradores...');
        const snapshot = await firebase.firestore()
          .collection('admin_users')
          .where('isAdmin', '==', true)
          .orderBy('createdAt', 'desc')
          .get();
        
        const admins = [];
        snapshot.forEach(doc => {
          admins.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`✅ ${admins.length} administradores encontrados`);
        return { success: true, data: admins };
      } catch (error) {
        console.error('❌ Erro ao listar administradores:', error);
        return { success: false, error: error.message };
      }
    },

    // Limpar todos os admins não autorizados (FUNÇÃO DE SEGURANÇA)
    async cleanUnauthorizedAdmins() {
      try {
        console.log('🧹 Limpando administradores não autorizados...');
        
        const snapshot = await firebase.firestore()
          .collection('admin_users')
          .get();
        
        const batch = firebase.firestore().batch();
        let removedCount = 0;
        
        snapshot.forEach(doc => {
          const data = doc.data();
          const email = data.email;
          
          // Remover se não for o email autorizado
          if (email !== this.ADMIN_AUTORIZADO) {
            console.log(`🗑️ Removendo admin não autorizado: ${email}`);
            batch.delete(doc.ref);
            removedCount++;
          }
        });
        
        if (removedCount > 0) {
          await batch.commit();
          console.log(`✅ ${removedCount} admin(s) não autorizado(s) removido(s)`);
        } else {
          console.log('✅ Nenhum admin não autorizado encontrado');
        }
        
        return { success: true, removed: removedCount };
      } catch (error) {
        console.error('❌ Erro ao limpar admins não autorizados:', error);
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
    ADMIN_AUTORIZADO: 'admin@rifathomas.com',
    initAuth: async () => ({ uid: 'mock-user' }),
    saveConfig: async () => ({ success: false, error: 'Firebase não disponível' }),
    loadConfig: async () => ({ success: false, error: 'Firebase não disponível' }),
    savePurchase: async () => ({ success: false, error: 'Firebase não disponível' }),
    loadPurchases: async () => ({ success: false, error: 'Firebase não disponível' }),
    updatePurchaseStatus: async () => ({ success: false, error: 'Firebase não disponível' }),
    listenToChanges: () => null,
    isNumberAvailable: async () => true,
    getStats: async () => ({ success: false, error: 'Firebase não disponível' }),
    // Funções de administração (mock)
    createAdmin: async () => ({ success: false, error: 'Firebase não disponível' }),
    adminLogin: async () => ({ success: false, error: 'Firebase não disponível' }),
    isAdmin: async () => false,
    adminLogout: async () => ({ success: false, error: 'Firebase não disponível' }),
    getCurrentAdmin: async () => ({ success: false, error: 'Firebase não disponível' }),
    listAdmins: async () => ({ success: false, error: 'Firebase não disponível' }),
    cleanUnauthorizedAdmins: async () => ({ success: false, error: 'Firebase não disponível' })
  };
  
  console.log('⚠️ Usando versão mock do FirebaseDB');
});
