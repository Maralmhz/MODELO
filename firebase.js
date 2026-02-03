import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    addDoc,
    serverTimestamp,
    enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCpCfotfXYNpQu5o0fFbBvwOnQgU9PuYqU",
    authDomain: "checklist-oficina-72c9e.firebaseapp.com",
    projectId: "checklist-oficina-72c9e",
    storageBucket: "checklist-oficina-72c9e.firebasestorage.app",
    messagingSenderId: "305423384809",
    appId: "1:305423384809:web:b152970a419848a0147078"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch(() => {
    // fallback silencioso se já houver múltiplas abas abertas
});

function getOficinaId() {
    return window.OFICINA_CONFIG?.oficinaId || "oficina_demo";
}

function getDadosEmpresa() {
    const cfg = window.OFICINA_CONFIG || {};
    return {
        nome: cfg.nome || "OFICINA",
        cnpj: cfg.cnpj || "",
        endereco: cfg.endereco || "",
        telefone: cfg.telefone || "",
        whatsapp: cfg.whatsapp || "",
        atualizadoEm: serverTimestamp()
    };
}

async function registrarEmpresa() {
    const oficinaId = getOficinaId();
    const ref = doc(db, "oficinas", oficinaId);
    await setDoc(ref, getDadosEmpresa(), { merge: true });
}

function getPendingKey() {
    return `pending_checklists_${getOficinaId()}`;
}

function readPending() {
    try {
        return JSON.parse(localStorage.getItem(getPendingKey()) || "[]");
    } catch (_) {
        return [];
    }
}

function writePending(items) {
    localStorage.setItem(getPendingKey(), JSON.stringify(items));
}

async function saveChecklist(checklist) {
    const oficinaId = getOficinaId();
    const payload = {
        ...checklist,
        criadoEm: serverTimestamp()
    };

    if (!navigator.onLine) {
        const pending = readPending();
        pending.push(payload);
        writePending(pending);
        return { status: "offline" };
    }

    await registrarEmpresa();
    const ref = collection(db, "oficinas", oficinaId, "checklists");
    await addDoc(ref, payload);
    return { status: "online" };
}

async function syncPending() {
    if (!navigator.onLine) return { synced: 0 };
    const pending = readPending();
    if (!pending.length) return { synced: 0 };

    await registrarEmpresa();
    const oficinaId = getOficinaId();
    const ref = collection(db, "oficinas", oficinaId, "checklists");

    let synced = 0;
    for (const item of pending) {
        await addDoc(ref, item);
        synced += 1;
    }
    writePending([]);
    return { synced };
}

window.FirebaseService = {
    saveChecklist,
    syncPending
};
