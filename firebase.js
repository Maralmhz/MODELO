// firebase.js - Conexão e Lógica Híbrida (Online/Offline)

// 1. Configuração do Firebase (Suas chaves reais)
const firebaseConfig = {
  apiKey: "AIzaSyCpCfotfXYNpQu5o0fFbBvwOnQgU9PuYqU",
  authDomain: "checklist-oficina-72c9e.firebaseapp.com",
  projectId: "checklist-oficina-72c9e",
  storageBucket: "checklist-oficina-72c9e.firebasestorage.app",
  messagingSenderId: "305423384809",
  appId: "1:305423384809:web:b152970a419848a0147078"
};

// 2. Inicializa Firebase (Usando a versão global 'firebase' carregada no HTML)
// Verificação de segurança para não inicializar duas vezes
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 3. Obtém referência ao Banco de Dados (Firestore)
const db = firebase.firestore();

// Opcional: Habilitar persistência offline nativa do Firestore (cache inteligente)
db.enablePersistence()
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn('Persistência falhou: Múltiplas abas abertas.');
      } else if (err.code == 'unimplemented') {
          console.warn('Persistência não suportada neste navegador.');
      }
  });

// 4. Monitoramento de Conexão (UI)
const syncStatus = document.getElementById('syncStatus');
const syncText = document.getElementById('syncText');

function updateOnlineStatus() {
    if (navigator.onLine) {
        if (syncStatus) {
            syncStatus.style.background = '#10B981'; // Verde (Sucesso)
            syncStatus.classList.remove('offline');
        }
        if (syncText) syncText.textContent = 'Online (Nuvem)';
    } else {
        if (syncStatus) {
            syncStatus.style.background = '#EF4444'; // Vermelho (Erro)
            syncStatus.classList.add('offline');
        }
        if (syncText) syncText.textContent = 'Offline (Local)';
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
// Roda uma vez ao carregar
document.addEventListener('DOMContentLoaded', updateOnlineStatus);

// ======================================================
// FUNÇÕES HÍBRIDAS (Salva Local + Nuvem)
// ======================================================

// Salvar Checklist
async function salvarChecklistHibrido(checklist) {
    try {
        // A. Salva no LocalStorage (Backup imediato e garantido)
        let localData = JSON.parse(localStorage.getItem('checklists')) || [];
        // Remove versão antiga se existir
        localData = localData.filter(c => c.id !== checklist.id);
        // Adiciona nova versão no topo
        localData.unshift(checklist);
        localStorage.setItem('checklists', JSON.stringify(localData));

        // B. Tenta Salvar no Firebase (Firestore)
        if (navigator.onLine) {
            // Usa o ID numérico como ID do documento (converte para string)
            await db.collection("checklists").doc(String(checklist.id)).set(checklist);
            console.log("✅ Salvo no Firebase com sucesso!");
            return true; // Retorna true: Salvo na nuvem
        } else {
            console.warn("⚠️ Offline: Salvo apenas no dispositivo.");
            return false; // Retorna false: Salvo só local
        }
    } catch (error) {
        console.error("❌ Erro ao salvar no Firebase:", error);
        return false;
    }
}

// Carregar Histórico
async function carregarHistoricoHibrido() {
    // Se estiver online, tenta pegar do Firebase primeiro
    if (navigator.onLine) {
        try {
            const snapshot = await db.collection("checklists")
                                     .orderBy("datacriacao", "desc")
                                     .limit(50)
                                     .get();
            
            if (!snapshot.empty) {
                const firebaseData = snapshot.docs.map(doc => doc.data());
                
                // Atualiza o LocalStorage com os dados frescos da nuvem
                localStorage.setItem('checklists', JSON.stringify(firebaseData));
                console.log(`📦 ${firebaseData.length} itens carregados da Nuvem.`);
                return firebaseData;
            }
        } catch (error) {
            console.error("Erro ao ler Firebase, usando cache local:", error);
        }
    }
    
    // Fallback: Se estiver offline ou der erro, usa LocalStorage
    console.log("📂 Carregando dados locais (LocalStorage).");
    return JSON.parse(localStorage.getItem('checklists')) || [];
}

// Excluir Checklist
async function excluirChecklistHibrido(id) {
    // 1. Remove do LocalStorage imediatamente
    let localData = JSON.parse(localStorage.getItem('checklists')) || [];
    localData = localData.filter(c => c.id !== id);
    localStorage.setItem('checklists', JSON.stringify(localData));

    // 2. Remove do Firebase se tiver internet
    if (navigator.onLine) {
        try {
            await db.collection("checklists").doc(String(id)).delete();
            console.log("🗑️ Deletado do Firebase.");
        } catch (error) {
            console.error("Erro ao deletar do Firebase:", error);
            alert("Item deletado localmente, mas houve erro ao deletar da nuvem.");
        }
    } else {
        alert("Item deletado do dispositivo. Será necessário deletar da nuvem quando estiver online.");
    }
}
