<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { goto } from '$app/navigation';

    export let data;
    let { eventos } = data;

    function comprar(eventoNome) {
        alert(`Iniciando a compra para: ${eventoNome}. (Funcionalidade brevemente disponível)`);
    }
</script>

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
                        <button class="buy-btn" on:click={() => goto(`/eventos/detalhes_pagina/${evento.id_eventos}`)}>
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

    /* GRID E CARDS */
    .events-page {
        padding: 60px 20px;
        min-height: 100vh;
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
    }

    .welcome-text { 
        text-align: center; 
        margin-bottom: 50px; 
        color: white; 
    }

    .welcome-text h1 { 
        font-size: 3em; 
        margin-bottom: 10px; 
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

</style>