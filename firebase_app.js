import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, 
         setPersistence, browserLocalPersistence, browserSessionPersistence,
         sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase, ref, set, onDisconnect, onValue, serverTimestamp, goOffline, goOnline } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// Sua config do Firebase (pegue no Console)
const firebaseConfig = {
  // COLE AQUI SUA CONFIG:
  // apiKey: "...",
  // authDomain: "...",
  // databaseURL: "...",
  // projectId: "...",
  // storageBucket: "...",
  // messagingSenderId: "...",
  // appId: "..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Configurações
const STALE_LOCK_MS = 5 * 60 * 1000; // 5 min tolerância para lock "velho"
let currentSessionId = null;
let hasLock = false;

// UI Elements
const loginBox = document.getElementById('loginBox');
const appWrap = document.getElementById('appWrap');
const loginMsg = document.getElementById('loginMsg');

// 1. LEMBRAR-ME (localStorage + persistence)
function setupRememberMe() {
  const rememberMe = document.getElementById('rememberMe');
  const savedPref = localStorage.getItem('rememberMe') === 'true';
  rememberMe.checked = savedPref;
}

document.getElementById('rememberMe')?.addEventListener('change', (e) => {
  localStorage.setItem('rememberMe', e.target.checked);
});

// 2. BOTÃO ESQUECI MINHA SENHA
document.getElementById('btnForgotPassword')?.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  if (!email) {
    loginMsg.textContent = 'Digite seu email primeiro.';
    loginMsg.style.color = '#b00020';
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    loginMsg.textContent = 'Link de redefinição enviado para seu email!';
    loginMsg.style.color = '#2e7d32';
  } catch (error) {
    loginMsg.textContent = 'Erro ao enviar email. Verifique sua conexão.';
    loginMsg.style.color = '#b00020';
    console.error(error);
  }
});

// 3. BOTÃO ENTRAR
document.getElementById('btnLogin')?.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginSenha').value;

  if (!email || !password) {
    loginMsg.textContent = 'Preencha email e senha.';
    loginMsg.style.color = '#b00020';
    return;
  }

  loginMsg.textContent = 'Entrando...';
  loginMsg.style.color = '#1976d2';

  try {
    // Config persistence baseado em "Lembrar-me"
    const remember = document.getElementById('rememberMe').checked;
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);

    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged vai lidar com UI + sessão única
  } catch (error) {
    loginMsg.textContent = 'Email/senha inválidos ou erro de conexão.';
    loginMsg.style.color = '#b00020';
    console.error(error);
  }
});

// 4. SESSÃO ÚNICA (1 por vez)
function setupSessionLock(user) {
  if (!user || !db) return;

  const uid = user.uid;
  const sessionRef = ref(db, `sessions/${uid}`);
  currentSessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Verifica conexão e limpa lock antigo
  const connectedRef = ref(db, '.info/connected');
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      goOnline();
      set(sessionRef, {
        sessionId: currentSessionId,
        ts: serverTimestamp(),
        hasLock: true
      }).then(() => {
        hasLock = true;
      });

      onDisconnect(sessionRef).remove();
    } else {
      goOffline();
    }
  });

  // Monitora se outra sessão "roubou" o lock
  onValue(sessionRef, (snap) => {
    const data = snap.val();
    if (!data || data.sessionId === currentSessionId) return;

    const lockAge = Date.now() - (data.ts || 0);
    if (lockAge > STALE_LOCK_MS) {
      // Lock velho: ignora e mantém
      return;
    }

    // Outra sessão ativa: expulsa
    alert('Você entrou em outra sessão. Esta será desconectada.');
    signOut(auth);
  });
}

// 5. MOSTRA/ESCONDE UI
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBox.style.display = 'none';
    appWrap.style.display = 'block';
    setupSessionLock(user);
  } else {
    loginBox.style.display = 'block';
    appWrap.style.display = 'none';
    hasLock = false;
    currentSessionId = null;
  }
});

// Inicializa preferência "Lembrar-me"
setupRememberMe();
