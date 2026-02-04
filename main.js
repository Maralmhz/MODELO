// main.js - Gerencia lógica principal e integração com Firebase

document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();
    atualizarResumoVeiculo();
    
    // Enter nos campos de orçamento
    setupEnterKeyNavigation();
});

// === FUNÇÃO SALVAR PRINCIPAL (AGORA HÍBRIDA) ===
async function salvarChecklist() {
    const placa = document.getElementById('placa').value;
    if (!placa) {
        alert('Por favor, preencha pelo menos a PLACA para salvar.');
        return;
    }

    const btnSalvar = document.getElementById('btnSalvarChecklist');
    if(btnSalvar) {
        btnSalvar.textContent = "Salvando...";
        btnSalvar.disabled = true;
    }

    // Coleta dados do formulário
    const formData = {};
    const elements = document.getElementById('checklistForm').elements;
    
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        if (item.name) {
            if (item.type === 'checkbox') {
                if (item.checked) {
                    if (!formData[item.name]) formData[item.name] = [];
                    formData[item.name].push(item.value);
                }
            } else if (item.type !== 'button') {
                formData[item.name] = item.value;
            }
        }
    }

    const checklist = {
        id: Date.now(),
        datacriacao: new Date().toISOString(),
        ...formData,
        itensOrcamento: window.itensOrcamento || [], // Vem de orcamento.js
        complexidade: document.getElementById('complexidade')?.value || "",
        fotos: window.fotosVeiculo || [] // Vem de fotos.js
    };

    // CHAMA A FUNÇÃO HÍBRIDA DO FIREBASE.JS
    const salvouNuvem = await salvarChecklistHibrido(checklist);

    if(salvouNuvem) {
        alert("✅ Checklist salvo no SISTEMA (Nuvem) com sucesso!");
    } else {
        alert("⚠️ Checklist salvo LOCALMENTE (Sem internet). Será sincronizado depois.");
    }

    // Limpa e reseta
    window.itensOrcamento = [];
    window.fotosVeiculo = [];
    renderizarTabela(); // orcamento.js
    
    document.getElementById('checklistForm').reset();
    document.getElementById('galeriaFotos').innerHTML = ""; // fotos.js
    
    atualizarResumoVeiculo(); // resumo-veiculo.js
    switchTab('historico'); // form-nav.js
    carregarHistorico(); // Recarrega lista

    if(btnSalvar) {
        btnSalvar.textContent = "💾 Salvar";
        btnSalvar.disabled = false;
    }
}

// === CARREGAR HISTÓRICO (AGORA HÍBRIDO) ===
async function carregarHistorico() {
    const listaDiv = document.getElementById('checklistsList');
    const emptyMsg = document.getElementById('emptyMessage');
    
    listaDiv.innerHTML = '<p style="text-align:center; padding:20px;">Carregando dados...</p>';

    // CHAMA A FUNÇÃO HÍBRIDA
    const checklists = await carregarHistoricoHibrido();

    listaDiv.innerHTML = ""; // Limpa loading

    if (!checklists || checklists.length === 0) {
        if(emptyMsg) emptyMsg.style.display = 'block';
        return;
    } else {
        if(emptyMsg) emptyMsg.style.display = 'none';
    }

    // Renderiza lista
    checklists.forEach(item => {
        const dataObj = new Date(item.datacriacao);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });

        const card = document.createElement('div');
        card.className = 'checklist-item';
        // Estilo inline para o card (já que não tenho o CSS dessa classe específica aqui, garante visual básico)
        card.style.border = "1px solid #ddd";
        card.style.padding = "15px";
        card.style.marginBottom = "10px";
        card.style.borderRadius = "8px";
        card.style.background = "#fff";
        card.style.display = "flex";
        card.style.justifyContent = "space-between";
        card.style.alignItems = "center";

        card.innerHTML = `
            <div class="checklist-info">
                <h4 style="margin:0; color:#333;">${(item.placa || 'SEM PLACA').toUpperCase()} - ${item.modelo || 'Modelo não inf.'}</h4>
                <p style="margin:5px 0 0 0; font-size:12px; color:#666;">${dataFormatada} às ${horaFormatada} • ${item.nomecliente || 'Cliente não inf.'}</p>
            </div>
            <div class="checklist-actions" style="display:flex; gap:10px;">
                <button class="btn-small btn-secondary" onclick="carregarChecklist(${item.id})">✏️ Editar</button>
                <button class="btn-small btn-danger" onclick="excluirChecklist(${item.id})">🗑️</button>
            </div>
        `;
        listaDiv.appendChild(card);
    });
    
    // Atualiza totais na aba relatórios
    if(document.getElementById('totalChecklists')) {
        document.getElementById('totalChecklists').textContent = checklists.length;
    }
}

// === EXCLUIR ===
async function excluirChecklist(id) {
    if (confirm('Tem certeza que deseja excluir este checklist permanentemente?')) {
        await excluirChecklistHibrido(id);
        carregarHistorico(); // Recarrega a tela
    }
}

// === CARREGAR CHECKLIST PARA EDIÇÃO ===
// Esta função pega os dados (do local ou nuvem) e preenche o formulário
async function carregarChecklist(id) {
    const checklists = await carregarHistoricoHibrido();
    const item = checklists.find(c => c.id == id); // == pq id pode ser string ou number

    if (!item) return;

    switchTab('novo-checklist');

    // Preenche campos de texto simples
    for (const key in item) {
        const el = document.getElementsByName(key)[0];
        if (el && el.type !== 'checkbox' && el.type !== 'file' && el.type !== 'radio') {
            el.value = item[key];
        }
    }
    
    // IDs específicos que as vezes não batem com name
    if(document.getElementById('placa')) document.getElementById('placa').value = item.placa || '';
    if(document.getElementById('modelo')) document.getElementById('modelo').value = item.modelo || '';
    // ... adicione outros se necessário

    // Checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    if (item.equipamentos) item.equipamentos.forEach(val => marcarCheckbox('equipamentos', val));
    if (item.caracteristicas) item.caracteristicas.forEach(val => marcarCheckbox('caracteristicas', val));
    if (item.cambio) item.cambio.forEach(val => marcarCheckbox('cambio', val));
    if (item.tracao) item.tracao.forEach(val => marcarCheckbox('tracao', val));

    // Orçamento
    window.itensOrcamento = item.itensOrcamento || [];
    if(document.getElementById('complexidade')) document.getElementById('complexidade').value = item.complexidade || '';
    renderizarTabela(); // orcamento.js

    // Fotos (Se você quiser recuperar fotos, precisaria salvar no Storage do Firebase, 
    // por enquanto recupera se estiver salvo em Base64 no documento, o que não é ideal para muitas fotos)
    window.fotosVeiculo = item.fotos || [];
    // Recarregar galeria visualmente seria implementado no fotos.js se necessário

    atualizarResumoVeiculo();
}

function marcarCheckbox(name, value) {
    const els = document.getElementsByName(name);
    els.forEach(el => {
        if (el.value === value) el.checked = true;
    });
}

function setupEnterKeyNavigation() {
    // Código para navegar com Enter (mantido do original)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && input.type !== 'button' && input.type !== 'submit') {
                e.preventDefault();
                const next = inputs[index + 1];
                if (next) next.focus();
            }
        });
    });
}
