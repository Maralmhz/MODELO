// fotos.js
let streamCamera = null;
window.fotosVeiculo = [];

function iniciarCamera() {
    const video = document.getElementById('cameraPreview');
    const container = document.querySelector('.camera-container');
    const btnTirar = document.getElementById('btnTirarFoto');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Câmera não suportada neste navegador.");
        return;
    }

    container.style.display = 'block';
    
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
    })
    .then(stream => {
        streamCamera = stream;
        video.srcObject = stream;
        btnTirar.style.display = 'inline-block';
    })
    .catch(err => {
        console.error("Erro câmera:", err);
        alert("Erro ao acessar câmera. Verifique permissões.");
        container.style.display = 'none';
    });
}

function tirarFoto() {
    const video = document.getElementById('cameraPreview');
    const canvas = document.createElement('canvas');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Converte para Base64 (JPG)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    adicionarFotoNaGaleria(dataUrl);
    pararCamera();
}

function pararCamera() {
    const container = document.querySelector('.camera-container');
    const btnTirar = document.getElementById('btnTirarFoto');
    const video = document.getElementById('cameraPreview');

    if (streamCamera) {
        streamCamera.getTracks().forEach(track => track.stop());
        streamCamera = null;
    }
    
    video.srcObject = null;
    container.style.display = 'none';
    btnTirar.style.display = 'none';
}

function adicionarFotos(event) {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            adicionarFotoNaGaleria(e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

function adicionarFotoNaGaleria(base64) {
    // Limite de segurança (opcional)
    if (window.fotosVeiculo.length >= 15) {
        alert("Limite de 15 fotos atingido.");
        return;
    }

    window.fotosVeiculo.push(base64);
    renderizarGaleria();
}

function renderizarGaleria() {
    const galeria = document.getElementById('galeriaFotos');
    galeria.innerHTML = "";

    window.fotosVeiculo.forEach((foto, index) => {
        const div = document.createElement('div');
        div.className = 'foto-item';
        // Estilo inline para garantir visual sem CSS
        div.style.position = 'relative';
        div.style.display = 'inline-block';
        div.style.margin = '5px';

        div.innerHTML = `
            <img src="${foto}" style="width:100px; height:100px; object-fit:cover; border-radius:8px;">
            <button onclick="removerFoto(${index})" style="position:absolute; top:0; right:0; background:red; color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer;">&times;</button>
        `;
        galeria.appendChild(div);
    });
}

function removerFoto(index) {
    window.fotosVeiculo.splice(index, 1);
    renderizarGaleria();
}

function limparFotos() {
    if(confirm("Apagar todas as fotos?")) {
        window.fotosVeiculo = [];
        renderizarGaleria();
    }
}
