 if (elTelefone && cfg.telefone)     elTelefone.textContent = cfg.telefone;
    if (elEndereco && cfg.endereco)     elEndereco.textContent = cfg.endereco;
 // Cores (sobrescrevem o theme.css se informadas)
    const colorMap = {
        corPrimaria: '--color-primary',
        corSucesso: '--color-success',
        corErro: '--color-error',
        corAviso: '--color-warning',
        corFundo: '--color-light',
        corTexto: '--color-text',
        corBorda: '--color-border',
        corEscura: '--color-dark'
    };

    Object.entries(colorMap).forEach(([key, cssVar]) => {
        if (cfg[key]) {
            document.documentElement.style.setProperty(cssVar, cfg[key]);
        }
    });

});
