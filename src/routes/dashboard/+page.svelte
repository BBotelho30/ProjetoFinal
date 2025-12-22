<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let siteName = "Gestão de Reservas de Lugares"; 

    // Segurança: se não houver utilizador logado no store, volta para o login
    onMount(() => {
        if (!$user) {
            goto('/login');
        }
    });

    function logout() {
        user.set(null); // Limpa o estado do utilizador
        goto('/');      // Volta para a Landing Page inicial
    }
</script>

<header class="header">
    <div class="logo">{siteName}</div>
    <nav class="nav">
        <ul>
            <li><a href="/dashboard">Início</a></li>
            <li><a href="/eventos">Eventos</a></li>
            <li><a href="/minhas-reservas">As Minhas Reservas</a></li>
            
            {#if $user}
                <li class="user-greeting">Bem-vindo, <span>{$user?.nome || 'Utilizador'}</span></li>
                <li><button class="logout-btn" on:click={logout}>Sair</button></li>
            {/if}
        </ul>
    </nav>
</header>

<main class="hero-section">
    <div class="hero-content">
        {#if $user}
            <h1 class="hero-title">Olá, {$user?.nome || 'bem-vindo'}!</h1>
            <p class="hero-tagline">Estás na tua área de gestão de reservas.</p>
        {:else}
            <p class="hero-tagline">A carregar o teu perfil...</p>
        {/if}
        
        <div class="dashboard-actions">
            <button class="call-to-action" on:click={() => goto('/eventos')}>
                Ver Eventos Disponíveis
            </button>
        </div>
    </div>
</main>

<footer class="footer">
    <p>&copy; 2025 {siteName}. Todos os direitos reservados.</p>
</footer>

<style>
    /* Importante: Mantém as variáveis e estilos base para o design ficar igual */
    :root {
        --background-dark: #1a1a2e; 
        --primary-color: #0f3460;   
        --secondary-color: #e94560; 
        --text-light: #e0e0e0;
        --text-muted: #888;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 40px;
        background-color: var(--primary-color);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .header .nav ul {
        list-style: none;
        display: flex;
        align-items: center;
        margin: 0;
        padding: 0;
    }

    .header .nav li { margin-left: 30px; }
    .header .nav a { color: var(--text-light); text-decoration: none; }

    .user-greeting { color: var(--text-light); font-size: 1.1em; }
    .user-greeting span { color: var(--secondary-color); font-weight: bold; }

    .logout-btn {
        background: none;
        border: 1px solid var(--secondary-color);
        color: var(--secondary-color);
        padding: 6px 18px;
        border-radius: 20px;
        cursor: pointer;
        transition: 0.3s;
    }

    .logout-btn:hover {
        background: var(--secondary-color);
        color: white;
    }

    .hero-section {
        min-height: 80vh;
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .hero-title { font-size: 3.5em; color: var(--text-light); margin-bottom: 10px; }
    .hero-tagline { font-size: 1.4em; color: var(--text-muted); margin-bottom: 30px; }

    .call-to-action {
        background: none;
        border: 2px solid var(--secondary-color);
        color: var(--secondary-color);
        padding: 15px 40px;
        font-size: 1.1em;
        border-radius: 50px;
        cursor: pointer;
    }

    .call-to-action:hover {
        background-color: var(--secondary-color);
        color: white;
    }

    .footer {
        text-align: center;
        padding: 20px;
        background-color: var(--primary-color);
        color: var(--text-muted);
    }
</style>