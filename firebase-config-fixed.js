// Configuração do Firebase para Rifa Thomas
// Versão compatível com browsers modernos

(function() {
    'use strict';
    
    // Log inicial
    console.log('🔥 Iniciando carregamento do Firebase...');
    
    // Configuração do Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDtB1YfeOLWm6_xH1pI8mXJzO-IxIC4vHc",
        authDomain: "rifa-cha-thomas.firebaseapp.com",
        projectId: "rifa-cha-thomas",
        storageBucket: "rifa-cha-thomas.firebasestorage.app",
        messagingSenderId: "761618695276",
        appId: "1:761618695276:web:bf72f84cbbf5026fa74449"
    };

    // Flag para controlar inicialização
    let firebaseInitialized = false;
    let initPromise = null;

    // Função para inicializar Firebase
    async function initializeFirebase() {
        if (firebaseInitialized) {
            return window.FirebaseDB;
        }

        if (initPromise) {
            return initPromise;
        }

        console.log('🔥 Configurando Firebase...');

        initPromise = new Promise(async (resolve, reject) => {
            try {
                // Verificar se Firebase já está carregado globalmente
                if (typeof firebase !== 'undefined') {
                    console.log('🔥 Usando Firebase compat global');
                    
                    // Inicializar Firebase se não estiver inicializado
                    if (!firebase.apps.length) {
                        firebase.initializeApp(firebaseConfig);
                    }
                    
                    const db = firebase.firestore();
                    const auth = firebase.auth();
                    
                    createFirebaseDB(db, auth);
                    resolve(window.FirebaseDB);
                    return;
                }

                // Tentar carregar módulos ES6
                console.log('🔥 Carregando módulos Firebase ES6...');
                
                const [
                    { initializeApp },
                    { getFirestore, doc, setDoc, getDoc, getDocs, collection, onSnapshot, updateDoc, deleteDoc, query, where, orderBy },
                    { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged }
                ] = await Promise.all([
                    import('https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js'),
                    import('https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js'),
                    import('https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js')
                ]);

                const app = initializeApp(firebaseConfig);
                const db = getFirestore(app);
                const auth = getAuth(app);

                createFirebaseDBModular(db, auth, { 
                    doc, setDoc, getDoc, getDocs, collection, onSnapshot, updateDoc, deleteDoc, query, where, orderBy,
                    signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged
                });

                resolve(window.FirebaseDB);

            } catch (error) {
                console.warn('⚠️ Erro ao carregar Firebase:', error);
                console.log('📦 Criando mock do Firebase para localStorage...');
                
                createFirebaseMock();
                resolve(window.FirebaseDB);
            }
        });

        return initPromise;
    }

    // Criar FirebaseDB com Firebase compat
    function createFirebaseDB(db, auth) {
        console.log('✅ Criando FirebaseDB com Firebase compat');
        
        window.FirebaseDB = {
            // Email autorizado do admin
            ADMIN_AUTORIZADO: 'admin@rifathomas.com',

            // Inicializar autenticação anônima
            async initAuth() {
                return new Promise((resolve) => {
                    auth.onAuthStateChanged((user) => {
                        if (user) {
                            console.log('✅ Usuário autenticado:', user.uid);
                            resolve(user);
                        } else {
                            auth.signInAnonymously().then((result) => {
                                console.log('✅ Autenticação anônima realizada:', result.user.uid);
                                resolve(result.user);
                            });
                        }
                    });
                });
            },

            // Login de administrador
            async adminLogin(email, password) {
                try {
                    console.log(`🔐 Tentando login admin: ${email}`);
                    
                    if (email !== this.ADMIN_AUTORIZADO) {
                        return { success: false, error: 'Email não autorizado para admin' };
                    }

                    const userCredential = await auth.signInWithEmailAndPassword(email, password);
                    console.log('✅ Login admin realizado com sucesso');
                    return { success: true, user: userCredential.user };
                } catch (error) {
                    console.error('❌ Erro no login admin:', error);
                    return { success: false, error: error.message };
                }
            },

            // Criar conta de administrador
            async createAdmin(email, password) {
                try {
                    console.log(`👤 Criando admin: ${email}`);
                    
                    if (email !== this.ADMIN_AUTORIZADO) {
                        return { success: false, error: 'Apenas o email admin@rifathomas.com pode ser admin' };
                    }

                    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                    
                    // Adicionar à coleção de admins
                    await db.collection('admin_users').doc(userCredential.user.uid).set({
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        role: 'admin'
                    });

                    console.log('✅ Admin criado com sucesso');
                    return { success: true, user: userCredential.user };
                } catch (error) {
                    console.error('❌ Erro ao criar admin:', error);
                    return { success: false, error: error.message };
                }
            },

            // Verificar se usuário é admin
            async isAdmin(userId) {
                try {
                    const adminDoc = await db.collection('admin_users').doc(userId).get();
                    return adminDoc.exists;
                } catch (error) {
                    console.error('❌ Erro ao verificar admin:', error);
                    return false;
                }
            },

            // Obter admin atual
            async getCurrentAdmin() {
                try {
                    const user = auth.currentUser;
                    if (user) {
                        const isAdmin = await this.isAdmin(user.uid);
                        return { success: true, user: user, isAdmin: isAdmin };
                    } else {
                        return { success: false, error: 'Nenhum usuário autenticado' };
                    }
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // Salvar compra
            async savePurchase(purchaseData) {
                try {
                    console.log('💾 Salvando compra no Firebase...');
                    const docRef = await db.collection('purchases').add({
                        ...purchaseData,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
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
                    console.log('📥 Carregando compras do Firebase...');
                    const snapshot = await db.collection('purchases').orderBy('createdAt', 'desc').get();
                    const purchases = [];
                    snapshot.forEach(doc => {
                        purchases.push({ id: doc.id, ...doc.data() });
                    });
                    console.log(`✅ ${purchases.length} compras carregadas`);
                    return { success: true, data: purchases };
                } catch (error) {
                    console.error('❌ Erro ao carregar compras:', error);
                    return { success: false, error: error.message };
                }
            },

            // Obter números vendidos
            async getSoldNumbers() {
                try {
                    console.log('🔢 Buscando números vendidos...');
                    const snapshot = await db.collection('purchases')
                        .where('status', '==', 'confirmed')
                        .get();
                    
                    const soldNumbers = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.numbers) {
                            soldNumbers.push(...data.numbers);
                        }
                    });
                    
                    console.log(`✅ ${soldNumbers.length} números vendidos encontrados`);
                    return { success: true, data: soldNumbers };
                } catch (error) {
                    console.error('❌ Erro ao buscar números vendidos:', error);
                    return { success: false, error: error.message };
                }
            },

            // Listener para mudanças nas compras
            onPurchasesChange(callback) {
                console.log('👁️ Configurando listener para compras...');
                return db.collection('purchases').onSnapshot((snapshot) => {
                    const purchases = [];
                    snapshot.forEach(doc => {
                        purchases.push({ id: doc.id, ...doc.data() });
                    });
                    callback(purchases);
                });
            },

            // Atualizar status da compra
            async updatePurchaseStatus(purchaseId, status, additionalData = {}) {
                try {
                    console.log(`🔄 Atualizando compra ${purchaseId} para ${status}`);
                    await db.collection('purchases').doc(purchaseId).update({
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
            }
        };

        firebaseInitialized = true;
        console.log('🎉 FirebaseDB configurado com sucesso!');
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('firebaseReady'));
    }

    // Criar FirebaseDB com módulos ES6
    function createFirebaseDBModular(db, auth, modules) {
        console.log('✅ Criando FirebaseDB com módulos ES6');
        
        const { 
            doc, setDoc, getDoc, getDocs, collection, onSnapshot, updateDoc, deleteDoc, query, where, orderBy,
            signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged
        } = modules;

        window.FirebaseDB = {
            ADMIN_AUTORIZADO: 'admin@rifathomas.com',

            async initAuth() {
                return new Promise((resolve) => {
                    onAuthStateChanged(auth, (user) => {
                        if (user) {
                            console.log('✅ Usuário autenticado:', user.uid);
                            resolve(user);
                        } else {
                            signInAnonymously(auth).then((result) => {
                                console.log('✅ Autenticação anônima realizada:', result.user.uid);
                                resolve(result.user);
                            });
                        }
                    });
                });
            },

            async adminLogin(email, password) {
                try {
                    console.log(`🔐 Tentando login admin: ${email}`);
                    
                    if (email !== this.ADMIN_AUTORIZADO) {
                        return { success: false, error: 'Email não autorizado para admin' };
                    }

                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    console.log('✅ Login admin realizado com sucesso');
                    return { success: true, user: userCredential.user };
                } catch (error) {
                    console.error('❌ Erro no login admin:', error);
                    return { success: false, error: error.message };
                }
            },

            async createAdmin(email, password) {
                try {
                    console.log(`👤 Criando admin: ${email}`);
                    
                    if (email !== this.ADMIN_AUTORIZADO) {
                        return { success: false, error: 'Apenas o email admin@rifathomas.com pode ser admin' };
                    }

                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    
                    await setDoc(doc(db, 'admin_users', userCredential.user.uid), {
                        email: email,
                        createdAt: new Date(),
                        role: 'admin'
                    });

                    console.log('✅ Admin criado com sucesso');
                    return { success: true, user: userCredential.user };
                } catch (error) {
                    console.error('❌ Erro ao criar admin:', error);
                    return { success: false, error: error.message };
                }
            },

            async isAdmin(userId) {
                try {
                    const adminDoc = await getDoc(doc(db, 'admin_users', userId));
                    return adminDoc.exists();
                } catch (error) {
                    console.error('❌ Erro ao verificar admin:', error);
                    return false;
                }
            },

            async getCurrentAdmin() {
                try {
                    const user = auth.currentUser;
                    if (user) {
                        const isAdmin = await this.isAdmin(user.uid);
                        return { success: true, user: user, isAdmin: isAdmin };
                    } else {
                        return { success: false, error: 'Nenhum usuário autenticado' };
                    }
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            async savePurchase(purchaseData) {
                try {
                    console.log('💾 Salvando compra no Firebase...');
                    const docRef = await setDoc(doc(collection(db, 'purchases')), {
                        ...purchaseData,
                        createdAt: new Date()
                    });
                    console.log('✅ Compra salva');
                    return { success: true, id: docRef.id };
                } catch (error) {
                    console.error('❌ Erro ao salvar compra:', error);
                    return { success: false, error: error.message };
                }
            },

            async loadPurchases() {
                try {
                    console.log('📥 Carregando compras do Firebase...');
                    const snapshot = await getDocs(query(collection(db, 'purchases'), orderBy('createdAt', 'desc')));
                    const purchases = [];
                    snapshot.forEach(doc => {
                        purchases.push({ id: doc.id, ...doc.data() });
                    });
                    console.log(`✅ ${purchases.length} compras carregadas`);
                    return { success: true, data: purchases };
                } catch (error) {
                    console.error('❌ Erro ao carregar compras:', error);
                    return { success: false, error: error.message };
                }
            },

            async getSoldNumbers() {
                try {
                    console.log('🔢 Buscando números vendidos...');
                    const snapshot = await getDocs(query(collection(db, 'purchases'), where('status', '==', 'confirmed')));
                    
                    const soldNumbers = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.numbers) {
                            soldNumbers.push(...data.numbers);
                        }
                    });
                    
                    console.log(`✅ ${soldNumbers.length} números vendidos encontrados`);
                    return { success: true, data: soldNumbers };
                } catch (error) {
                    console.error('❌ Erro ao buscar números vendidos:', error);
                    return { success: false, error: error.message };
                }
            },

            onPurchasesChange(callback) {
                console.log('👁️ Configurando listener para compras...');
                return onSnapshot(collection(db, 'purchases'), (snapshot) => {
                    const purchases = [];
                    snapshot.forEach(doc => {
                        purchases.push({ id: doc.id, ...doc.data() });
                    });
                    callback(purchases);
                });
            },

            async updatePurchaseStatus(purchaseId, status, additionalData = {}) {
                try {
                    console.log(`🔄 Atualizando compra ${purchaseId} para ${status}`);
                    await updateDoc(doc(db, 'purchases', purchaseId), {
                        status: status,
                        ...additionalData,
                        updatedAt: new Date()
                    });
                    console.log('✅ Status atualizado');
                    return { success: true };
                } catch (error) {
                    console.error('❌ Erro ao atualizar status:', error);
                    return { success: false, error: error.message };
                }
            }
        };

        firebaseInitialized = true;
        console.log('🎉 FirebaseDB modular configurado com sucesso!');
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('firebaseReady'));
    }

    // Criar mock do Firebase para localStorage
    function createFirebaseMock() {
        console.log('📦 Criando mock do Firebase para localStorage');
        
        window.FirebaseDB = {
            ADMIN_AUTORIZADO: 'admin@rifathomas.com',

            async initAuth() {
                return { uid: 'mock-user-' + Date.now(), isAnonymous: true };
            },

            async adminLogin(email, password) {
                if (email === this.ADMIN_AUTORIZADO && password) {
                    return { success: true, user: { uid: 'mock-admin', email: email } };
                }
                return { success: false, error: 'Credenciais inválidas' };
            },

            async createAdmin(email, password) {
                if (email === this.ADMIN_AUTORIZADO) {
                    return { success: true, user: { uid: 'mock-admin', email: email } };
                }
                return { success: false, error: 'Email não autorizado' };
            },

            async isAdmin(userId) {
                return userId === 'mock-admin';
            },

            async getCurrentAdmin() {
                return { success: true, user: { uid: 'mock-admin', email: this.ADMIN_AUTORIZADO }, isAdmin: true };
            },

            async savePurchase(purchaseData) {
                const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
                const newPurchase = { ...purchaseData, id: Date.now(), createdAt: new Date() };
                purchases.push(newPurchase);
                localStorage.setItem('purchases', JSON.stringify(purchases));
                return { success: true, id: newPurchase.id };
            },

            async loadPurchases() {
                const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
                return { success: true, data: purchases };
            },

            async getSoldNumbers() {
                const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
                const soldNumbers = [];
                purchases.forEach(purchase => {
                    if (purchase.status === 'confirmed' && purchase.numbers) {
                        soldNumbers.push(...purchase.numbers);
                    }
                });
                return { success: true, data: soldNumbers };
            },

            onPurchasesChange(callback) {
                // Mock listener - apenas chama uma vez
                setTimeout(() => {
                    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
                    callback(purchases);
                }, 100);
                return () => {}; // mock unsubscribe
            },

            async updatePurchaseStatus(purchaseId, status, additionalData = {}) {
                const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
                const purchaseIndex = purchases.findIndex(p => p.id == purchaseId);
                if (purchaseIndex !== -1) {
                    purchases[purchaseIndex] = { ...purchases[purchaseIndex], status, ...additionalData, updatedAt: new Date() };
                    localStorage.setItem('purchases', JSON.stringify(purchases));
                    return { success: true };
                }
                return { success: false, error: 'Compra não encontrada' };
            }
        };

        firebaseInitialized = true;
        console.log('📦 Mock Firebase configurado com localStorage');
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('firebaseReady'));
    }

    // Auto-inicializar Firebase quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFirebase);
    } else {
        initializeFirebase();
    }

    // Expor função de inicialização globalmente
    window.initializeFirebase = initializeFirebase;

})();
