// Configuração simplificada do Firebase para compatibilidade com ES6 modules
// Este arquivo resolve o problema "FirebaseDB não está definido"

// Importar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, onSnapshot, updateDoc, deleteDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrTY8pnDXwDPnWkTGYVxpKTxXy8p8zAmo",
  authDomain: "raffle-thomas.firebaseapp.com",
  projectId: "raffle-thomas",
  storageBucket: "raffle-thomas.firebasestorage.app",
  messagingSenderId: "159264133906",
  appId: "1:159264133906:web:4c02a04e29e5b0a896fe09"
};

console.log('📦 Inicializando Firebase...');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('✅ Firebase inicializado com sucesso');

// Criar objeto FirebaseDB com todas as funções
const FirebaseDB = {
  // Inicializar autenticação anônima
  async initAuth() {
    console.log('🔐 Iniciando autenticação anônima...');
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log('👤 Usuário já autenticado:', user.uid);
          resolve(user);
        } else {
          console.log('🔑 Fazendo login anônimo...');
          signInAnonymously(auth).then(credential => {
            console.log('✅ Login anônimo bem-sucedido:', credential.user.uid);
            resolve(credential.user);
          }).catch(error => {
            console.error('❌ Erro no login anônimo:', error);
            resolve(null);
          });
        }
      });
    });
  },

  // Login de administrador
  async adminLogin(email, password) {
    try {
      console.log('👨‍💼 Fazendo login de admin...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login admin bem-sucedido');
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Erro no login admin:', error);
      return { success: false, error: error.message };
    }
  },

  // Criar conta de administrador
  async createAdmin(email, password) {
    try {
      console.log('👨‍💼 Criando conta admin...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Adicionar role de admin
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        email: email,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      
      console.log('✅ Conta admin criada com sucesso');
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Erro ao criar admin:', error);
      return { success: false, error: error.message };
    }
  },

  // Verificar se usuário é admin
  async isAdmin(userId) {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', userId));
      return adminDoc.exists();
    } catch (error) {
      console.error('❌ Erro ao verificar admin:', error);
      return false;
    }
  },

  // Salvar compra
  async savePurchase(purchaseData) {
    try {
      console.log('💾 Salvando compra no Firestore...', purchaseData);
      const purchaseId = 'purchase_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      const dataToSave = {
        ...purchaseData,
        id: purchaseId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'purchases', purchaseId), dataToSave);
      console.log('✅ Compra salva com sucesso:', purchaseId);
      
      return { success: true, id: purchaseId };
    } catch (error) {
      console.error('❌ Erro ao salvar compra:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter todas as compras
  async getPurchases() {
    try {
      console.log('📊 Buscando todas as compras...');
      const querySnapshot = await getDocs(collection(db, 'purchases'));
      const purchases = [];
      querySnapshot.forEach((doc) => {
        purchases.push({ id: doc.id, ...doc.data() });
      });
      console.log('✅ Compras carregadas:', purchases.length);
      return { success: true, data: purchases };
    } catch (error) {
      console.error('❌ Erro ao buscar compras:', error);
      return { success: false, error: error.message };
    }
  },

  // Escutar mudanças em tempo real das compras
  onPurchasesChange(callback) {
    console.log('🔄 Configurando listener de compras...');
    return onSnapshot(collection(db, 'purchases'), (snapshot) => {
      const purchases = [];
      snapshot.forEach((doc) => {
        purchases.push({ id: doc.id, ...doc.data() });
      });
      console.log('📥 Atualização em tempo real:', purchases.length, 'compras');
      callback(purchases);
    });
  },

  // Atualizar status da compra
  async updatePurchaseStatus(purchaseId, status, additionalData = {}) {
    try {
      console.log('🔄 Atualizando status da compra:', purchaseId, status);
      await updateDoc(doc(db, 'purchases', purchaseId), {
        status: status,
        updatedAt: new Date().toISOString(),
        ...additionalData
      });
      console.log('✅ Status atualizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      return { success: false, error: error.message };
    }
  },

  // Deletar compra
  async deletePurchase(purchaseId) {
    try {
      console.log('🗑️ Deletando compra:', purchaseId);
      await deleteDoc(doc(db, 'purchases', purchaseId));
      console.log('✅ Compra deletada com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar compra:', error);
      return { success: false, error: error.message };
    }
  },

  // Salvar configurações da rifa
  async saveConfig(config) {
    try {
      console.log('⚙️ Salvando configurações...', config);
      await setDoc(doc(db, 'config', 'rifa'), {
        ...config,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Configurações salvas com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter configurações
  async getConfig() {
    try {
      console.log('📖 Buscando configurações...');
      const configDoc = await getDoc(doc(db, 'config', 'rifa'));
      if (configDoc.exists()) {
        console.log('✅ Configurações encontradas');
        return { success: true, data: configDoc.data() };
      } else {
        console.log('⚠️ Configurações não encontradas');
        return { success: false, error: 'Configuração não encontrada' };
      }
    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter números vendidos em tempo real
  async getSoldNumbers() {
    try {
      console.log('🔢 Buscando números vendidos...');
      const querySnapshot = await getDocs(
        query(collection(db, 'purchases'), where('status', '==', 'confirmed'))
      );
      const soldNumbers = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.numbers) {
          soldNumbers.push(...data.numbers);
        }
      });
      console.log('✅ Números vendidos encontrados:', soldNumbers.length);
      return { success: true, data: soldNumbers };
    } catch (error) {
      console.error('❌ Erro ao buscar números vendidos:', error);
      return { success: false, error: error.message };
    }
  },

  // Reservar números temporariamente
  async reserveNumbers(numbers, userToken) {
    try {
      console.log('🔒 Reservando números:', numbers);
      const reservationId = 'reserve_' + Date.now();
      await setDoc(doc(db, 'reservations', reservationId), {
        numbers: numbers,
        userToken: userToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
        createdAt: new Date().toISOString()
      });
      console.log('✅ Números reservados com sucesso');
      return { success: true, id: reservationId };
    } catch (error) {
      console.error('❌ Erro ao reservar números:', error);
      return { success: false, error: error.message };
    }
  },

  // Salvar resultados do sorteio
  async saveDrawResults(results) {
    try {
      console.log('🎉 Salvando resultados do sorteio...');
      await setDoc(doc(db, 'draw', 'results'), {
        ...results,
        createdAt: new Date().toISOString()
      });
      console.log('✅ Resultados salvos com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao salvar resultados:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter resultados do sorteio
  async getDrawResults() {
    try {
      console.log('🎯 Buscando resultados do sorteio...');
      const drawDoc = await getDoc(doc(db, 'draw', 'results'));
      if (drawDoc.exists()) {
        console.log('✅ Resultados encontrados');
        return { success: true, data: drawDoc.data() };
      } else {
        console.log('⚠️ Resultados não encontrados');
        return { success: false, error: 'Resultados não encontrados' };
      }
    } catch (error) {
      console.error('❌ Erro ao buscar resultados:', error);
      return { success: false, error: error.message };
    }
  }
};

// Disponibilizar globalmente
window.FirebaseDB = FirebaseDB;
window.db = db;
window.auth = auth;

console.log('🚀 FirebaseDB disponível globalmente!');
console.log('🔥 Firebase configurado para Rifa Thomas!');
