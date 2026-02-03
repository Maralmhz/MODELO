 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/form-nav.js b/form-nav.js
new file mode 100644
index 0000000000000000000000000000000000000000..3c4e9a5b824a6658559c55e4025a93ad79b18390
--- /dev/null
+++ b/form-nav.js
@@ -0,0 +1,20 @@
+(function () {
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
 
EOF
)