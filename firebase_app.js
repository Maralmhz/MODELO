// firebase_app.js (Realtime Database + Auth + 1 sessão por vez)
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  ref,
  get,
  set,
  remove,
  onValue,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// ===== UI helpers =====
function showLogin(msg = "") {
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("appWrap").style.display = "none";
  document.getElementById("loginMsg").textContent = msg;
}

function showApp() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("appWrap").style.display = "block";
  document.getElementById("loginMsg").textContent = "";
}

// ===== LOGIN button =====
document.getElementById("btnLogin")?.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (e) {
    showLogin("Email ou senha inválidos.");
    console.error(e);
  }
});

// ===== 1 sessão por usuário =====
function newSessionId() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
}

async function enforceSingleSession(uid) {
  const mySessionId = newSessionId();

  const sessionRef = ref(db, `sessions/${uid}`);
  const connectedRef = ref(db, ".info/connected");

  // Quando conectar, agenda remoção e depois grava a sessão atual
  onValue(connectedRef, async (snap) => {
    if (snap.val() !== true) return;

    // 1) primeiro agenda a remoção ao desconectar
    await onDisconnect(sessionRef).remove();

    // 2) depois grava a sessão
    await set(sessionRef, { sessionId: mySessionId, ts: Date.now() });
  });


  // Se outro dispositivo sobrescrever sessionId, desloga este (com filtro anti “sessão fantasma”)
  onValue(sessionRef, async (snap) => {
    const v = snap.val();
    if (!v) return;

    // ignora sessões antigas (evita derrubar por registro velho)
    if (v.ts && (Date.now() - v.ts) > 10000) return;

    if (v.sessionId !== mySessionId) {
      alert("Esta conta foi aberta em outro dispositivo. Você foi desconectado.");
      await signOut(auth);
      showLogin("Conta em uso em outro dispositivo.");
    }
  });
}


// ===== API esperada pelo checklist.js =====
// Salva e busca no caminho do usuário logado
function userPath(uid) {
  return `clientes/${uid}/checklists`;
}

export async function buscarChecklistsNuvem() {
  const user = auth.currentUser;
  if (!user) return [];

  const snap = await get(ref(db, userPath(user.uid)));
  if (!snap.exists()) return [];

  const obj = snap.val();
  return Object.values(obj); // {id: checklist} -> [checklist]
}

export async function salvarNoFirebase(checklist) {
  const user = auth.currentUser;
  if (!user) throw new Error("Não autenticado.");

  // salva por id (transforma em string pra ser chave)
  const id = String(checklist.id);
  await set(ref(db, `${userPath(user.uid)}/${id}`), checklist);
}

export async function excluirChecklistNuvem(id) {
  const user = auth.currentUser;
  if (!user) throw new Error("Não autenticado.");

  await remove(ref(db, `${userPath(user.uid)}/${String(id)}`));
}

// ===== Gate do app: só aparece logado =====
onAuthStateChanged(auth, (user) => {
  if (!user) {
    showLogin();
    return;
  }

  showApp();
  enforceSingleSession(user.uid);
});
