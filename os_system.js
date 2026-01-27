/* 
   Sistema de Geração de O.S. (v2 - Corrigido)
   - Auto-preenche a data de hoje para não ficar "Aguardando"
   - Ajusta o tamanho da fonte para não quebrar o layout
*/

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const elPlaca = document.getElementById('placa');
        const elData = document.getElementById('data');
        const elResumo = document.getElementById('resumoVeiculoPrincipal'); 

        // 1. AUTO-PREENCHER DATA (Se estiver vazio)
        // Isso resolve o problema de ficar "Aguardando dados" se a pessoa só digitar a placa
        if (elData && !elData.value) {
            const hoje = new Date();
            // Formata para YYYY-MM-DD (padrão do input date)
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            elData.value = `${ano}-${mes}-${dia}`;
        }

        // 2. Cria o elemento visual (Estilo corrigido para 12px igual aos outros)
        let displayOS = document.getElementById('displayOS');

        if (!displayOS && elResumo) {
            const divOS = document.createElement('div');
            divOS.className = 'veiculo-resumo-pill';

            // Estilo mais discreto e alinhado
            divOS.style.border = '2px solid #333'; // Borda escura para destaque
            divOS.style.fontWeight = 'bold';
            divOS.style.color = '#333';

            // Cria o span interno
            divOS.innerHTML = `O.S.: <strong id="displayOS" style="color: #e41616;">-</strong>`;

            // Insere como primeiro item
            elResumo.insertBefore(divOS, elResumo.firstChild);
            displayOS = document.getElementById('displayOS');
        }

        // 3. Campo oculto para formulário
        const form = document.getElementById('checklistForm');
        let hiddenInput = document.getElementById('numero_os_input');
        if (!hiddenInput && form) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'numero_os_input';
            hiddenInput.name = 'numero_os';
            form.appendChild(hiddenInput);
        }

        // 4. Função Geradora
        function gerarOS() {
            if (!elPlaca || !elData) return;

            const placaCrua = elPlaca.value || '';
            const dataCrua = elData.value || ''; 

            if (!placaCrua) {
                if(displayOS) displayOS.textContent = '...';
                return;
            }

            // Remove caracteres especiais da placa
            const placaLimpa = placaCrua.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

            // Formata data (YYYY-MM-DD -> DDMMAAAA)
            let dataFormatada = '';
            if (dataCrua) {
                const partes = dataCrua.split('-');
                if (partes.length === 3) {
                    // partes[0]=ano, partes[1]=mes, partes[2]=dia
                    dataFormatada = `${partes[2]}${partes[1]}${partes[0]}`;
                }
            }

            // Gera o código final
            const numeroOS = `${placaLimpa}${dataFormatada}`;

            // Atualiza na tela
            if (displayOS) displayOS.textContent = numeroOS;
            if (hiddenInput) hiddenInput.value = numeroOS;
        }

        // 5. Eventos (keyup para ser imediato)
        if (elPlaca) elPlaca.addEventListener('keyup', gerarOS);
        if (elData) elData.addEventListener('change', gerarOS);

        // Executa uma vez ao carregar
        gerarOS();
    });
})();
