// Configuração do Firebase para Rifa Thomas
// Inicializar Firebase com módulos ES6

// Importar funções do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, onSnapshot, updateDoc, deleteDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDtB1YfeOLWm6_xH1pI8mXJzO-IxIC4vHc",
  authDomain: "rifa-cha-thomas.firebaseapp.com",
  projectId: "rifa-cha-thomas",
  storageBucket: "rifa-cha-thomas.firebasestorage.app",
  messagingSenderId: "761618695276",
  appId: "1:761618695276:web:bf72f84cbbf5026fa74449"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Funções utilitárias do banco
window.FirebaseDB = {
  // Inicializar autenticação anônima
  async initAuth() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user);
        } else {
          signInAnonymously(auth).then(resolve);
        }
      });
    });
  },

  // Login de administrador
  async adminLogin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Criar conta de administrador
  async createAdmin(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Adicionar role de admin
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        email: email,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Verificar se usuário é admin
  async isAdmin(userId) {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', userId));
      return adminDoc.exists();
    } catch (error) {
      return false;
    }
  },

  // Salvar compra
  async savePurchase(purchaseData) {
    try {
      const purchaseId = 'purchase_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'purchases', purchaseId), {
        ...purchaseData,
        id: purchaseId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: purchaseId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter todas as compras
  async getPurchases() {
    try {
      const querySnapshot = await getDocs(collection(db, 'purchases'));
      const purchases = [];
      querySnapshot.forEach((doc) => {
        purchases.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: purchases };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Escutar mudanças em tempo real das compras
  onPurchasesChange(callback) {
    return onSnapshot(collection(db, 'purchases'), (snapshot) => {
      const purchases = [];
      snapshot.forEach((doc) => {
        purchases.push({ id: doc.id, ...doc.data() });
      });
      callback(purchases);
    });
  },

  // Atualizar status da compra
  async updatePurchaseStatus(purchaseId, status, additionalData = {}) {
    try {
      await updateDoc(doc(db, 'purchases', purchaseId), {
        status: status,
        updatedAt: new Date().toISOString(),
        ...additionalData
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Deletar compra
  async deletePurchase(purchaseId) {
    try {
      await deleteDoc(doc(db, 'purchases', purchaseId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Salvar configurações da rifa
  async saveConfig(config) {
    try {
      await setDoc(doc(db, 'config', 'rifa'), {
        ...config,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter configurações
  async getConfig() {
    try {
      const configDoc = await getDoc(doc(db, 'config', 'rifa'));
      if (configDoc.exists()) {
        return { success: true, data: configDoc.data() };
      } else {
        return { success: false, error: 'Configuração não encontrada' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter números vendidos em tempo real
  async getSoldNumbers() {
    try {
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
      return { success: true, data: soldNumbers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reservar números temporariamente
  async reserveNumbers(numbers, userToken) {
    try {
      const reservationId = 'reserve_' + Date.now();
      await setDoc(doc(db, 'reservations', reservationId), {
        numbers: numbers,
        userToken: userToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
        createdAt: new Date().toISOString()
      });
      return { success: true, id: reservationId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Salvar resultados do sorteio
  async saveDrawResults(results) {
    try {
      await setDoc(doc(db, 'draw', 'results'), {
        ...results,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter resultados do sorteio
  async getDrawResults() {
    try {
      const drawDoc = await getDoc(doc(db, 'draw', 'results'));
      if (drawDoc.exists()) {
        return { success: true, data: drawDoc.data() };
      } else {
        return { success: false, error: 'Resultados não encontrados' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Exportar para uso global
window.db = db;
window.auth = auth;

console.log('🚀 Firebase configurado para Rifa Thomas!');
