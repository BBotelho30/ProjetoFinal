<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let siteName = "Gestão de Reservas de Lugares";

    // Se não for admin, volta para o login
    onMount(() => {
        if (!$user || $user.tipo !== 'admin') {
            goto('/login');
        }
    });

    function logout() {
        user.set(null);
        goto('/');
    }
</script>

<header class="header">
    <div class="logo">{siteName}</div>
    <nav class="nav">
        <ul>
            <li><a href="/admin">Início</a></li>
            <li><a href="/admin/eventos">Eventos</a></li>
            <li class="user-greeting">Bem-vindo, <span>{$user?.nome || ''}</span></li>
            <li><button class="logout-btn" on:click={logout}>Sair</button></li>
        </ul>
    </nav>
</header>

<main class="admin-dashboard">
    <div class="welcome-text">
        <h1>Olá, Admin!</h1>
        <p>O que deseja fazer hoje?</p>
    </div>

    <div class="cards-container">
        <button class="admin-card" on:click={() => alert('Abrir Gestão de Salas')}>
            <div class="icon">🏢</div>
            <h2>Adicionar Sala de Espetáculo</h2>
            <div class="plus-sign">+</div>
        </button>

        <button class="admin-card" on:click={() => goto('/admin/adiciona_espetaculo')}>
            <div class="icon">🎭</div>
            <h2>Adicionar Espetáculo</h2>
            <div class="plus-sign">+</div>
        </button>
        
        <div class="admin-card disabled">
            <div class="icon">📊</div>
            <h2>Ver Estatísticas</h2>
            <span class="status-tag">Em Breve</span>
        </div>
    </div>
</main>

<style>
    :root {
        --background-dark: #1a1a2e; 
        --primary-color: #0f3460;   
        --secondary-color: #e94560; 
        --text-light: #e0e0e0;
        --text-muted: #888;
    }

    /* BARRA SUPERIOR  */
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
        font-size: 1.8em; /* Tamanho igual ao seu original */
        font-weight: bold;
        color: var(--text-light);
    }

    .header .nav ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
    }

    .header .nav li {
        margin-left: 30px;
    }

    .header .nav a {
        color: var(--text-light);
        text-decoration: none;
        font-size: 1.1em;
        transition: color 0.3s ease;
    }

    .header .nav a:hover {
        color: var(--secondary-color);
    }

    /*  do Admin */
    .user-greeting {
        color: var(--text-light);
        font-size: 1.1em;
    }

    .user-greeting span {
        color: var(--secondary-color);
        font-weight: bold;
    }

    /* Botão Sair com estilo de borda arredondada */
    .logout-btn {
        background: none;
        border: 2px solid var(--secondary-color); 
        color: var(--secondary-color);
        padding: 8px 20px;
        font-size: 1em;
        border-radius: 50px;
        cursor: pointer;
        transition: background-color 0.3s ease, color 0.3s ease;
        outline: none;
    }

    .logout-btn:hover {
        background-color: var(--secondary-color);
        color: var(--background-dark);
    }

    /* PAINEL DE CARTÕES  */
    .admin-dashboard {
        padding: 60px 20px;
        min-height: 100vh;
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
        color: white;
        text-align: center;
    }

    .welcome-text h1 { 
        font-size: 3em; 
        margin-bottom: 10px; 
        color: var(--text-light); 
    }

    .welcome-text p { 
        color: var(--text-muted); 
        margin-bottom: 50px; 
        font-size: 1.2em; }

    .cards-container {
        display: flex;
        justify-content: center;
        gap: 30px;
        flex-wrap: wrap;
        z-index: 10;
        position: relative;
    }

    /* Cartões brancos  */
    .admin-card {
        background: white;
        border: none;
        border-radius: 20px;
        width: 280px;
        height: 350px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 40px 20px;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .admin-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 30px rgba(233, 69, 96, 0.4);
    }

    .admin-card h2 { 
        color: var(--background-dark); 
        font-size: 1.3em;
         margin: 0; 
         font-weight: bold; 
        }

    .icon { 
        font-size: 4em; 
    }

    .plus-sign { 
        font-size: 4em; 
        color: #ddd; 
        line-height: 1; 
        font-weight: 200; }

    /* Cartão Desativado */
    .admin-card.disabled {
        background: rgba(255, 255, 255, 0.1);
        border: 1px dashed #555;
        cursor: not-allowed;
        box-shadow: none;
    }

    .admin-card.disabled h2, .admin-card.disabled .icon {
        opacity: 0.3; 
        color: white; 
    }

    .status-tag { 
        background: #333; 
        color: #888; 
        padding: 5px 15px; 
        border-radius: 5px; 
    }
</style>