// resumo-veiculo.js
function atualizarResumoVeiculo() {
    const placa = document.getElementById('placa')?.value || '-';
    const modelo = document.getElementById('modelo')?.value || '-';
    const km = document.getElementById('kmentrada')?.value || '-';
    const data = document.getElementById('data')?.value || '-';
    const complexidade = document.getElementById('complexidade')?.value || '-';

    // Atualiza em todos os lugares que tiverem esses IDs
    const sets = [
        { suffix: '', kmId: 'resumoKmEntrada-strong' }, 
        { suffix: '2', kmId: 'resumoKmEntrada2-strong' }, // Aba Orçamento
        { suffix: '3', kmId: 'resumoKmFotos-strong' } // Aba Fotos
    ];

    sets.forEach(s => {
        // Placa
        const elPlaca = document.getElementById(`resumoPlaca${s.suffix}-strong`);
        if(elPlaca) elPlaca.textContent = placa;
        
        // Modelo
        const elModelo = document.getElementById(`resumoModelo${s.suffix}-strong`);
        if(elModelo) elModelo.textContent = modelo;

        // KM
        const elKm = document.getElementById(s.kmId);
        if(elKm) elKm.textContent = km;
    });

    // Data (Só tem no principal)
    const elData = document.getElementById('resumoData-strong');
    if(elData) elData.textContent = data;

    // Complexidade (Só tem no orçamento)
    const elComp = document.getElementById('resumoComplexidade-strong');
    if(elComp) elComp.textContent = complexidade;
}

// Adiciona listeners para atualizar em tempo real
document.addEventListener('DOMContentLoaded', () => {
    const campos = ['placa', 'modelo', 'kmentrada', 'data', 'complexidade'];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', atualizarResumoVeiculo);
            el.addEventListener('change', atualizarResumoVeiculo);
        }
    });
});
