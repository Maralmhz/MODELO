// orcamento.js
window.itensOrcamento = [];

function adicionarItemManual() {
    const descricaoInput = document.getElementById('descricaoItem');
    const valorInput = document.getElementById('valorItem');
    
    // Captura qual tipo foi selecionado radio button
    const tipoEl = document.querySelector('input[name="tipoItem"]:checked');
    const tipo = tipoEl ? tipoEl.value : 'peca';

    const descricao = descricaoInput.value.trim();
    let valor = parseFloat(valorInput.value);

    if (!descricao) {
        alert("Informe a descrição do item.");
        descricaoInput.focus();
        return;
    }

    if (isNaN(valor)) valor = 0;

    const item = {
        id: Date.now(),
        descricao: descricao,
        valor: valor,
        tipo: tipo 
    };

    window.itensOrcamento.push(item);
    renderizarTabela();

    descricaoInput.value = "";
    valorInput.value = "";
    descricaoInput.focus();
}

function removerItem(id) {
    window.itensOrcamento = window.itensOrcamento.filter(i => i.id !== id);
    renderizarTabela();
}

function renderizarTabela() {
    const tbodyPecas = document.getElementById('tabelaPecas');
    const tbodyServicos = document.getElementById('tabelaServicos');
    
    const elTotalPecas = document.getElementById('totalPecas');
    const elTotalServicos = document.getElementById('totalServicos');
    const elTotalGeral = document.getElementById('totalGeralFinal');

    // Limpa tabelas
    if(tbodyPecas) tbodyPecas.innerHTML = "";
    if(tbodyServicos) tbodyServicos.innerHTML = "";

    let somaPecas = 0;
    let somaServicos = 0;

    window.itensOrcamento.forEach(item => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td style="border:1px solid #ddd; padding:6px;">${item.descricao}</td>
            <td style="border:1px solid #ddd; padding:6px; text-align:right;">R$ ${item.valor.toFixed(2)}</td>
            <td style="border:1px solid #ddd; padding:6px; text-align:center;">
                <button class="btn-small btn-danger" onclick="removerItem(${item.id})" title="Apagar">🗑️</button>
            </td>
        `;

        if (item.tipo === 'servico') {
            somaServicos += item.valor;
            if(tbodyServicos) tbodyServicos.appendChild(tr);
        } else {
            somaPecas += item.valor;
            if(tbodyPecas) tbodyPecas.appendChild(tr);
        }
    });

    // Atualiza totais
    if(elTotalPecas) elTotalPecas.textContent = `R$ ${somaPecas.toFixed(2)}`;
    if(elTotalServicos) elTotalServicos.textContent = `R$ ${somaServicos.toFixed(2)}`;
    
    const somaTotal = somaPecas + somaServicos;
    if(elTotalGeral) elTotalGeral.textContent = `R$ ${somaTotal.toFixed(2)}`;
}
