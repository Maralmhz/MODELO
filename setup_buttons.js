document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: setup_buttons iniciado');

    // 1. REMOVER TODOS os botões "Gerar PDF" antigos da aba Novo Checklist
    setTimeout(() => {
        const novoChecklist = document.getElementById('novo-checklist');
        if (novoChecklist) {
            const btnsPDF = novoChecklist.querySelectorAll('button');
            btnsPDF.forEach(btn => {
                if (btn.textContent.includes('Gerar PDF') || btn.textContent.includes('PDF')) {
                    console.log('Removendo botão antigo:', btn.textContent);
                    btn.remove();
                }
            });
        }
    }, 500);

    // 2. Inserir botão "Emitir O.S. Completa" na aba Orçamento
    setTimeout(() => {
        const tabOrcamento = document.getElementById('orcamento');
        if (!tabOrcamento) return console.warn('Aba orcamento não encontrada');

        const actionButtons = tabOrcamento.querySelector('.action-buttons');
        if (!actionButtons) {
            console.warn('action-buttons não encontrado em orcamento');
            return;
        }

        // Remove se já existir
        const existing = tabOrcamento.querySelector('#btnEmitirOS');
        if (existing) existing.remove();

        // Cria novo
        const btnOS = document.createElement('button');
        btnOS.id = 'btnEmitirOS';
        btnOS.type = 'button';
        btnOS.className = 'btn-success';
        btnOS.innerHTML = '🖨️ Emitir O.S. Completa';
        btnOS.onclick = (e) => {
            e.preventDefault();
            window.emitirOS();
        };

        actionButtons.appendChild(btnOS);
        console.log('Botão "Emitir O.S." adicionado');
    }, 600);

    // 3. Inserir botão "Relatório Fotos" na aba Fotos
    setTimeout(() => {
        const tabFotos = document.getElementById('fotos');
        if (!tabFotos) return console.warn('Aba fotos não encontrada');

        const actionButtons = tabFotos.querySelector('.action-buttons');
        if (!actionButtons) {
            console.warn('action-buttons não encontrado em fotos');
            return;
        }

        // Remove botões antigos de PDF de fotos
        Array.from(actionButtons.querySelectorAll('button')).forEach(btn => {
            if (btn.textContent.includes('PDF') && !btn.id) {
                console.log('Removendo botão foto antigo:', btn.textContent);
                btn.remove();
            }
        });

        // Remove se já existir o novo
        const existing = tabFotos.querySelector('#btnRelatorioFotos');
        if (existing) existing.remove();

        // Cria novo
        const btnFotos = document.createElement('button');
        btnFotos.id = 'btnRelatorioFotos';
        btnFotos.type = 'button';
        btnFotos.className = 'btn-primary';
        btnFotos.innerHTML = '📸 Gerar Relatório de Fotos';
        btnFotos.onclick = (e) => {
            e.preventDefault();
            window.emitirRelatorioFotos();
        };

        actionButtons.insertBefore(btnFotos, actionButtons.firstChild);
        console.log('Botão "Relatório Fotos" adicionado');
    }, 700);
});
