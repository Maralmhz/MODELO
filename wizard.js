/* Wizard (Etapas) - v3 (Botão final leva para aba Peças & Serviços) */

(function () {
  function q(sel, root=document){ return root.querySelector(sel); }
  function qa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function setAlert(msg, type='error') {
    const map = {
      success: '#successMessage',
      error: '#errorMessage',
      info: '#infoMessage'
    };
    const el = q(map[type]) || q('#errorMessage');
    if (!el) return;

    el.textContent = msg;
    el.classList.add('show');

    clearTimeout(el.__wizTimer);
    el.__wizTimer = setTimeout(() => el.classList.remove('show'), 4500);
  }

  function applyRequiredHints(form) {
    // Apenas Placa obrigatória
    const requiredIds = ['placa']; 
    requiredIds.forEach(id => {
      const el = q('#' + id, form);
      if (el) el.setAttribute('required', 'required');
    });
  }

  function validateStep(stepEl) {
    const fields = qa('input, select, textarea', stepEl)
      .filter(el => !el.disabled && el.type !== 'button' && el.type !== 'submit');

    for (const el of fields) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      if (el.hasAttribute('required')) {
        const empty = (el.type === 'checkbox') ? false : (String(el.value || '').trim() === '');
        if (empty) {
          el.focus({ preventScroll: false });
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const label = el.id ? q(`label[for="${el.id}"]`) : null;
          let nome = label ? label.textContent.replace('*','').trim() : (el.name || el.id || 'Campo obrigatório');
          setAlert(`Preencha: ${nome}.`, 'error');
          return false;
        }
      }

      if (typeof el.checkValidity === 'function' && !el.checkValidity()) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setAlert('Verifique os campos destacados.', 'error');
        return false;
      }
    }
    return true;
  }

  function buildWizard(form) {
    const children = Array.from(form.children);
    const sectionTitles = children.filter(el => el.classList && el.classList.contains('section-title'));

    if (sectionTitles.length < 2) return;

    const wizard = document.createElement('div');
    wizard.className = 'wizard';

    const header = document.createElement('div');
    header.className = 'wizard-header';
    header.innerHTML = `
      <div class="wizard-progress">
        <div class="wizard-progress-bar" id="wizardProgressBar"></div>
      </div>
      <div class="wizard-steps" id="wizardSteps"></div>
    `.trim();

    const body = document.createElement('div');
    body.className = 'wizard-body';

    const footer = document.createElement('div');
    footer.className = 'wizard-footer';
    footer.innerHTML = `
      <button type="button" class="btn-secondary" id="wizardPrev">⬅️ Voltar</button>
      <div class="wizard-footer-right">
        <button type="button" class="btn-primary" id="wizardNext">Próximo ➡️</button>
      </div>
    `.trim();

    wizard.appendChild(header);
    wizard.appendChild(body);
    wizard.appendChild(footer);

    while (form.firstChild) wizard.appendChild(form.firstChild);
    form.appendChild(wizard);

    const allNodes = Array.from(wizard.children).filter(n => n !== header && n !== body && n !== footer);
    const steps = [];
    let currentStep = null;

    function openStep(titleText) {
      const step = document.createElement('div');
      step.className = 'wizard-step';
      step.setAttribute('data-title', titleText);
      body.appendChild(step);
      steps.push(step);
      return step;
    }

    for (const node of allNodes) {
      const isTitle = node.classList && node.classList.contains('section-title');
      if (isTitle) {
        currentStep = openStep(node.textContent.trim());
      }
      if (!currentStep) currentStep = openStep('INÍCIO');
      currentStep.appendChild(node);
    }

    const actionBlocks = qa('.action-buttons', body);
    if (actionBlocks.length) {
      const lastStep = steps[steps.length - 1];
      actionBlocks.forEach(ab => lastStep.appendChild(ab));
    }

    const stepsBox = q('#wizardSteps', header);
    steps.forEach((step, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'wizard-step-pill';
      b.textContent = `${idx + 1}. ${step.getAttribute('data-title')}`;
      b.addEventListener('click', () => {
        if (idx <= state.index) {
          goTo(idx, { validate: false });
          return;
        }
        for (let i = state.index; i < idx; i++) {
          if (!validateStep(steps[i])) return;
        }
        goTo(idx, { validate: false });
      });
      stepsBox.appendChild(b);
    });

    const progressBar = q('#wizardProgressBar', header);
    const btnPrev = q('#wizardPrev', footer);
    const btnNext = q('#wizardNext', footer);
    const storageKey = 'wizard_step_checklist_v1';
    const state = {
      index: 0,
      get total() { return steps.length; }
    };

    function updateUI() {
      steps.forEach((s, i) => s.classList.toggle('active', i === state.index));
      const pills = qa('.wizard-step-pill', stepsBox);
      pills.forEach((p, i) => {
        p.classList.toggle('active', i === state.index);
        p.classList.toggle('done', i < state.index);
      });
      const pct = Math.round(((state.index + 1) / state.total) * 100);
      progressBar.style.width = pct + '%';

      btnPrev.disabled = state.index === 0;

      // MUDANÇA AQUI: Texto do botão na última etapa
      if (state.index === state.total - 1) {
          btnNext.textContent = 'Ir para Peças & Serviços 💰';
          // Opcional: mudar cor para destacar
          // btnNext.style.backgroundColor = '#28a745'; 
      } else {
          btnNext.textContent = 'Próximo ➡️';
          btnNext.style.backgroundColor = ''; // reseta cor
      }

      wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try { sessionStorage.setItem(storageKey, String(state.index)); } catch(_) {}
    }

    function goTo(idx, { validate=true } = {}) {
      if (idx < 0 || idx >= state.total) return;
      if (validate && idx > state.index) {
        if (!validateStep(steps[state.index])) return;
      }
      state.index = idx;
      updateUI();
    }

    btnPrev.addEventListener('click', () => goTo(state.index - 1, { validate: false }));

    // MUDANÇA AQUI: Comportamento do botão Próximo/Final
    btnNext.addEventListener('click', () => {
      if (!validateStep(steps[state.index])) return;

      if (state.index < state.total - 1) {
        // Ainda tem etapas: vai pra próxima
        goTo(state.index + 1, { validate: false });
      } else {
        // Última etapa: chama a troca de aba
        if (typeof window.switchTab === 'function') {
            window.switchTab('orcamento');

            // Opcional: Scrollar pro topo da nova aba
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        } else {
            console.warn('Função switchTab não encontrada no escopo global.');
            setAlert('Aba de orçamento não acessível no momento.', 'error');
        }
      }
    });

    let saved = 0;
    try { saved = parseInt(sessionStorage.getItem(storageKey) || '0', 10) || 0; } catch(_) {}
    state.index = Math.max(0, Math.min(saved, state.total - 1));
    updateUI();

    body.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter') return;
      const t = ev.target;
      if (!t || !(t instanceof HTMLElement)) return;
      if (t.tagName === 'TEXTAREA') return;
      ev.preventDefault();
      btnNext.click();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checklistForm');
    if (!form) return;
    applyRequiredHints(form);
    buildWizard(form);
  });
})();
