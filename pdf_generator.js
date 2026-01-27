/* ============================================================================= */
/* GERADOR DE DOCUMENTOS PDF - FAST CAR v5.1 PRO (CORRIGIDO) */
/* Totalmente testado e compatível com Fast Car */
/* ============================================================================= */

// Garante que html2pdf está carregado
if (typeof html2pdf === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    document.head.appendChild(script);
}

// ============================================================================= 
// FUNÇÃO: EMITIR ORDEM DE SERVIÇO (O.S. - DOCUMENTO OFICIAL)
// =============================================================================
window.emitirOS = function() {
    console.log('🔄 Iniciando geração de O.S...');
    
    try {
        // ===== COLETA DE DADOS DO VEÍCULO =====
        const placa = (document.getElementById('placa')?.value || 'NÃO INFORMADO').toUpperCase().trim();
        const modelo = (document.getElementById('modelo')?.value || 'NÃO INFORMADO').toUpperCase().trim();
        const chassis = (document.getElementById('chassis')?.value || 'NÃO INFORMADO').toUpperCase().trim();
        const kmEntrada = document.getElementById('km_entrada')?.value || 'NÃO INFORMADO';
        const dataEntrada = document.getElementById('data')?.value || new Date().toLocaleDateString('pt-BR');
        const horaEntrada = document.getElementById('hora')?.value || 'NÃO INFORMADO';
        
        console.log('✓ Dados do veículo:', { placa, modelo, chassis, kmEntrada, dataEntrada, horaEntrada });
        
        // ===== COLETA DE DADOS DO CLIENTE =====
        const cliente = (document.getElementById('nome_cliente')?.value || 'NÃO INFORMADO').toUpperCase().trim();
        const cpf = document.getElementById('cpf_cliente')?.value || '';
        const telefone = document.getElementById('celular_cliente')?.value || '';
        const endereco = document.getElementById('endereco_cliente')?.value || '';
        
        console.log('✓ Dados do cliente:', { cliente, cpf, telefone, endereco });
        
        // ===== COLETA DE OBSERVAÇÕES =====
        const servicos = document.getElementById('servicos')?.value || '';
        const numeroOS = document.getElementById('numero_os_input')?.value || new Date().getTime().toString().slice(-6);
        
        // ===== COLETA DE DADOS DA OFICINA (CONFIG) =====
        const nomeOficina = window.OFICINA_CONFIG?.nome || 'FAST CAR CENTRO AUTOMOTIVO';
        const telefoneOficina = window.OFICINA_CONFIG?.telefone || '';
        const enderecoOficina = window.OFICINA_CONFIG?.endereco || '';
        const whatsappOficina = window.OFICINA_CONFIG?.whatsapp || '';
        const corPrimaria = window.OFICINA_CONFIG?.corPrimaria || '#e41616';
        
        console.log('✓ Dados da oficina:', { nomeOficina, telefoneOficina, enderecoOficina });
        
        // ===== COLETA DO CHECKLIST (TODOS OS CHECKBOXES) =====
        const checklist = [];
        document.querySelectorAll('input[type="checkbox"]').forEach(el => {
            if (el.value && el.value.trim()) {
                checklist.push({
                    nome: el.value.toUpperCase(),
                    marcado: el.checked
                });
            }
        });
        
        console.log('✓ Checklist coletado:', checklist.length, 'items');
        
        // ===== COLETA DE PEÇAS =====
        const pecas = [];
        let totalPecas = 0;
        
        // Tenta pegar a tabela de peças
        const tabelaPecas = document.getElementById('tabelaPecas');
        if (tabelaPecas) {
            tabelaPecas.querySelectorAll('tbody tr').forEach(tr => {
                const celulas = tr.querySelectorAll('td');
                if (celulas.length >= 2) {
                    const desc = celulas[0]?.textContent?.trim() || '';
                    const valor = celulas[1]?.textContent?.trim() || '';
                    
                    if (desc && valor && desc !== 'Descrição') {
                        pecas.push({ desc, valor });
                        
                        // Tenta converter para número
                        const valorNum = parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.'));
                        if (!isNaN(valorNum)) {
                            totalPecas += valorNum;
                        }
                    }
                }
            });
        }
        
        console.log('✓ Peças coletadas:', pecas.length, 'total:', totalPecas);
        
        // ===== COLETA DE SERVIÇOS =====
        const servicosLista = [];
        let totalServicos = 0;
        
        // Tenta pegar a tabela de serviços
        const tabelaServicos = document.getElementById('tabelaServicos');
        if (tabelaServicos) {
            tabelaServicos.querySelectorAll('tbody tr').forEach(tr => {
                const celulas = tr.querySelectorAll('td');
                if (celulas.length >= 2) {
                    const desc = celulas[0]?.textContent?.trim() || '';
                    const valor = celulas[1]?.textContent?.trim() || '';
                    
                    if (desc && valor && desc !== 'Descrição') {
                        servicosLista.push({ desc, valor });
                        
                        // Tenta converter para número
                        const valorNum = parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.'));
                        if (!isNaN(valorNum)) {
                            totalServicos += valorNum;
                        }
                    }
                }
            });
        }
        
        console.log('✓ Serviços coletados:', servicosLista.length, 'total:', totalServicos);
        
        const totalGeral = totalPecas + totalServicos;
        
        // ===== MONTA HTML PARA PDF =====
        const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>O.S. #${numeroOS}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.4; }
        .documento { padding: 25px; max-width: 900px; margin: 0 auto; }
        
        /* CABEÇALHO */
        .cabecalho {
            display: flex;
            align-items: center;
            border-bottom: 4px solid ${corPrimaria};
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .logo-area {
            width: 80px;
            height: 80px;
            background-color: #f5f5f5;
            border: 2px solid #ddd;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
            font-size: 32px;
        }
        
        .info-oficina {
            flex: 1;
        }
        
        .nome-oficina {
            font-size: 22px;
            font-weight: bold;
            color: ${corPrimaria};
            margin-bottom: 4px;
        }
        
        .subtitulo-oficina {
            font-size: 12px;
            color: #666;
            margin-bottom: 6px;
        }
        
        .contatos {
            font-size: 11px;
            color: #333;
        }
        
        .contatos-linha {
            margin: 2px 0;
        }
        
        /* TÍTULO */
        .titulo-documento {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: white;
            background-color: ${corPrimaria};
            margin: 15px 0;
            padding: 12px;
            border-radius: 5px;
        }
        
        /* SEÇÕES */
        .secao {
            margin-bottom: 18px;
        }
        
        .titulo-secao {
            font-size: 12px;
            font-weight: bold;
            background-color: #f0f0f0;
            padding: 8px;
            margin-bottom: 10px;
            border-left: 5px solid ${corPrimaria};
        }
        
        /* GRID */
        .grid-2col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .campo {
            display: flex;
            flex-direction: column;
        }
        
        .campo-label {
            font-size: 10px;
            font-weight: bold;
            color: #333;
            margin-bottom: 3px;
            text-transform: uppercase;
        }
        
        .campo-valor {
            font-size: 12px;
            padding: 6px;
            border: 1px solid #ddd;
            background-color: #fafafa;
            border-radius: 3px;
            min-height: 22px;
        }
        
        /* CHECKLIST */
        .checklist-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 12px;
        }
        
        .item-check {
            padding: 6px 8px;
            border: 1px solid #ddd;
            background-color: #fafafa;
            font-size: 11px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .item-check.ok {
            background-color: #e8f5e9;
            border-color: #4caf50;
        }
        
        .item-check.nok {
            background-color: #ffebee;
            border-color: #f44336;
        }
        
        .check-icon {
            font-weight: bold;
            font-size: 13px;
            min-width: 16px;
        }
        
        /* TABELAS */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 11px;
        }
        
        table th {
            background-color: ${corPrimaria};
            color: white;
            padding: 7px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #999;
        }
        
        table td {
            padding: 7px;
            border: 1px solid #ddd;
            background-color: #fff;
        }
        
        table tr:nth-child(even) td {
            background-color: #f9f9f9;
        }
        
        /* TOTALIZAÇÕES */
        .totalizacoes {
            background-color: #f5f5f5;
            border: 2px solid ${corPrimaria};
            padding: 12px;
            margin: 15px 0;
            font-size: 12px;
        }
        
        .total-linha {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ddd;
        }
        
        .total-linha.total-geral {
            border: none;
            margin-bottom: 0;
            padding-bottom: 0;
            font-weight: bold;
            font-size: 13px;
            color: ${corPrimaria};
        }
        
        .total-label {
            font-weight: bold;
        }
        
        .total-valor {
            text-align: right;
        }
        
        /* OBSERVAÇÕES */
        .observacoes-box {
            border: 1px solid #ddd;
            padding: 10px;
            background-color: #fafafa;
            min-height: 50px;
            font-size: 11px;
            line-height: 1.5;
            border-radius: 3px;
        }
        
        /* ASSINATURA */
        .assinatura {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 35px;
            font-size: 11px;
        }
        
        .linha-assinatura {
            text-align: center;
        }
        
        .assinatura-espaco {
            border-top: 2px solid #333;
            height: 55px;
            margin-bottom: 5px;
        }
        
        /* RODAPÉ */
        .rodape {
            text-align: center;
            font-size: 9px;
            color: #999;
            margin-top: 25px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .documento { box-shadow: none; }
        }
    </style>
</head>
<body>

<div class="documento">

    <!-- CABEÇALHO -->
    <div class="cabecalho">
        <div class="logo-area">🚗</div>
        <div class="info-oficina">
            <div class="nome-oficina">${nomeOficina}</div>
            <div class="subtitulo-oficina">Checklist de Entrada e Inspeção Veicular</div>
            <div class="contatos">
                <div class="contatos-linha">📞 ${telefoneOficina}</div>
                <div class="contatos-linha">📍 ${enderecoOficina}</div>
                ${whatsappOficina ? `<div class="contatos-linha">💬 ${whatsappOficina}</div>` : ''}
            </div>
        </div>
    </div>

    <!-- TÍTULO -->
    <div class="titulo-documento">
        ORDEM DE SERVIÇO - O.S. #${numeroOS}
    </div>

    <!-- DADOS DO VEÍCULO -->
    <div class="secao">
        <div class="titulo-secao">📋 INFORMAÇÕES DO VEÍCULO</div>
        <div class="grid-2col">
            <div class="campo">
                <div class="campo-label">Placa</div>
                <div class="campo-valor">${placa}</div>
            </div>
            <div class="campo">
                <div class="campo-label">Modelo</div>
                <div class="campo-valor">${modelo}</div>
            </div>
            <div class="campo">
                <div class="campo-label">Chassis</div>
                <div class="campo-valor">${chassis}</div>
            </div>
            <div class="campo">
                <div class="campo-label">KM Entrada</div>
                <div class="campo-valor">${kmEntrada}</div>
            </div>
            <div class="campo">
                <div class="campo-label">Data Entrada</div>
                <div class="campo-valor">${dataEntrada}</div>
            </div>
            <div class="campo">
                <div class="campo-label">Hora Entrada</div>
                <div class="campo-valor">${horaEntrada}</div>
            </div>
        </div>
    </div>

    <!-- DADOS DO CLIENTE -->
    <div class="secao">
        <div class="titulo-secao">👤 DADOS DO CLIENTE</div>
        <div class="grid-2col">
            <div class="campo">
                <div class="campo-label">Nome</div>
                <div class="campo-valor">${cliente}</div>
            </div>
            <div class="campo">
                <div class="campo-label">CPF/CNPJ</div>
                <div class="campo-valor">${cpf || '-'}</div>
            </div>
            <div class="campo">
                <div class="campo-label">Telefone/WhatsApp</div>
                <div class="campo-valor">${telefone || '-'}</div>
            </div>
            <div class="campo">
                <div class="campo-label">Endereço</div>
                <div class="campo-valor">${endereco || '-'}</div>
            </div>
        </div>
    </div>

    <!-- CHECKLIST DE INSPEÇÃO -->
    ${checklist.length > 0 ? `
    <div class="secao">
        <div class="titulo-secao">✓ CHECKLIST DE INSPEÇÃO</div>
        <div class="checklist-grid">
            ${checklist.map(item => `
                <div class="item-check ${item.marcado ? 'ok' : 'nok'}">
                    <span class="check-icon">${item.marcado ? '✓' : '✗'}</span>
                    <span>${item.nome}</span>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <!-- PEÇAS -->
    ${pecas.length > 0 ? `
    <div class="secao">
        <div class="titulo-secao">📦 PEÇAS</div>
        <table>
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th style="text-align: right; width: 30%;">Valor</th>
                </tr>
            </thead>
            <tbody>
                ${pecas.map(p => `
                    <tr>
                        <td>${p.desc}</td>
                        <td style="text-align: right;">${p.valor}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <!-- SERVIÇOS -->
    ${servicosLista.length > 0 ? `
    <div class="secao">
        <div class="titulo-secao">🔧 SERVIÇOS</div>
        <table>
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th style="text-align: right; width: 30%;">Valor</th>
                </tr>
            </thead>
            <tbody>
                ${servicosLista.map(s => `
                    <tr>
                        <td>${s.desc}</td>
                        <td style="text-align: right;">${s.valor}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <!-- TOTALIZAÇÕES -->
    ${(pecas.length > 0 || servicosLista.length > 0) ? `
    <div class="totalizacoes">
        ${pecas.length > 0 ? `
        <div class="total-linha">
            <span class="total-label">Total Peças:</span>
            <span class="total-valor">R$ ${totalPecas.toFixed(2).replace('.', ',')}</span>
        </div>
        ` : ''}
        ${servicosLista.length > 0 ? `
        <div class="total-linha">
            <span class="total-label">Total Serviços:</span>
            <span class="total-valor">R$ ${totalServicos.toFixed(2).replace('.', ',')}</span>
        </div>
        ` : ''}
        ${(pecas.length > 0 || servicosLista.length > 0) ? `
        <div class="total-linha total-geral">
            <span class="total-label">TOTAL GERAL:</span>
            <span class="total-valor">R$ ${totalGeral.toFixed(2).replace('.', ',')}</span>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <!-- OBSERVAÇÕES -->
    <div class="secao">
        <div class="titulo-secao">📝 OBSERVAÇÕES / SERVIÇOS SOLICITADOS</div>
        <div class="observacoes-box">
            ${servicos || '(Sem observações registradas)'}
        </div>
    </div>

    <!-- ASSINATURA -->
    <div class="assinatura">
        <div class="linha-assinatura">
            <div class="assinatura-espaco"></div>
            <strong>Assinatura do Cliente</strong>
        </div>
        <div class="linha-assinatura">
            <div class="assinatura-espaco"></div>
            <strong>Assinatura da Oficina</strong>
        </div>
    </div>

    <!-- RODAPÉ -->
    <div class="rodape">
        Documento gerado automaticamente pelo sistema de checklist<br>
        Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} - Válido com carimbo e assinatura
    </div>

</div>

</body>
</html>
        `;
        
        // ===== GERA PDF =====
        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        
        const nomeArquivo = `OS_${numeroOS}_${placa}_${dataEntrada.replace(/\//g, '-')}.pdf`;
        
        const opt = {
            margin: 8,
            filename: nomeArquivo,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: false, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        console.log('📄 Gerando PDF:', nomeArquivo);
        
        html2pdf().set(opt).from(element).save().then(() => {
            console.log('✅ PDF GERADO COM SUCESSO!', nomeArquivo);
            alert(`✅ O.S. #${numeroOS} gerada com sucesso!\n📥 Arquivo: ${nomeArquivo}`);
        }).catch(err => {
            console.error('❌ Erro ao gerar PDF:', err);
            alert('❌ Erro ao gerar PDF. Verifique o console (F12) para mais detalhes.');
        });
        
    } catch (erro) {
        console.error('❌ ERRO CRÍTICO:', erro);
        alert('❌ Erro crítico ao gerar PDF:\n\n' + erro.message + '\n\nVeja o console para mais detalhes (F12)');
    }
};

console.log('✅ PDF Generator v5.1 PRO (CORRIGIDO) carregado com sucesso!');
console.log('📞 Fast Car Centro Automotivo');
