(function () {
  function gerarNumeroOS() {
    const placa = (document.getElementById('placa')?.value || 'OS')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();

    const dataRaw = document.getElementById('data')?.value;
    const dataObj = dataRaw ? new Date(dataRaw + 'T00:00:00') : new Date();
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = String(dataObj.getFullYear());

    return `${placa}${dia}${mes}${ano}`;
  }

  function atualizarBarraOS() {
    const os = gerarNumeroOS();
    const el = document.getElementById('barraFixaOS');
    if (el) el.textContent = os;
  }

  function atualizarResumoOS() {
    const logoSrc = document.getElementById('logo-oficina')?.src;
    if (logoSrc) document.getElementById('logoResumo').src = logoSrc;

    document.getElementById('nomeOficinaResumo').textContent = document.getElementById('nome-oficina')?.textContent || 'OFICINA';
    document.getElementById('enderecoOficinaResumo').textContent = document.getElementById('endereco-oficina')?.textContent || '';
    document.getElementById('telefoneOficinaResumo').textContent = document.getElementById('telefone-oficina')?.textContent || '';
    document.getElementById('cnpjOficinaResumo').textContent = document.getElementById('cnpj-oficina')?.textContent || 'CNPJ da oficina';

    document.getElementById('osNumero').textContent = gerarNumeroOS();

    const logoResumo2 = document.getElementById('logoResumo2');
    const nomeOficinaResumo2 = document.getElementById('nomeOficinaResumo2');
    const enderecoOficinaResumo2 = document.getElementById('enderecoOficinaResumo2');
    const telefoneOficinaResumo2 = document.getElementById('telefoneOficinaResumo2');
    const cnpjOficinaResumo2 = document.getElementById('cnpjOficinaResumo2');
    const osNumero2 = document.getElementById('osNumero2');

    if (logoResumo2 && document.getElementById('logoResumo')) {
      logoResumo2.src = document.getElementById('logoResumo').src;
    }
    if (nomeOficinaResumo2 && document.getElementById('nomeOficinaResumo')) {
      nomeOficinaResumo2.textContent = document.getElementById('nomeOficinaResumo').textContent;
    }
    if (enderecoOficinaResumo2 && document.getElementById('enderecoOficinaResumo')) {
      enderecoOficinaResumo2.textContent = document.getElementById('enderecoOficinaResumo').textContent;
    }
    if (telefoneOficinaResumo2 && document.getElementById('telefoneOficinaResumo')) {
      telefoneOficinaResumo2.textContent = document.getElementById('telefoneOficinaResumo').textContent;
    }
    if (cnpjOficinaResumo2 && document.getElementById('cnpjOficinaResumo')) {
      cnpjOficinaResumo2.textContent = document.getElementById('cnpjOficinaResumo').textContent;
    }
    if (osNumero2 && document.getElementById('osNumero')) {
      osNumero2.textContent = document.getElementById('osNumero').textContent;
    }

    document.getElementById('rNomeCliente').textContent = document.getElementById('nome_cliente')?.value || '-';
    document.getElementById('rCpfCnpj').textContent = document.getElementById('cpf_cnpj')?.value || '-';
    document.getElementById('rCelular').textContent = document.getElementById('celular_cliente')?.value || '-';

    document.getElementById('rModelo').textContent = document.getElementById('modelo')?.value || '-';
    document.getElementById('rPlaca').textContent = (document.getElementById('placa')?.value || '-').toUpperCase();
    document.getElementById('rChassi').textContent = document.getElementById('chassi')?.value || '-';
    const kmEntrada = document.getElementById('km_entrada')?.value || '';
    document.getElementById('rKmEntrada').textContent = kmEntrada ? `${kmEntrada} km` : '-';

    const combSelect = document.getElementById('combustivel');
    const combTexto = combSelect && combSelect.selectedIndex >= 0 ? combSelect.options[combSelect.selectedIndex].text : '-';
    document.getElementById('rCombustivel').textContent = combTexto;

    const dataVal = document.getElementById('data')?.value;
    const horaVal = document.getElementById('hora')?.value;
    const dataFmt = dataVal ? dataVal.split('-').reverse().join('/') : '--/--/----';
    document.getElementById('rEntradaDataHora').textContent = `${dataFmt} às ${horaVal || '--:--'}`;

    document.getElementById('rServicos').textContent = document.getElementById('servicos')?.value || '-';

    const obs = document.getElementById('obsInspecao')?.value || '-';
    const rObs = document.getElementById('rObsInspecao');
    if (rObs) rObs.textContent = obs;

    const areaBadges = document.getElementById('rChecklistBadges');
    areaBadges.innerHTML = '';

    const checkboxesMarcados = document.querySelectorAll('#checklistForm input[type="checkbox"]:checked');
    if (checkboxesMarcados.length === 0) {
      areaBadges.innerHTML = '<span style="color:#999; font-size:11px;">Nenhum item inspecionado/marcado.</span>';
    } else {
      checkboxesMarcados.forEach(cb => {
        let textoLabel = cb.value;
        const labelTag = document.querySelector(`label[for="${cb.id}"]`);
        if (labelTag) {
          textoLabel = labelTag.textContent;
        } else if (cb.nextElementSibling && cb.nextElementSibling.tagName === 'LABEL') {
          textoLabel = cb.nextElementSibling.textContent;
        }
        textoLabel = textoLabel.trim();

        const span = document.createElement('span');
        const palavrasRuim = ['TRINCADO', 'AMASSADO', 'RISCADO', 'QUEBRADO', 'DANIFICADO', 'FALTANDO', 'RUIM'];
        const ehRuim = palavrasRuim.some(p => textoLabel.toUpperCase().includes(p));
        span.className = ehRuim ? 'os-badge no' : 'os-badge ok';
        span.innerHTML = ehRuim ? `⚠️ ${textoLabel}` : `✅ ${textoLabel}`;
        areaBadges.appendChild(span);
      });
    }

    const origemPecas = document.getElementById('tabelaPecas');
    const destinoPecas = document.getElementById('rTabelaPecas');
    destinoPecas.innerHTML = '';

    if (origemPecas && origemPecas.rows.length > 0) {
      Array.from(origemPecas.rows).forEach(row => {
        const desc = row.cells[0].textContent;
        const valor = row.cells[1].textContent;
        destinoPecas.innerHTML += `<tr><td>${desc}</td><td style="text-align:right;">${valor}</td></tr>`;
      });
    } else {
      destinoPecas.innerHTML = '<tr><td colspan="2" style="color:#999; text-align:center;">-</td></tr>';
    }

    const origemServicos = document.getElementById('tabelaServicos');
    const destinoServicos = document.getElementById('rTabelaServicos');
    destinoServicos.innerHTML = '';

    if (origemServicos && origemServicos.rows.length > 0) {
      Array.from(origemServicos.rows).forEach(row => {
        const desc = row.cells[0].textContent;
        const valor = row.cells[1].textContent;
        destinoServicos.innerHTML += `<tr><td>${desc}</td><td style="text-align:right;">${valor}</td></tr>`;
      });
    } else {
      destinoServicos.innerHTML = '<tr><td colspan="2" style="color:#999; text-align:center;">-</td></tr>';
    }

    const totalGeral = document.getElementById('totalGeralFinal');
    document.getElementById('rTotalGeral').textContent = totalGeral ? totalGeral.textContent : 'R$ 0,00';

    const totalPecas = document.getElementById('totalPecas');
    const totalServicos = document.getElementById('totalServicos');
    const rTotalPecas = document.getElementById('rTotalPecas');
    const rTotalServicos = document.getElementById('rTotalServicos');
    if (rTotalPecas) rTotalPecas.textContent = totalPecas ? totalPecas.textContent : 'R$ 0,00';
    if (rTotalServicos) rTotalServicos.textContent = totalServicos ? totalServicos.textContent : 'R$ 0,00';

    const textoRodape = `Checklist gerado por ${document.getElementById('nome-oficina')?.textContent || 'Oficina'} CNPJ ${document.getElementById('cnpj-oficina')?.textContent || ''} - ${new Date().toLocaleString('pt-BR')}`;
    const rod1 = document.getElementById('rodape-texto-1');
    const rod2 = document.getElementById('rodape-texto-2');
    if (rod1) rod1.textContent = textoRodape;
    if (rod2) rod2.textContent = textoRodape;
  }

  function imprimirResumo() {
    atualizarResumoOS();
    window.print();
  }

  function gerarPDFResumo() {
    atualizarResumoOS();
    const elemento = document.getElementById('resumoContainer');

    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'OS-' + document.getElementById('placa')?.value?.toUpperCase() + '_CHECKLIST.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        backgroundColor: '#ffffff',
        letterRendering: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: 'css', legacy: true },
      pdfCallback: function (pdfObject) {
        const totalPages = pdfObject.internal.getNumberOfPages();
        const headerText = document.getElementById('nomeOficinaResumo')?.textContent || 'OFICINA';
        const osNumero = document.getElementById('osNumero')?.textContent || '';
        const footerText = document.getElementById('rodape-texto')?.textContent || 'Checklist gerado em ' + new Date().toLocaleString('pt-BR');

        for (let i = 1; i <= totalPages; i++) {
          pdfObject.setPage(i);
          pdfObject.setFontSize(14);
          pdfObject.setFont('helvetica', 'bold');
          pdfObject.setTextColor(50, 50, 50);
          pdfObject.text(headerText.toUpperCase(), 15, 12);
          pdfObject.text('ORDEM DE SERVIÇO: ' + osNumero, 150, 12);

          pdfObject.setDrawColor(200, 200, 200);
          pdfObject.setLineWidth(0.5);
          pdfObject.line(10, 15, 200, 15);

          pdfObject.setFontSize(9);
          pdfObject.setFont('helvetica', 'normal');
          pdfObject.setTextColor(100, 100, 100);
          pdfObject.text(footerText, 15, 287);
          pdfObject.text('Página ' + i + ' de ' + totalPages, 170, 287);
        }
      }
    };

    html2pdf().set(opt).from(elemento).save();
  }

  document.addEventListener('input', e => {
    if (e.target.id === 'placa' || e.target.id === 'data') {
      atualizarBarraOS();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    atualizarBarraOS();
  });

  window.gerarNumeroOS = gerarNumeroOS;
  window.atualizarResumoOS = atualizarResumoOS;
  window.imprimirResumo = imprimirResumo;
  window.gerarPDFResumo = gerarPDFResumo;
})();
