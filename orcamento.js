 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/orcamento.js b/orcamento.js
new file mode 100644
index 0000000000000000000000000000000000000000..b95408da3dcec9fbc2cb0cabfe7c02f273cb419c
--- /dev/null
+++ b/orcamento.js
@@ -0,0 +1,132 @@
+(function () {
+  window.itensOrcamento = window.itensOrcamento || [];
+
+  function adicionarItemManual() {
+    const descricaoInput = document.getElementById('descricaoItem');
+    const valorInput = document.getElementById('valorItem');
+    const tipo = document.querySelector('input[name="tipoItem"]:checked')?.value || 'peca';
+
+    const descricao = descricaoInput?.value.trim() || '';
+    const valor = parseFloat(valorInput?.value || '0');
+
+    if (!descricao) {
+      alert('Informe a descrição do item.');
+      descricaoInput?.focus();
+      return;
+    }
+    if (Number.isNaN(valor) || valor < 0) {
+      alert('Informe um valor válido.');
+      valorInput?.focus();
+      return;
+    }
+
+    const item = {
+      id: Date.now(),
+      descricao,
+      valor,
+      tipo
+    };
+
+    window.itensOrcamento.push(item);
+    renderizarTabela();
+
+    if (descricaoInput) descricaoInput.value = '';
+    if (valorInput) valorInput.value = '';
+    descricaoInput?.focus();
+  }
+
+  function removerItem(id) {
+    window.itensOrcamento = window.itensOrcamento.filter(i => i.id !== id);
+    renderizarTabela();
+  }
+
+  function editarItem(id) {
+    const item = window.itensOrcamento.find(i => i.id === id);
+    if (!item) return;
+
+    const descricaoInput = document.getElementById('descricaoItem');
+    const valorInput = document.getElementById('valorItem');
+    if (descricaoInput) descricaoInput.value = item.descricao;
+    if (valorInput) valorInput.value = item.valor;
+
+    const radio = document.querySelector(`input[name="tipoItem"][value="${item.tipo}"]`);
+    if (radio) radio.checked = true;
+
+    removerItem(id);
+    alert('Item carregado para edição. Altere e clique ➕ Adicionar!');
+  }
+
+  function renderizarTabela() {
+    const tbodyPecas = document.getElementById('tabelaPecas');
+    const tbodyServicos = document.getElementById('tabelaServicos');
+    const elTotalPecas = document.getElementById('totalPecas');
+    const elTotalServicos = document.getElementById('totalServicos');
+    const elTotalGeral = document.getElementById('totalGeralFinal');
+
+    if (tbodyPecas) tbodyPecas.innerHTML = '';
+    if (tbodyServicos) tbodyServicos.innerHTML = '';
+
+    let somaPecas = 0;
+    let somaServicos = 0;
+
+    window.itensOrcamento.forEach(item => {
+      const tr = document.createElement('tr');
+      tr.innerHTML = `
+        <td style="border:1px solid #ddd; padding:6px;">${item.descricao}</td>
+        <td style="border:1px solid #ddd; padding:6px; text-align:right;">R$ ${item.valor.toFixed(2)}</td>
+        <td style="border:1px solid #ddd; padding:6px; text-align:center;">
+          <button class="btn-small btn-warning" onclick="editarItem(${item.id})" title="Editar">✏️</button>
+          <button class="btn-small btn-danger" onclick="removerItem(${item.id})" title="Apagar">🗑️</button>
+        </td>
+      `;
+
+      if (item.tipo === 'servico') {
+        somaServicos += item.valor;
+        tbodyServicos?.appendChild(tr);
+      } else {
+        somaPecas += item.valor;
+        tbodyPecas?.appendChild(tr);
+      }
+    });
+
+    if (elTotalPecas) elTotalPecas.textContent = 'R$ ' + somaPecas.toFixed(2);
+    if (elTotalServicos) elTotalServicos.textContent = 'R$ ' + somaServicos.toFixed(2);
+    if (elTotalGeral) elTotalGeral.textContent = 'R$ ' + (somaPecas + somaServicos).toFixed(2);
+  }
+
+  document.addEventListener('DOMContentLoaded', () => {
+    const descricaoItem = document.getElementById('descricaoItem');
+    const valorItem = document.getElementById('valorItem');
+
+    if (descricaoItem) {
+      descricaoItem.addEventListener('keydown', event => {
+        if (event.key === 'Enter' && !event.shiftKey) {
+          event.preventDefault();
+          valorItem?.focus();
+        }
+      });
+    }
+
+    if (valorItem) {
+      valorItem.addEventListener('keydown', event => {
+        if (event.key === 'Enter') {
+          event.preventDefault();
+          const btnAdicionar = document.getElementById('btnAdicionarItem');
+          if (btnAdicionar) {
+            btnAdicionar.click();
+          } else {
+            adicionarItemManual();
+          }
+          if (descricaoItem) {
+            setTimeout(() => descricaoItem.focus(), 100);
+          }
+        }
+      });
+    }
+  });
+
+  window.adicionarItemManual = adicionarItemManual;
+  window.removerItem = removerItem;
+  window.editarItem = editarItem;
+  window.renderizarTabela = renderizarTabela;
+})();
 
EOF
)