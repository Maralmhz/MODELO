(function () {
  function atualizarResumoVeiculo() {
    const placa = (document.getElementById('placa')?.value || '-').toUpperCase();
    const modelo = document.getElementById('modelo')?.value || '-';
    const chassi = document.getElementById('chassi')?.value || '-';
    const kmEntrada = document.getElementById('km_entrada')?.value || '-';
    const data = document.getElementById('data')?.value || '';
    const hora = document.getElementById('hora')?.value || '';

    const dataFmt = data ? data.split('-').reverse().join('/') : '-';
    const dataHora = hora ? `${dataFmt} ${hora}` : dataFmt;

    const resumoPlaca = document.getElementById('resumoPlaca');
    const resumoModelo = document.getElementById('resumoModelo');
    const resumoKmEntrada = document.getElementById('resumoKmEntrada');
    const resumoData = document.getElementById('resumoData');

    if (resumoPlaca) resumoPlaca.textContent = placa;
    if (resumoModelo) resumoModelo.textContent = modelo || '-';
    if (resumoKmEntrada) resumoKmEntrada.textContent = kmEntrada || '-';
    if (resumoData) resumoData.textContent = dataHora || '-';

    const resumoPlaca2 = document.getElementById('resumoPlaca2');
    const resumoModelo2 = document.getElementById('resumoModelo2');
    const resumoChassi2 = document.getElementById('resumoChassi2');
    const resumoKmEntrada2 = document.getElementById('resumoKmEntrada2');
    if (resumoPlaca2) resumoPlaca2.textContent = placa;
    if (resumoModelo2) resumoModelo2.textContent = modelo || '-';
    if (resumoChassi2) resumoChassi2.textContent = chassi || '-';
    if (resumoKmEntrada2) resumoKmEntrada2.textContent = kmEntrada || '-';

    const resumoPlaca3 = document.getElementById('resumoPlaca3');
    const resumoModelo3 = document.getElementById('resumoModelo3');
    const resumoChassi3 = document.getElementById('resumoChassi3');
    const resumoKmFotos = document.getElementById('resumoKmFotos');
    if (resumoPlaca3) resumoPlaca3.textContent = placa;
    if (resumoModelo3) resumoModelo3.textContent = modelo || '-';
    if (resumoChassi3) resumoChassi3.textContent = chassi || '-';
    if (resumoKmFotos) resumoKmFotos.textContent = kmEntrada || '-';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const camposResumo = ['placa', 'modelo', 'chassi', 'km_entrada', 'data', 'hora', 'combustivel', 'complexidade'];
    camposResumo.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const tipo = (el.tagName === 'SELECT' || el.type === 'date' || el.type === 'time') ? 'change' : 'input';
      el.addEventListener(tipo, atualizarResumoVeiculo);
      el.addEventListener('blur', atualizarResumoVeiculo);
    });

    atualizarResumoVeiculo();
  });

  window.atualizarResumoVeiculo = atualizarResumoVeiculo;
})();
