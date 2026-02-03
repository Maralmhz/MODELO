diff --git a/app.js b/app.js
index b873be50e10ee817aa4303a07132ed288ce5c034..0651be0fbf7a44e0d7f09cf5fa9913f1695cbfc9 100644
--- a/app.js
+++ b/app.js
@@ -2,31 +2,44 @@ document.addEventListener('DOMContentLoaded', function () {
     // garante que config.js já foi carregado via <script src="config.js"> no HTML
     if (!window.OFICINA_CONFIG) {
         console.warn('OFICINA_CONFIG não encontrado. Usando textos padrão do HTML.');
         return;
     }
 
     const cfg = window.OFICINA_CONFIG;
 
     // Elementos principais
     const elTituloPagina   = document.getElementById('titulo-pagina');
     const elLogo           = document.getElementById('logo-oficina');
     const elNomeOficina    = document.getElementById('nome-oficina');
     const elSubtitulo      = document.getElementById('subtitulo-oficina');
     const elCnpj = document.getElementById('cnpj-oficina');
     const elTelefone       = document.getElementById('telefone-oficina');
     const elEndereco       = document.getElementById('endereco-oficina');
 
     if (elTituloPagina && cfg.nome)     elTituloPagina.textContent = `Checklist de Entrada – ${cfg.nome}`;
     if (elLogo && cfg.logo)             elLogo.src = cfg.logo;
     if (elNomeOficina && cfg.nome)      elNomeOficina.textContent = cfg.nome;
     if (elSubtitulo && cfg.subtitulo)   elSubtitulo.textContent = cfg.subtitulo;
     if (elCnpj && cfg.cnpj) elCnpj.textContent = `CNPJ: ${cfg.cnpj}`;
     if (elTelefone && cfg.telefone)     elTelefone.textContent = cfg.telefone;
     if (elEndereco && cfg.endereco)     elEndereco.textContent = cfg.endereco;
 
-    // Cor principal (usa sua var existente)
-    if (cfg.corPrimaria) {
-        document.documentElement.style.setProperty('--color-primary', cfg.corPrimaria);
-    }
+    // Cores (sobrescrevem o theme.css se informadas)
+    const colorMap = {
+        corPrimaria: '--color-primary',
+        corSucesso: '--color-success',
+        corErro: '--color-error',
+        corAviso: '--color-warning',
+        corFundo: '--color-light',
+        corTexto: '--color-text',
+        corBorda: '--color-border',
+        corEscura: '--color-dark'
+    };
+
+    Object.entries(colorMap).forEach(([key, cssVar]) => {
+        if (cfg[key]) {
+            document.documentElement.style.setProperty(cssVar, cfg[key]);
+        }
+    });
 
 });
