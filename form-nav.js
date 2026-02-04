(function () {
+  function setupEnterSequence(ids) {
+    ids.forEach((id, idx) => {
+      const el = document.getElementById(id);
+      const nextId = ids[idx + 1];
+      if (!el || !nextId) return;
+      el.addEventListener('keydown', event => {
+        if (event.key !== 'Enter') return;
+        if (el.tagName === 'TEXTAREA' && event.shiftKey) return;
+        event.preventDefault();
+        document.getElementById(nextId)?.focus();
+      });
+    });
+  }
+
+  document.addEventListener('DOMContentLoaded', () => {
+    setupEnterSequence(['placa', 'chassi', 'modelo', 'km_entrada', 'data', 'hora', 'combustivel', 'km_saida']);
+    setupEnterSequence(['nome_cliente', 'cpf_cnpj', 'endereco_cliente', 'celular_cliente', 'telefone2', 'servicos']);
+  });
+})();
