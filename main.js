(function () {
  function qs(sel) { return document.querySelector(sel); }

  function mostrarAlerta(tipo, mensagem) {
    const map = {
      success: '#successMessage',
      error: '#errorMessage',
      info: '#infoMessage'
    };
    const el = qs(map[tipo] || '#infoMessage');
    if (!el) {
      alert(mensagem);
      return;
    }
    el.textContent = mensagem;
    el.classList.add('show');
    clearTimeout(el.__alertTimer);
    el.__alertTimer = setTimeout(() => el.classList.remove('show'), 4500);
  }

  function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    document.querySelectorAll('.tab-button').forEach(btn => {
      if (btn.getAttribute('onclick')?.includes(tabId)) btn.classList.add('active');
    });

    if (tabId === 'historico') carregarHistorico();
    if (tabId === 'relatorios') atualizarRelatorios();
    if (tabId === 'orcamento' && typeof window.atualizarResumoVeiculo === 'function') {
      window.atualizarResumoVeiculo();
    }
  }

  async function salvarChecklist() {
    const placa = document.getElementById('placa')?.value?.trim();
    if (!placa) {
      alert('Por favor, preencha pelo menos a PLACA para salvar.');
      return;
    }

    const formData = {};
    const elements = document.getElementById('checklistForm')?.elements || [];

    for (const item of elements) {
      if (!item.name) continue;
      if (item.type === 'checkbox') {
        if (item.checked) {
          if (!formData[item.name]) formData[item.name] = [];
          formData[item.name].push(item.value);
        }
      } else if (item.type !== 'button') {
        formData[item.name] = item.value;
      }
    }

    const checklist = {
      id: Date.now(),
      data_criacao: new Date().toISOString(),
      ...formData,
      itensOrcamento: window.itensOrcamento || [],
      complexidade: document.getElementById('complexidade')?.value || ''
    };

    const checklists = JSON.parse(localStorage.getItem('checklists') || '[]');
    checklists.push(checklist);
    localStorage.setItem('checklists', JSON.stringify(checklists));

    if (window.itensOrcamento) {
      window.itensOrcamento = [];
      if (typeof window.renderizarTabela === 'function') {
        window.renderizarTabela();
      }
    }

    if (window.FirebaseService?.saveChecklist) {
      try {
        const result = await window.FirebaseService.saveChecklist(checklist);
        if (result?.status === 'offline') {
          mostrarAlerta('info', '✅ Checklist salvo offline. Será sincronizado quando houver internet.');
        } else {
          mostrarAlerta('success', '✅ Checklist salvo no banco de dados.');
        }
      } catch (error) {
        console.error(error);
        mostrarAlerta('error', '⚠️ Não foi possível salvar no banco.');
      }
    } else {
      mostrarAlerta('success', '✅ Checklist salvo localmente.');
    }

    document.getElementById('checklistForm')?.reset();
    if (typeof window.atualizarResumoVeiculo === 'function') {
      window.atualizarResumoVeiculo();
    }
    switchTab('historico');
  }

  function carregarHistorico() {
    const listaDiv = document.getElementById('checklistsList');
    const emptyMsg = document.getElementById('emptyMessage');
    const checklists = JSON.parse(localStorage.getItem('checklists') || '[]');

    if (!listaDiv || !emptyMsg) return;

    listaDiv.innerHTML = '';
    if (!checklists.length) {
      emptyMsg.style.display = 'block';
      return;
    }
    emptyMsg.style.display = 'none';

    checklists.slice().reverse().forEach(item => {
      const dataFormatada = new Date(item.data_criacao).toLocaleDateString('pt-BR');
      const horaFormatada = new Date(item.data_criacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const card = document.createElement('div');
      card.className = 'checklist-item';
      card.innerHTML = `
        <div class="checklist-info">
          <h4>${(item.placa || '').toUpperCase()} - ${item.modelo || 'Modelo não inf.'}</h4>
          <p>📅 ${dataFormatada} às ${horaFormatada} | 👤 ${item.nome_cliente || 'Cliente não inf.'}</p>
        </div>
        <div class="checklist-actions">
          <button class="btn-small btn-secondary" onclick="carregarChecklist(${item.id})">✏️ Editar</button>
          <button class="btn-small btn-danger" onclick="excluirChecklist(${item.id})">🗑️</button>
        </div>
      `;
      listaDiv.appendChild(card);
    });
  }

  function marcarCheckbox(name, value) {
    const els = document.getElementsByName(name);
    els.forEach(el => { if (el.value === value) el.checked = true; });
  }

  function carregarChecklist(id) {
    const checklists = JSON.parse(localStorage.getItem('checklists') || '[]');
    const item = checklists.find(c => c.id === id);
    if (!item) return;

    switchTab('novo-checklist');

    if (document.getElementById('nome_cliente')) {
      document.getElementById('nome_cliente').value = item.nome_cliente || '';
    }
    if (document.getElementById('cpf_cnpj')) {
      document.getElementById('cpf_cnpj').value = item.cpf_cnpj || '';
    }
    if (document.getElementById('celular_cliente')) {
      document.getElementById('celular_cliente').value = item.celular_cliente || '';
    }
    if (document.getElementById('placa')) {
      document.getElementById('placa').value = item.placa || '';
    }
    if (document.getElementById('modelo')) {
      document.getElementById('modelo').value = item.modelo || '';
    }

    for (const key in item) {
      const el = document.getElementsByName(key)[0];
      if (el && !['checkbox', 'file', 'radio'].includes(el.type)) {
        el.value = item[key];
      }
    }

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    if (item.equipamentos) item.equipamentos.forEach(val => marcarCheckbox('equipamentos', val));
    if (item.caracteristicas) item.caracteristicas.forEach(val => marcarCheckbox('caracteristicas', val));
    if (item.cambio) item.cambio.forEach(val => marcarCheckbox('cambio', val));
    if (item.tracao) item.tracao.forEach(val => marcarCheckbox('tracao', val));

    window.itensOrcamento = item.itensOrcamento || [];
    const complexidade = document.getElementById('complexidade');
    if (complexidade) complexidade.value = item.complexidade || '';
    if (typeof window.renderizarTabela === 'function') {
      window.renderizarTabela();
    }

    if (typeof window.atualizarResumoVeiculo === 'function') {
      window.atualizarResumoVeiculo();
    }
  }

  function excluirChecklist(id) {
    if (!confirm('Tem certeza que deseja excluir este checklist?')) return;
    let checklists = JSON.parse(localStorage.getItem('checklists') || '[]');
    checklists = checklists.filter(c => c.id !== id);
    localStorage.setItem('checklists', JSON.stringify(checklists));
    carregarHistorico();
  }

  function filtrarChecklists() {
    const termo = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    const checklists = JSON.parse(localStorage.getItem('checklists') || '[]');
    const listaDiv = document.getElementById('checklistsList');
    const emptyMsg = document.getElementById('emptyMessage');
    if (!listaDiv || !emptyMsg) return;

    listaDiv.innerHTML = '';

    const filtrados = checklists.filter(item => {
      const texto = ((item.placa || '') + ' ' + (item.modelo || '') + ' ' + (item.nome_cliente || '')).toLowerCase();
      return texto.includes(termo);
    });

    if (!filtrados.length) {
      emptyMsg.style.display = 'block';
      return;
    }
    emptyMsg.style.display = 'none';

    filtrados.slice().reverse().forEach(item => {
      const dataFormatada = new Date(item.data_criacao).toLocaleDateString('pt-BR');
      const horaFormatada = new Date(item.data_criacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const card = document.createElement('div');
      card.className = 'checklist-item';
      card.innerHTML = `
        <div class="checklist-info">
          <h4>${(item.placa || '').toUpperCase()} - ${item.modelo || 'Modelo não inf.'}</h4>
          <p>📅 ${dataFormatada} às ${horaFormatada} | 👤 ${item.nome_cliente || 'Cliente não inf.'}</p>
        </div>
        <div class="checklist-actions">
          <button class="btn-small btn-secondary" onclick="carregarChecklist(${item.id})">✏️ Editar</button>
          <button class="btn-small btn-danger" onclick="excluirChecklist(${item.id})">🗑️</button>
        </div>
      `;
      listaDiv.appendChild(card);
    });
  }

  function ordenarChecklists() {
    const checklists = JSON.parse(localStorage.getItem('checklists') || '[]');
    checklists.sort((a, b) => {
      const placaA = (a.placa || '').toUpperCase();
      const placaB = (b.placa || '').toUpperCase();
      if (placaA < placaB) return -1;
      if (placaA > placaB) return 1;
      return 0;
    });
    localStorage.setItem('checklists', JSON.stringify(checklists));
    carregarHistorico();
  }

  function limparFormulario() {
    if (!confirm('Limpar todos os campos do formulário?')) return;
    document.getElementById('checklistForm')?.reset();
    if (typeof window.atualizarResumoVeiculo === 'function') {
      window.atualizarResumoVeiculo();
    }
  }

  function exportarDados() {
    const db = JSON.parse(localStorage.getItem('checklists') || '[]');
    if (!db.length) {
      alert('Não há dados para exportar.');
      return;
    }
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'checklists.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function limparTodosDados() {
    if (!confirm('Deseja apagar TODO o histórico?')) return;
    localStorage.removeItem('checklists');
    carregarHistorico();
    alert('Histórico limpo.');
  }

  function atualizarRelatorios() {
    const db = JSON.parse(localStorage.getItem('checklists') || '[]');
    const totalEl = document.getElementById('totalChecklists');
    const mesEl = document.getElementById('checklistsMes');
    if (totalEl) totalEl.textContent = db.length;

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const doMes = db.filter(item => {
      if (!item.data_criacao) return false;
      const dataItem = new Date(item.data_criacao);
      return dataItem.getMonth() === mesAtual && dataItem.getFullYear() === anoAtual;
    });
    if (mesEl) mesEl.textContent = doMes.length;

    const marcas = {};
    db.forEach(item => {
      const modeloTexto = item.modelo || 'Não Informado';
      const m = modeloTexto.split(' ')[0].toUpperCase();
      marcas[m] = (marcas[m] || 0) + 1;
    });

    const sortedMarcas = Object.entries(marcas).sort((a, b) => b[1] - a[1]).slice(0, 5);
    let htmlGrafico = '';
    sortedMarcas.forEach(([marca, qtd]) => {
      const pct = db.length ? (qtd / db.length) * 100 : 0;
      htmlGrafico += `
        <div style="margin-bottom: 10px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:2px;">
            <strong>${marca}</strong>
            <span>${qtd}</span>
          </div>
          <div style="background:#eee; height:8px; border-radius:4px; overflow:hidden;">
            <div style="background:var(--color-primary); width:${pct}%; height:100%;"></div>
          </div>
        </div>
      `;
    });

    if (!sortedMarcas.length) {
      htmlGrafico = '<p style="text-align:center; color:#999; font-size:12px;">Sem dados suficientes.</p>';
    }

    const grafico = document.getElementById('graficoMarcas');
    if (grafico) grafico.innerHTML = htmlGrafico;
  }

  function showStep(stepNumber) {
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
    const step = document.getElementById('step' + stepNumber);
    if (step) step.classList.add('active');
    document.querySelectorAll('.step-indicator').forEach(el => {
      el.classList.remove('active');
      if (el.dataset.step == stepNumber) el.classList.add('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextStep(step) {
    if (step === 2) {
      const placa = document.getElementById('placa')?.value;
      if (!placa) {
        alert('⚠️ Por favor, digite a PLACA antes de continuar.');
        document.getElementById('placa')?.focus();
        return;
      }
   }
    showStep(step);
  }

  function prevStep(step) {
    showStep(step);
  }

  document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();

    if (window.FirebaseService?.syncPending) {
      window.FirebaseService.syncPending().catch(console.error);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('data:application/javascript;base64,CmNvbnN0IENBQ0hFX05BTUUgPSAnY2hlY2tsaXN0LXYzLWNhY2hlJzsKY29uc3QgVVJMU19UT19DQUNIRSA9IFsKICAnLycsCiAgJy9pbmRleC5odG1sJwpdOwoKc2VsZi5hZGRFdmVudExpc3RlbmVyKCdpbnN0YWxsJywgKGV2ZW50KSA9PiB7CiAgY29uc3QgY2FjaGVPcGVuID0gY2FjaGVzLm9wZW4oQ0FDSEVfTkFNRSkudGhlbigY2xpZW50KSA9PiB7CiAgICByZXR1cm4gY2xpZW50LmFkZEFsbChVUkxzX1RPX0NBQ0hFKTsKICB9KTsKICBldmVudC53YWl0VW50aWwoKGNhY2hlT3Blbik7Cn0pOwoKc2VsZi5hZGRFdmVudExpc3RlbmVyKCdmZXRjaCcsIChldmVudCkgPT4gewogIGV2ZW50LnJlc3BvbmRXaXRoKAogICAgY2FjaGVzLm1hdGNoKGV2ZW50LnJlcXVlc3QpLnRoZW4oKHJlc3BvbnNlKSA9PiB7CiAgICAgIGlmIChyZXNwb25zZSkgewogICAgICAgIHJldHVybiByZXNwb25zZTsKICAgICAgfQogICAgICByZXR1cm4gZmV0Y2goZXZlbnQucmVxdWVzdCk7CiAgICB9KQogICk7Cn0pOwo=');
    }
  });

  window.switchTab = switchTab;
  window.salvarChecklist = salvarChecklist;
  window.carregarHistorico = carregarHistorico;
  window.carregarChecklist = carregarChecklist;
  window.excluirChecklist = excluirChecklist;
  window.filtrarChecklists = filtrarChecklists;
  window.ordenarChecklists = ordenarChecklists;
  window.limparFormulario = limparFormulario;
  window.exportarDados = exportarDados;
  window.limparTodosDados = limparTodosDados;
  window.atualizarRelatorios = atualizarRelatorios;
  window.mostrarAlerta = mostrarAlerta;
  window.showStep = showStep;
  window.nextStep = nextStep;
  window.prevStep = prevStep;
})();
