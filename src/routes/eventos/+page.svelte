<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { goto } from '$app/navigation';

    export let data;
    let { eventos } = data;

    let siteName = "Gestão de Reservas de Lugares";

    function logout() {
        user.set(null);
        goto('/');
    }

    function comprar(eventoNome) {
        alert(`Iniciando a compra para: ${eventoNome}. (Funcionalidade brevemente disponível)`);
    }
</script>

<header class="header">
    <div class="logo">{siteName}</div>
    <nav class="nav">
        <ul>
            <li><a href="/">Início</a></li>
            <li><a href="/eventos">Eventos</a></li>
            {#if $user}
                <li class="user-greeting">Olá, <span>{$user.nome}</span></li>
                <li><button class="logout-btn" on:click={logout}>Sair</button></li>
            {:else}
                <li><a href="/login">Login</a></li>
            {/if}
        </ul>
    </nav>
</header>

<main class="events-page">
    <div class="welcome-text">
        <h1>Próximos Espetáculos</h1>
        <p>Escolha o seu evento favorito e reserve já o seu lugar!</p>
    </div>

    <div class="cards-grid">
        {#each eventos as evento}
            <div class="event-card">
                <div class="card-image" style="background-image: url('{evento.imagem_cartaz || '/placeholder.jpg'}')">
                    <span class="type-tag">{evento.tipo_espectaculo || 'Evento'}</span>
                </div>
                <div class="card-info">
                    <h3>{evento.nome_evento}</h3>
                    <p>{evento.descricao || 'Sem descrição disponível.'}</p>
                    <div class="card-actions">
                        <button class="buy-btn" on:click={() => comprar(evento.nome_evento)}>
                            Comprar Bilhete
                        </button>
                    </div>
                </div>
            </div>
        {:else}
            <div class="empty-state">
                <p>De momento não existem eventos disponíveis.</p>
            </div>
        {/each}
    </div>
</main>

<style>
    :root {
        --primary-color: #0f3460;
        --secondary-color: #ff0000;
        --background-dark: #1a1a2e;
        --text-light: #e0e0e0;
        --text-muted: #888;
        --card-bg: #16213e;
    }

    /* HEADER */
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
        font-family: 'Roboto', sans-serif;
    }

    .logo { font-size: 1.8em; font-weight: bold; color: var(--text-light); }
    .nav ul { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; }
    .nav li { margin-left: 30px; }
    .nav a { color: var(--text-light); text-decoration: none; font-size: 1.1em; transition: 0.3s; }
    .nav a:hover { color: var(--secondary-color); }

    .user-greeting { color: var(--text-light); margin-left: 30px; font-size: 1.1em; }
    .user-greeting span { color: var(--secondary-color); font-weight: bold; }

    .logout-btn {
        background: none;
        border: 2px solid var(--secondary-color);
        color: var(--secondary-color);
        padding: 8px 20px;
        border-radius: 50px;
        cursor: pointer;
        margin-left: 20px;
        transition: 0.3s;
    }

    .logout-btn:hover { background: var(--secondary-color); color: white; }

    /* GRID E CARDS */
    .events-page {
        padding: 60px 20px;
        min-height: 100vh;
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
        font-family: 'Roboto', sans-serif;
    }

    .welcome-text { text-align: center; margin-bottom: 50px; color: white; }
    .welcome-text h1 { font-size: 3em; margin-bottom: 10px; }

    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 40px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .event-card {
        background: var(--card-bg);
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease;
    }

    .event-card:hover { transform: translateY(-10px); }

    .card-image {
        height: 250px;
        background-size: cover;
        background-position: center;
        position: relative;
    }

    .type-tag {
        position: absolute; top: 15px; right: 15px;
        background: var(--secondary-color); color: white;
        padding: 6px 15px; border-radius: 50px; font-size: 0.8em; font-weight: bold;
    }

    .card-info { padding: 25px; color: white; flex-grow: 1; display: flex; flex-direction: column; }
    .card-info h3 { margin: 0 0 15px 0; font-size: 1.5em; }
    .card-info p { color: var(--text-muted); font-size: 1em; line-height: 1.5; margin-bottom: 25px; flex-grow: 1; }

    /* BOTÃO COMPRAR BILHETE */
    .buy-btn {
        background: var(--secondary-color);
        color: white;
        border: none;
        padding: 15px;
        border-radius: 12px;
        font-size: 1.1em;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
        width: 100%;
    }

    .buy-btn:hover {
        filter: brightness(1.2);
        box-shadow: 0 5px 15px rgba(233, 69, 96, 0.4);
    }

    .empty-state { color: white; text-align: center; grid-column: 1 / -1; font-size: 1.2em; }
</style>