<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { goto } from '$app/navigation';

    export let data;
    
    $: eventos = data?.eventos || [];
    $: tiposExistentes = data?.tipos || [];

    let filtroTipo = "Todos";
    let pesquisa = ""; 

    // Lógica reativa: sempre que filtroTipo mudar, a lista atualiza-se
    $: eventosFiltrados = eventos.filter(e => {
        const correspondeTipo = filtroTipo === "Todos" || e.tipo_espectaculo === filtroTipo;
        const correspondeNome = e.nome_evento.toLowerCase().includes(pesquisa.toLowerCase());
        
        return correspondeTipo && correspondeNome;
    });

    function comprar(id) {
        // Redireciona para a página de detalhes/calendário do evento
        goto(`/eventos/${id}`);
    }
</script>

<main class="events-page">
    <div class="welcome-text">
        <h1>Próximos Espetáculos</h1>
        <p>Escolha o seu evento favorito e reserve já o seu lugar!</p>
    </div>

    <div class="filter-wrapper">
        <div class="filter-bar">
            <label for="tipo">FILTRAR POR:</label>
            <select id="tipo" bind:value={filtroTipo}>
                <option value="Todos">TODOS OS TIPOS</option>
                {#each tiposExistentes as tipo}
                    <option value={tipo}>{tipo.toUpperCase()}</option>
                {/each}
            </select>
        </div>

        <div class="search-bar">
            <input 
                type="text" 
                placeholder="PESQUISAR EVENTO..." 
                bind:value={pesquisa} 
            />
            <span class="search-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="20px" height="20px">
                        <path d="M 21 3 C 11.601563 3 4 10.601563 4 20 C 4 29.398438 11.601563 37 21 37 C 24.355469 37 27.460938 36.015625 30.09375 34.34375 L 42.375 46.625 L 46.625 42.375 L 34.5 30.28125 C 36.679688 27.421875 38 23.878906 38 20 C 38 10.601563 30.398438 3 21 3 Z M 21 7 C 28.199219 7 34 12.800781 34 20 C 34 27.199219 28.199219 33 21 33 C 13.800781 33 8 27.199219 8 20 C 8 12.800781 13.800781 7 21 7 Z"></path>
                    </svg>
                </span>        
            </div>
        </div>

    <div class="cards-grid">
        {#each eventosFiltrados as evento}
            <div class="event-card">
                <div class="card-image" style="background-image: url('{evento.imagem_cartaz || '/placeholder.jpg'}')">
                    <span class="type-tag">{evento.tipo_espectaculo || 'Evento'}</span>
                </div>
                <div class="card-info">
                    <h3>{evento.nome_evento}</h3>
                    <p>{evento.descricao?.slice(0, 100) || 'Sem descrição disponível.'}</p>
                    <div class="card-actions">
                        <button class="buy-btn" on:click={() => goto(`/eventos/detalhes_pagina/${evento.id_eventos}`)}>
                             Comprar Bilhete
                        </button>
                    </div>
                </div>
            </div>
        {:else}
            <div class="empty-state">
                <p>Não foram encontrados eventos para a sua pesquisa.</p>
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

    /* GRID E CARDS */
    .events-page {
        padding: 60px 20px;
        min-height: 100vh;
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
    }

    .welcome-text { 
        text-align: center; 
        margin-bottom: 30px; 
        color: white; 
    }

    .welcome-text h1 { 
        font-size: 3em; 
        margin-bottom: 10px; 
        font-weight: 800;
        letter-spacing: -1px;
    }

    .filter-bar {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .filter-bar label {
        margin-left: 10px;
        color: white;
        font-weight: bold;
        font-size: 0.9em;
        letter-spacing: 1px;
    }

    .filter-bar select {
        background: var(--background-dark);
        color: var(--text-muted);
        border: 2px solid var(--secondary-color);
        padding: 10px 22px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        outline: none;
        transition: 0.3s;
    }

    .filter-wrapper {
        max-width: 1200px;
        margin: 0 auto 40px auto;
        display: flex;
        justify-content: space-between; /* ESQUERDA E DIREITA */
        align-items: center;
        gap: 20px;
        width: 100%;
    }

    /* Estilo da Barra de Pesquisa */
    .search-bar {
        position: relative;
    }

    .search-bar input {
        background: #1a1a2e; /* Mesma cor do select */
        color: white;
        border: 2px solid #ff0000;
        padding: 10px 40px 10px 15px;
        border-radius: 8px;
        outline: none;
        font-weight: bold;
        width: 250px;
        transition: width 0.3s ease, box-shadow 0.3s ease;
    }

    .search-icon {
        position: absolute;
        right: 15px;
        top: 54%;
        transform: translateY(-50%);
        pointer-events: none;
        font-size: 0.9em;
    }

    .search-icon svg {
        fill: #ffffff; /* ALTERADO PARA BRANCO */
        opacity: 0.8;  /* Opcional: dá um toque mais suave */
        transition: all 0.3s ease;
    }

    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

    .event-card:hover { 
        transform: translateY(-10px); 
    }

    .card-image {
        height: 390px;
        background-size: cover;
        background-position: center;
        position: relative;
    }

    .type-tag {
        position: absolute; 
        top: 15px; 
        right: 15px;
        background: var(--secondary-color); 
        color: #1a1a2e;
        padding: 6px 15px; 
        border-radius: 50px; 
        font-size: 1em; 
        font-weight: bold;
    }

    .card-info { 
        padding: 15px; 
        color: white; 
        flex-grow: 1; 
        display: flex; 
        flex-direction: column; 
    }

    .card-info h3 { 
        margin: 0 0 8px 0; 
        font-size: 1.5em; 
    }

    .card-info p { 
        color: var(--text-muted); 
        font-size: 1em; 
        line-height: 1.5; 
        margin-bottom: 12px; 
        flex-grow: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
    }

    /* BOTÃO COMPRAR BILHETE */
    .buy-btn {
        background: var(--secondary-color);
        color: #1a1a2e;
        border: none;
        padding: 15px;
        border-radius: 12px;
        font-size: 1.2em;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
        width: 100%;
    }

    .buy-btn:hover {
        filter: brightness(1.2);
        box-shadow: 0 5px 15px rgba(255, 0, 0, 0.4);
    }

    .empty-state { 
        color: white; 
        text-align: center; 
        grid-column: 1 / -1; 
        font-size: 1.2em; 
        
    }

    @media (max-width: 768px) {
        .filter-wrapper {
            flex-direction: column;
            align-items: flex-start;
        }
        .search-bar {
            width: 100%;
        }
        .search-bar input {
            width: 100% !important;
        }
    }

</style>