// form-nav.js
function switchTab(tabId) {
    // Remove active de tudo
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));

    // Ativa o alvo
    const target = document.getElementById(tabId);
    if(target) target.classList.add('active');

    // Ativa botão correspondente
    const btn = document.querySelector(`.tab-button[onclick="switchTab('${tabId}')"]`);
    if (btn) btn.classList.add('active');
    
    // Ações específicas ao entrar na aba
    if (tabId === 'historico') carregarHistorico();
    if (tabId === 'orcamento') atualizarResumoVeiculo();
}

// Wizard (Passos 1, 2, 3)
function showStep(stepNumber) {
    // Esconde todos
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach(i => i.classList.remove('active'));

    // Mostra o atual
    const step = document.getElementById(`step${stepNumber}`);
    if (step) step.classList.add('active');

    // Atualiza indicador
    const indicator = document.querySelector(`.step-indicator[data-step="${stepNumber}"]`);
    if (indicator) indicator.classList.add('active');
}

function nextStep(stepNumber) {
    showStep(stepNumber);
}

function prevStep(stepNumber) {
    showStep(stepNumber);
}

function limparFormulario() {
    if (confirm("Limpar todos os campos do formulário?")) {
        document.getElementById('checklistForm').reset();
        window.itensOrcamento = [];
        window.fotosVeiculo = [];
        renderizarTabela();
        document.getElementById('galeriaFotos').innerHTML = "";
        atualizarResumoVeiculo();
        showStep(1);
    }
}
