// firebase.js
// SUBSTITUA PELAS SUAS CHAVES DO CONSOLE FIREBASE
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJETO.firebasestorage.app",
    messagingSenderId: "SEU_MESSAGING_ID",
    appId: "SEU_APP_ID"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Verifica status da conexão
const syncStatus = document.getElementById('syncStatus');
const syncText = document.getElementById('syncText');

function updateOnlineStatus() {
    if (navigator.onLine) {
        if (syncStatus) {
            syncStatus.style.background = 'var(--color-success)'; // Verde
            syncStatus.classList.remove('offline');
        }
        if (syncText) syncText.textContent = 'Online (Firebase)';
    } else {
        if (syncStatus) {
            syncStatus.style.background = 'var(--color-error)'; // Vermelho
            syncStatus.classList.add('offline');
        }
        if (syncText) syncText.textContent = 'Offline (Local)';
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Função Híbrida: Salva no Firebase E no LocalStorage
async function salvarChecklistHibrido(checklist) {
    try {
        // 1. Salva Localmente (Backup instantâneo)
        let localData = JSON.parse(localStorage.getItem('checklists')) || [];
        
        // Remove se já existir (atualização)
        localData = localData.filter(c => c.id !== checklist.id);
        localData.push(checklist);
        localStorage.setItem('checklists', JSON.stringify(localData));

        // 2. Tenta Salvar no Firebase
        if (navigator.onLine) {
            // Usa o ID como nome do documento para evitar duplicatas
            await db.collection("checklists").doc(String(checklist.id)).set(checklist);
            console.log("Salvo no Firebase com sucesso!");
            return true; 
        } else {
            console.warn("Offline: Salvo apenas localmente. Sincronize quando voltar.");
            return false; // Retorna false para indicar que foi só local
        }
    } catch (error) {
        console.error("Erro ao salvar no Firebase:", error);
        alert("Erro ao salvar na nuvem. Cópia local garantida.");
        return false;
    }
}

// Função para Carregar Histórico (Prioriza Firebase, fallback Local)
async function carregarHistoricoHibrido() {
    if (navigator.onLine) {
        try {
            const snapshot = await db.collection("checklists").orderBy("datacriacao", "desc").limit(50).get();
            const firebaseData = snapshot.docs.map(doc => doc.data());
            
            // Atualiza o LocalStorage com os dados mais recentes da nuvem (Sincronia básica)
            localStorage.setItem('checklists', JSON.stringify(firebaseData));
            return firebaseData;
        } catch (error) {
            console.error("Erro ao ler Firebase:", error);
            return JSON.parse(localStorage.getItem('checklists')) || [];
        }
    } else {
        return JSON.parse(localStorage.getItem('checklists')) || [];
    }
}

// Função para Excluir
async function excluirChecklistHibrido(id) {
    // 1. Remove Local
    let localData = JSON.parse(localStorage.getItem('checklists')) || [];
    localData = localData.filter(c => c.id !== id);
    localStorage.setItem('checklists', JSON.stringify(localData));

    // 2. Remove Firebase
    if (navigator.onLine) {
        try {
            await db.collection("checklists").doc(String(id)).delete();
            console.log("Deletado do Firebase");
        } catch (error) {
            console.error("Erro ao deletar do Firebase:", error);
        }
    }
}
