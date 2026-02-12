import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, set, onDisconnect, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
  // SUA CONFIG AQUI
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 1 USUÁRIO POR VEZ (browser fingerprint)
const userId = 'oficina-' + Math.random().toString(36).substr(2, 9) + Date.now();
const sessionRef = ref(db, `sessions/${userId}`);
const STALE_LOCK_MS = 300000; // 5min

// Tenta conectar
set(sessionRef, {
  userId: userId,
  ts: serverTimestamp(),
  active: true
}).then(() => {
  onDisconnect(sessionRef).remove();
}).catch(() => {
  document.body.innerHTML = '<h1 style="text-align:center;margin-top:100px;color:red;">👥 OFICINA OCUPADA<br><small>Tente em 1 minuto ou feche outras abas</small></h1>';
  document.body.style.background = '#fee';
});

// Monitora expulsão
onValue(sessionRef, (snap) => {
  if (!snap.exists()) {
    document.body.innerHTML = '<h1 style="text-align:center;margin-top:100px;color:red;">🔒 Sessão expirada<br><small>Recarregue a página</small></h1>';
  }
});

// Status online (visual)
const statusEl = document.getElementById('syncStatus');
if (statusEl) {
  statusEl.style.background = '#10b981';
  document.getElementById('syncText').textContent = 'Online';
}
