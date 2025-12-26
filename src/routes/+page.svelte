<script>
</script>

<main class="hero-section">
    <div class="hero-content">
        <h1 class="hero-title">Bem-vindo ao QuickSeat</h1>
        <p class="hero-tagline">A sua plataforma simples para gerir lugares e eventos.</p>
        <button class="call-to-action" on:click={() => window.location.href='/autenticacao/registo'}>
            Começar Agora
        </button>
    </div>
</main>

<footer class="footer">
    <p>&copy; 2025 QuickSeat. Todos os direitos reservados.</p>
</footer>

<style>
    :root {
        --background-dark: #1a1a2e; 
        --primary-color: #0f3460;   
        --secondary-color: #ff0000; 
        --text-light: #e0e0e0;
        --text-muted: #888;
        --border-color: #3f3f5f;
    }

    .hero-section {
        width: 100%;
        min-height: 90vh;
        
        /* cor de fundo na secção principal */
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
        
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        position: relative;
        overflow: hidden; 
    }

    /* efeitos visuais como na imagem */
    .hero-section::before,
    .hero-section::after {
        content: '';
        position: absolute;
        width: 150%; /* Cobrir bem a área */
        height: 150%;
        background: rgba(255, 255, 255, 0.03); /* Ligeiras transparências */
        border-radius: 50%;
        filter: blur(50px);
        transform: translate(-50%, -50%);
        animation: glow 15s infinite alternate; /* Animação suave */
        z-index: 1;
    }

    .hero-section::after {
        background: rgba(255, 255, 255, 0.05);
        transform: translate(50%, 50%);
        animation-delay: 2s;
        animation-duration: 18s;
    }

    @keyframes glow {
        from { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 1; transform: translate(50%, 50%) scale(1.2); }
    }


    .hero-content {
        z-index: 10; /*conteúdo está acima dos efeitos visuais */
        max-width: 800px;
        padding: 20px;
    }

    .hero-title {
        font-size: 4em;
        margin-bottom: 20px;
        color: var(--text-light);
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
    }

    .hero-tagline {
        font-size: 1.5em;
        color: var(--text-muted);
        margin-bottom: 40px;
    }

    .call-to-action {
        background: none;
        border: 2px solid #ff0000;
        color: #ff0000;
        padding: 18px 50px;
        font-size: 1.4em;
        font-family: inherit;
        border-radius: 50px;
        cursor: pointer;
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        outline: none;
    }

    .call-to-action:hover {
        background-color: #ff0000;
        color: #1a1a2e;
        border-color: #ff0000;
    }

    .footer {
        text-align: center;
        padding: 20px;
        background-color: var(--primary-color);
        color: var(--text-muted);
        font-size: 0.9em;
        margin-top: auto; /* Para ficar por baixo do hero section */
    }
</style>