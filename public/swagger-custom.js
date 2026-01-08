// Script customizado para auto-preenchimento do token do Swagger
(function() {
  // Aguarda o carregamento completo da interface do Swagger
  window.addEventListener('load', function() {
    console.log('🔐 Swagger Custom Script: Iniciando configuração de token...');

    // Função para preencher o token automaticamente
    function autoFillToken() {
      try {
        // Obtém o token gerado automaticamente
        const defaultToken = window.SWAGGER_DEFAULT_TOKEN || '';
        
        // Verifica se o token já está salvo no localStorage
        const savedAuth = localStorage.getItem('swagger-ui-auth');
        
        if (savedAuth) {
          console.log('✅ Token já configurado no localStorage');
          return;
        }

        // Preenche automaticamente o token gerado
        if (defaultToken) {
          console.log('🔑 Preenchendo token JWT gerado automaticamente...');
          
          // Cria o objeto de autenticação no formato do Swagger
          const authObj = {
            'x-microservice-token': {
              name: 'x-microservice-token',
              schema: { type: 'apiKey', in: 'header', name: 'x-microservice-token' },
              value: defaultToken
            }
          };
          
          // Salva no localStorage
          localStorage.setItem('swagger-ui-auth', JSON.stringify(authObj));
          
          console.log('✅ Token JWT configurado com sucesso!');
          
          // Recarrega a página para aplicar o token
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          console.error('❌ Erro: Token não foi gerado automaticamente');
        }
      } catch (error) {
        console.error('❌ Erro ao configurar token:', error);
      }
    }

    // Executa após um pequeno delay para garantir que o Swagger UI está pronto
    setTimeout(autoFillToken, 1000);

    // Adiciona listener para o botão Authorize
    const observer = new MutationObserver(function(mutations) {
      const authorizeBtn = document.querySelector('.btn.authorize');
      if (authorizeBtn) {
        authorizeBtn.addEventListener('click', function() {
          console.log('🔓 Botão Authorize clicado - modal de autenticação aberto');
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Adiciona informações visuais sobre o token
    const style = document.createElement('style');
    style.textContent = `
      .swagger-ui .topbar .download-url-wrapper {
        display: flex;
        align-items: center;
      }
      .swagger-ui .topbar .download-url-wrapper:after {
        content: "🔐 Auth: Configurado";
        margin-left: 20px;
        padding: 5px 10px;
        background: #49cc90;
        color: white;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);

    console.log('✅ Swagger Custom Script: Configuração concluída!');
  });
})();

