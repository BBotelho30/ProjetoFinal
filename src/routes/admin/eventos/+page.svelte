<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    export let data; // Aqui recebemos os eventos do servidor
    let { eventos } = data;

    let siteName = "Gestão de Reservas de Lugares";

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
        <h1>Lista de Espetáculos</h1>
        <p>Todos os eventos registados no sistema aparecem aqui automaticamente.</p>
    </div>

    <div class="cards-grid">
        {#each eventos as evento}
            <div class="event-card">
                <div class="card-image" style="background-image: url('{evento.imagem_cartaz || '/placeholder.jpg'}')">
                    <span class="type-tag">{evento.tipo_espectaculo || 'Evento'}</span>
                </div>
                <div class="card-info">
                    <h3>{evento.nome_evento}</h3>
                    <p>{evento.descricao || 'Sem descrição.'}</p>
                    <div class="card-actions">
                        <button class="action-btn edit">Editar</button>
                        <button class="action-btn delete">Eliminar</button>
                    </div>
                </div>
            </div>
        {:else}
            <div class="empty-state">
                <p>Ainda não foram adicionados espetáculos.</p>
            </div>
        {/each}
    </div>
</main>

<style>
    :root {
        --primary-color: #0f3460;
        --secondary-color: #e94560;
        --background-dark: #1a1a2e;
        --text-light: #e0e0e0;
        --text-muted: #888;
        --card-bg: #16213e;
    }

    /* Estilo do Header (mantido conforme o teu original) */
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
        font-family: sans-serif;
    }

    .logo { 
        font-size: 1.8em; 
        font-weight: bold; 
        color: var(--text-light); 
    }

    .nav ul { 
        list-style: none; 
        margin: 0; 
        padding: 0; 
        display: flex; 
        align-items: center; 
    }

    .nav li {
        margin-left: 30px; 
    }

    .nav a { 
        color: var(--text-light); 
        text-decoration: none; 
        font-size: 1.1em; 
    }

    .user-greeting { 
        color: var(--text-light); 
        font-size: 1.1em; 
    }

    .user-greeting span { 
        color: var(--secondary-color); 
        font-weight: bold; 
    }

    .logout-btn {
        background: none;
        border: 2px solid var(--secondary-color);
        color: var(--secondary-color);
        padding: 8px 20px;
        border-radius: 50px;
        cursor: pointer;
        font-family: sans-serif;
    }

    /* Estilo dos Grid e Cards */
    .admin-dashboard {
        padding: 40px 60px;
        min-height: 100vh;
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
        font-family: sans-serif;
    }

    .welcome-text { text-align: center; margin-bottom: 50px; color: white; }

    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 30px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .event-card {
        background: var(--card-bg);
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
    }

    .card-image {
        height: 250px;
        background-size: cover;
        background-position: center;
        position: relative;
    }

    .type-tag {
        position: absolute; top: 15px; right: 15px;
        background: var(--secondary-color); color: white;
        padding: 5px 12px; border-radius: 50px; font-size: 0.8em; font-weight: bold;
    }

    .card-info { padding: 20px; color: white; flex-grow: 1; display: flex; flex-direction: column; }
    .card-info h3 { margin: 0 0 10px 0; font-size: 1.4em; }
    .card-info p { color: var(--text-muted); font-size: 0.9em; margin-bottom: 20px; flex-grow: 1; }

    .card-actions { display: flex; gap: 10px; }
    .action-btn { flex: 1; padding: 10px; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; }
    .action-btn.edit { background: #4e4e4e; color: white; }
    .action-btn.delete { background: transparent; border: 1px solid #ff4d4d; color: #ff4d4d; }

    .empty-state { color: white; text-align: center; grid-column: 1 / -1; padding: 50px; }
</style>