// firebase_app.js (Realtime Database + Auth + sessão única com confirmação)
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
    // lembrar login neste aparelho
    await setPersistence(auth, browserLocalPersistence); // [web:241]
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (e) {
    showLogin("Email ou senha inválidos.");
    console.error(e);
  }
});

// ===== Sessão única =====
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

  const v = snap.val();
  if (v.sessionId === mySessionId) return { ok: true };

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

  // roda quando a conexão com o RTDB estiver ativa (presença)
  onValue(connectedRef, async (snap) => {
    if (snap.val() !== true) return;

    // registra onDisconnect apenas quando estiver conectado
    if (!onDisconnectArmed) {
      onDisconnectArmed = true;
      await onDisconnect(lockRef).remove(); // [web:90]
    }

    // tenta pegar a trava
    const res = await tryAcquireLock(uid, mySessionId);
    if (res.ok) return;

    // já existe sessão -> BLOQUEIA e PERGUNTA
    const ok = confirm(
      "Esta conta já está em uso em outro dispositivo.\n\n" +
      "Quer entrar aqui mesmo assim? (isso vai desconectar o outro dispositivo)"
    );

    if (!ok) {
      await signOut(auth);
      showLogin("Acesso bloqueado: conta em uso em outro dispositivo.");
      return;
    }

    // usuário escolheu SIM -> assume a sessão
    await forceAcquireLock(uid, mySessionId);
  });

  // se alguém assumir depois, você é desconectado
  onValue(lockRef, async (snap) => {
    const v = snap.val();
    if (!v) return;

    if (v.sessionId !== mySessionId) {
      alert("Sua sessão foi encerrada porque a conta foi aberta em outro dispositivo.");
      await signOut(auth);
      showLogin("Sessão encerrada.");
    }
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
