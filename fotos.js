(function () {
  let streamCamera = null;
  let fotosVeiculo = JSON.parse(localStorage.getItem('fotosVeiculo') || '[]');

  function iniciarCamera() {
    const video = document.getElementById('cameraPreview');
    const btnTirar = document.getElementById('btnTirarFoto');
    const container = document.querySelector('.camera-container');

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    }).then(stream => {
      streamCamera = stream;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
      if (container) container.style.display = 'block';
      if (btnTirar) btnTirar.style.display = 'inline-block';
    }).catch(err => {
      alert('Erro câmera: ' + err.message + '\nUse "Galeria"');
    });
  }

  function tirarFoto() {
    const video = document.getElementById('cameraPreview');
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const foto = {
      id: Date.now(),
      dataURL: canvas.toDataURL('image/jpeg', 0.8),
      data: new Date().toLocaleString('pt-BR')
    };

    fotosVeiculo.unshift(foto);
    if (fotosVeiculo.length > 15) fotosVeiculo = fotosVeiculo.slice(0, 15);
    localStorage.setItem('fotosVeiculo', JSON.stringify(fotosVeiculo));
    renderizarGaleria();
    pararCamera();
  }

  function pararCamera() {
    if (streamCamera) {
      streamCamera.getTracks().forEach(track => track.stop());
      streamCamera = null;
    }
    const container = document.querySelector('.camera-container');
    if (container) container.style.display = 'none';
    const btnTirar = document.getElementById('btnTirarFoto');
    if (btnTirar) btnTirar.style.display = 'none';
  }

  function adicionarFotos(event) {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        fotosVeiculo.unshift({
          id: Date.now() + Math.random(),
          dataURL: e.target?.result,
          data: new Date().toLocaleString('pt-BR')
        });
        if (fotosVeiculo.length > 15) fotosVeiculo = fotosVeiculo.slice(0, 15);
        localStorage.setItem('fotosVeiculo', JSON.stringify(fotosVeiculo));
        renderizarGaleria();
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  function renderizarGaleria() {
    const galeria = document.getElementById('galeriaFotos');
    if (!galeria) return;
    galeria.innerHTML = '';

    if (fotosVeiculo.length === 0) {
      galeria.innerHTML = '<p style="text-align:center;color:#999;padding:40px">📭 Nenhuma foto</p>';
      return;
    }

    fotosVeiculo.slice(0, 15).forEach((foto, index) => {
      const div = document.createElement('div');
      div.className = 'foto-item';
      div.innerHTML = `
        <img src="${foto.dataURL}" alt="Foto ${index + 1}" loading="lazy">
        <div class="foto-overlay"><span style="color:white;font-size:11px">${foto.data}</span></div>
        <div class="foto-actions">
          <button class="btn-foto btn-warning foto-zoom" data-url="${foto.dataURL}">🔍</button>
          <button class="btn-foto btn-danger foto-delete" data-id="${foto.id}">🗑️</button>
        </div>
      `;
      galeria.appendChild(div);
    });

    galeria.querySelectorAll('.foto-zoom').forEach(btn => {
      btn.addEventListener('click', () => abrirFotoGrande(btn.dataset.url));
    });
    galeria.querySelectorAll('.foto-delete').forEach(btn => {
      btn.addEventListener('click', () => removerFoto(parseInt(btn.dataset.id, 10)));
    });
  }

  function removerFoto(id) {
    fotosVeiculo = fotosVeiculo.filter(f => f.id !== id);
    localStorage.setItem('fotosVeiculo', JSON.stringify(fotosVeiculo));
    renderizarGaleria();
    window.mostrarAlerta?.('success', '✅ Foto removida!');
  }

  function limparFotos() {
    if (!confirm('🗑️ Limpar TODAS as fotos?')) return;
    fotosVeiculo = [];
    localStorage.removeItem('fotosVeiculo');
    renderizarGaleria();
    window.mostrarAlerta?.('success', '✅ Fotos limpas!');
  }

  function abrirFotoGrande(dataURL) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position:fixed; top:0; left:0; width:100vw; height:100vh;
      background:rgba(0,0,0,0.95); z-index:9999; display:flex;
      align-items:center; justify-content:center; padding:20px;
    `;
    modal.innerHTML = `
      <img src="${dataURL}" style="max-width:95%; max-height:95%; border-radius:8px; box-shadow:0 0 50px rgba(255,255,255,0.3);">
      <button onclick="this.parentElement.remove()" style="
        position:absolute; top:20px; right:20px; background:#e41616;
        color:white; border:none; border-radius:50%; width:50px;
        height:50px; font-size:20px; cursor:pointer;">✕</button>
    `;
    document.body.appendChild(modal);
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
  }

  function gerarPDFFotos() {
    if (!fotosVeiculo.length) {
      alert('📭 Sem fotos para gerar PDF');
      return;
    }

    const placa = document.getElementById('placa')?.value || 'SEM_PLACA';
    const modelo = document.getElementById('modelo')?.value || 'SEM_MODELO';
    const chassi = document.getElementById('chassi')?.value || 'SEM_CHASSI';

    const MAXFOTOS = 16;
    const fotosUsar = fotosVeiculo.slice(0, MAXFOTOS);

    let html = '';

    for (let i = 0; i < fotosUsar.length; i += 4) {
      const isLastGroup = i + 4 >= fotosUsar.length;

      html += `
        <div style="
          width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          padding: 20px;
          font-family: Arial, sans-serif;
          ${isLastGroup ? '' : 'page-break-after: always;'}
        ">
          <div style="
            background: #f5f5f5;
            border: 2px solid #e41616;
            border-radius: 6px;
            padding: 10px 15px;
            margin-bottom: 15px;
            font-size: 11px;
            line-height: 1.5;
          ">
            <div style="font-weight: bold; color: #e41616; font-size: 12px; margin-bottom: 5px;">- INSPEÇÃO DE FOTOS</div>
            <div><strong>Placa:</strong> ${placa}</div>
            <div><strong>Modelo:</strong> ${modelo}</div>
            <div><strong>Chassi:</strong> ${chassi}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px;">
      `;

      for (let j = 0; j < 4 && i + j < fotosUsar.length; j++) {
        const foto = fotosUsar[i + j];
        const num = i + j + 1;
        html += `
          <div style="text-align: center; border: 1px solid #ddd; padding: 5px; border-radius: 6px;">
            <img src="${foto.dataURL}" style="width:100%; max-height:220px; object-fit:cover; border-radius:4px;">
            <div style="font-size:10px; margin-top:4px; color:#555;">Foto ${num} - ${foto.data}</div>
          </div>
        `;
      }

      html += `</div></div>`;
    }

    html2pdf().set({
      margin: 5,
      filename: `FOTOS-${placa}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(html).save();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderizarGaleria();
  });

  window.iniciarCamera = iniciarCamera;
  window.tirarFoto = tirarFoto;
  window.pararCamera = pararCamera;
  window.adicionarFotos = adicionarFotos;
  window.renderizarGaleria = renderizarGaleria;
  window.removerFoto = removerFoto;
  window.limparFotos = limparFotos;
  window.gerarPDFFotos = gerarPDFFotos;
})();
