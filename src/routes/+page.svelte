<script>
    let siteName = "QuickSeat"; 
    let tagline = "A sua plataforma simples para gerir lugares e eventos."; 
</script>

<header class="header">
    <div class="logo">{siteName}</div>
    <nav class="nav">
        <ul>
            <li><a href="/">Início</a></li>
            <li><a href="/eventos">Eventos</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/registo">Registo</a></li>
        </ul>
    </nav>
</header>

<main class="hero-section">
    <div class="hero-content">
        <h1 class="hero-title">Bem-vindo ao {siteName}</h1>
        <p class="hero-tagline">{tagline}</p>
        <button class="call-to-action" on:click={() => window.location.href='/registo'}>
            Começar Agora
        </button>
    </div>
</main>

<footer class="footer">
    <p>&copy; 2025 {siteName}. Todos os direitos reservados.</p>
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

    html{
        height: 100%;
    }

    html, body {
        margin: 0 !important; /* Força margem zero */
        padding: 0 !important; /* Força padding zero */
        width: 100%;
        min-height: 100%;
    }

    body {
            font-family: 'Bebas Neue', sans-serif;
            background-color: var(--background-dark);
            color: var(--text-light);
            line-height: 1.6;
            overflow-x: hidden;
        }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 40px;
        background-color: var(--primary-color);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        position: sticky;
        top: 0;
        z-index: 1000;
    }

    .header .logo {
        font-size: 1.8em;
        font-weight: bold;
        color: var(--text-light);
    }

    .header .nav ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
    }

    .header .nav li {
        margin-left: 30px;
    }

    .header .nav a {
        color: var(--text-light);
        text-decoration: none;
        font-size: 1.1em;
        letter-spacing: 1px;
        transition: color 0.3s ease;
    }

    .header .nav a:hover {
        color: var(--secondary-color);
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