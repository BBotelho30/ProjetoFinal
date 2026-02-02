<main class="auth-page">
  <div class="auth-card">
    <div class="icon">📧</div>

    <h1 class="hero-title">Confirma o teu email</h1>
    <p class="hero-tagline">
      Enviámos um link de confirmação para o teu email.
    </p>

    <p class="info-text">
      Para continuares, abre o email e clica no link de confirmação.
      Só depois poderás entrar e comprar bilhetes.
    </p>

    <p class="small-text">
      Não te esqueças de verificar a pasta de spam ou lixo eletrónico.
    </p>
  </div>
</main>

<style>
  .auth-page {
    min-height: calc(100vh - 80px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background: linear-gradient(
      45deg,
      var(--background-dark),
      var(--primary-color)
    );
  }

  .auth-card {
    background: rgba(10, 10, 20, 0.6);
    padding: 36px 40px;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
    max-width: 520px;
    width: 100%;
    color: var(--text-light);
    text-align: center;
    backdrop-filter: blur(6px);
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 10px;
  }

  .hero-title {
    margin: 0 0 8px;
    font-size: 2em;
  }

  .hero-tagline {
    margin: 0 0 16px;
    color: var(--text-muted);
    font-size: 1.05em;
  }

  .info-text {
    font-size: 1em;
    line-height: 1.6;
    margin-bottom: 14px;
    color: var(--text-light);
  }

  .small-text {
    font-size: 0.9em;
    color: var(--text-muted);
  }
</style>
