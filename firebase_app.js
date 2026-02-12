// firebase_app.js (Realtime Database + Auth + 1 sessão por vez)
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
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
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (e) {
    showLogin("Email ou senha inválidos.");
    console.error(e);
  }
});

// ===== Sessão única =====
const STALE_LOCK_MS = 2 * 60 * 1000; // 2 min

function newSessionId() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
}

async function tryAcquireLock(uid, mySessionId) {
  const lockRef = ref(db, `sessions/${uid}`);
  const snap = await get(lockRef);

  if (!snap.exists()) {
    await set(lockRef, { sessionId: mySessionId, ts: Date.now() });
    return { ok: true };
  }

  const v = snap.val() || {};
  if (v.sessionId === mySessionId) return { ok: true };

  // lock antigo (provável preso) -> assume sem perguntar
  const ts = Number(v.ts || 0);
  if (ts && (Date.now() - ts) > STALE_LOCK_MS) {
    await set(lockRef, { sessionId: mySessionId, ts: Date.now() });
    return { ok: true, stale: true, previous: v };
  }

  return { ok: false, current: v };
}

async function forceAcquireLock(uid, mySessionId) {
  const lockRef = ref(db, `sessions/${uid}`);
  await set(lockRef, { sessionId: mySessionId, ts: Date.now() });
}

function enforceSingleSession(uid) {
  const mySessionId = newSessionId();

  const lockRef = ref(db, `sessions/${uid}`);
  const connectedRef = ref(db, ".info/connected");

  let onDisconnectArmed = false;
  let hasLock = false;

  // Se alguém assumir depois, você é desconectado (só se você já tinha lock)
  onValue(lockRef, async (snap) => {
    const v = snap.val();
    if (!v) return;

    if (hasLock && v.sessionId !== mySessionId) {
      alert("Sua sessão foi encerrada porque a conta foi aberta em outro dispositivo.");
      hasLock = false;
      await signOut(auth);
      showLogin("Sessão encerrada.");
    }
  });

  // Quando conectar no RTDB: arma onDisconnect e tenta pegar lock
  onValue(connectedRef, async (snap) => {
    if (snap.val() !== true) return;

    // armar onDisconnect quando estiver conectado
    if (!onDisconnectArmed) {
      onDisconnectArmed = true;
      await onDisconnect(lockRef).remove(); // presença [web:90]
    }

    const res = await tryAcquireLock(uid, mySessionId);
    if (res.ok) {
      hasLock = true;
      return;
    }

    // existe outra sessão -> pergunta
    const ok = confirm(
      "Esta conta já está em uso em outro dispositivo.\n\n" +
      "Quer entrar aqui mesmo assim? (isso vai desconectar o outro dispositivo)"
    );

    if (!ok) {
      hasLock = false;
      await signOut(auth);
      showLogin("Acesso bloqueado: conta em uso em outro dispositivo.");
      return;
    }

    await forceAcquireLock(uid, mySessionId);
    hasLock = true;
  });
}

// ===== API esperada pelo checklist.js =====
function userPath(uid) {
  return `clientes/${uid}/checklists`;
}

export async function buscarChecklistsNuvem() {
  const user = auth.currentUser;
  if (!user) return [];

  const snap = await get(ref(db, userPath(user.uid)));
  if (!snap.exists()) return [];

  const obj = snap.val();
  return Object.values(obj);
}

export async function salvarNoFirebase(checklist) {
  const user = auth.currentUser;
  if (!user) throw new Error("Não autenticado.");

  const id = String(checklist.id);
  await set(ref(db, `${userPath(user.uid)}/${id}`), checklist);
}

export async function excluirChecklistNuvem(id) {
  const user = auth.currentUser;
  if (!user) throw new Error("Não autenticado.");

  await remove(ref(db, `${userPath(user.uid)}/${String(id)}`));
}

// ===== Gate do app =====
let sessionStarted = false;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    sessionStarted = false;
    showLogin();
    return;
  }

  showApp();

  if (!sessionStarted) {
    sessionStarted = true;
    enforceSingleSession(user.uid);
  }
});
