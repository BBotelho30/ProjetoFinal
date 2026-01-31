<script lang="ts">
    // @ts-nocheck
    import { goto } from '$app/navigation';
    import { adicionarAoCarrinho } from '$lib/cartStore';

    export let data;
    const { sessao, lugares } = data;

    // Data do evento
    const dataEvento = new Date(sessao.data_espectaculo);
    const dia = dataEvento.toLocaleDateString('pt-PT', { day: '2-digit' });
    const mes = dataEvento.toLocaleDateString('pt-PT', { month: 'short' }).toUpperCase();
    const ano = dataEvento.getFullYear();

    // Estado
    let lugarSelecionado = [];
    let lugarHover = null;
    let mX = 0;
    let mY = 0;

    // Total
    $: precoTotal = lugarSelecionado.reduce(
        (acc, l) => acc + Number(l.preco || 0),
        0
    );

    // Selecionar / remover lugar
    function selecionarLugar(lugar) {
        const index = lugarSelecionado.findIndex(
            l => l.id_lugar === lugar.id_lugar
        );

        if (index === -1) {
            lugarSelecionado = [...lugarSelecionado, lugar];
        } else {
            lugarSelecionado = lugarSelecionado.filter(
                l => l.id_lugar !== lugar.id_lugar
            );
        }
    }

    // Mouse (tooltip)
    function handleMouseMove(e) {
        mX = e.clientX;
        mY = e.clientY;
    }

    // Enviar para carrinho
    function finalizarSelecao() {
        if (lugarSelecionado.length === 0) return;

        lugarSelecionado.forEach(lugar => {
            adicionarAoCarrinho({
                id_lugar: lugar.id_lugar,
                id_sessao: sessao.id_sessao,
                nome_evento: sessao.nome_evento,
                nome_sala: sessao.nome_sala,
                data: sessao.data_espectaculo,
                hora: sessao.hora_inicio,
                fila: lugar.fila,
                num: lugar.num,
                preco: lugar.preco,
                zona: lugar.zona,
                imagem: sessao.imagem_cartaz
            });
        });

        goto('/carrinho');
    }
</script>
<div class="checkout-page">

    <!-- HEADER -->
    <header class="event-header">
        <div class="poster-wrapper">
            <div class="date-card">
                <span class="date-month">{mes}</span>
                <span class="date-day">{dia}</span>
                <span class="date-year">{ano}</span>
                <span class="date-hour">{sessao.hora_inicio.slice(0, 5)}</span>
            </div>

            <img
                src={sessao.imagem_cartaz || '/placeholder.jpg'}
                alt={sessao.nome_evento}
                class="event-poster"
            />
        </div>

        <div class="event-info">
            <h1>{sessao.nome_evento}</h1>
            <span class="event-sala">{sessao.nome_sala}</span>
        </div>

        <button class="close-btn" on:click={() => window.history.back()}>
            &times;
        </button>
    </header>

    <!-- CONTEÚDO -->
    <main class="content-grid">

        <!-- MAPA -->
        <section class="map-area">
            <div class="svg-wrapper" on:mousemove={handleMouseMove}>
                <div class="room-svg">
                    {@html sessao.svg_code}
                </div>

                <svg class="places-overlay" viewBox="0 0 595.28 841.89">
                    {#each lugares as l}
                        <circle
                            cx={l.x}
                            cy={l.y}
                            r="5"
                            class="seat"
                            class:selected={lugarSelecionado.some(sel => sel.id_lugar === l.id_lugar)}
                            on:click={() => selecionarLugar(l)}
                            on:mouseenter={() => lugarHover = l}
                            on:mouseleave={() => lugarHover = null}
                        >
                            <title>Fila {l.fila}, Lugar {l.num}</title>
                        </circle>
                    {/each}
                </svg>

                {#if lugarHover}
                    <div
                        class="price-tooltip follow-mouse"
                        style:top="{mY - 60}px"
                        style:left="{mX + 15}px"
                    >
                        <span class="zona-name">{lugarHover.zona}</span>
                        <span class="zona-price">{lugarHover.preco}€</span>
                    </div>
                {/if}
            </div>
        </section>

        <!-- PAINEL LATERAL -->
        <aside class="side-panel">
            <div class="panel-block">
                <h3>Zonas</h3>
                <ul class="zone-list">
                    <li><span class="dot green"></span> Plateia</li>
                    <li><span class="dot blue"></span> Balcão</li>
                    <li><span class="dot gray"></span> Indisponível</li>
                </ul>
            </div>

            <div class="panel-block resumo">
                <h3>Selecionados</h3>
                {#if lugarSelecionado.length === 0}
                    <p>Nenhum lugar selecionado</p>
                {:else}
                    <strong>
                        {lugarSelecionado.map(l => `${l.fila}${l.num}`).join(', ')}
                    </strong>
                {/if}
            </div>
        </aside>

    </main>

    <!-- FOOTER -->
    {#if lugarSelecionado.length > 0}
        <div class="selection-footer">
            <div class="info-text">
                <p>
                    {lugarSelecionado.length} Lugar(es) |
                    <strong>Total: {precoTotal.toFixed(2)}€</strong>
                </p>
                <small>
                    {lugarSelecionado.map(l => `${l.zona}: ${l.fila}${l.num}`).join(' | ')}
                </small>
            </div>

            <button class="confirm-btn" on:click={finalizarSelecao}>
                Pagar {precoTotal.toFixed(2)}€
            </button>
        </div>
    {/if}

</div>

<style>

    :root {
        --primary-color: #0f3460;
        --secondary-color: #ff0000;
        --background-dark: #1a1a2e;
        --text-light: #e0e0e0;
        --text-muted: #888;
        --card-bg: #16213e;
    }

    .event-header {
        max-width: 1300px;
        margin: 0 auto 35px;
        display: flex;
        gap: 25px;
        align-items: center;
        background: linear-gradient(
            135deg,
            rgba(2,6,23,0.95),
            rgba(15,23,42,0.95)
        );
        padding: 20px 25px;
        border-radius: 22px;
        border: 1px solid #1e293b;
        box-shadow: 0 25px 50px rgba(0,0,0,0.6);
        align-self: center;
        position: relative;
    }

    .checkout-page {
        padding-top: 110px; /* espaço para a navbar */
    }

    /* Wrapper cartaz + data */
    .poster-wrapper {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    /* BADGE DATA */
    .date-card {
    width: 70px;
    height: 120px;            
    background: white;
    border-radius: 6px;
    overflow: hidden;
    text-align: center;
    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
    font-family: 'Inter', sans-serif;
    display: flex;          
    flex-direction: column;
}

    

    /* MÊS (barra vermelha) */
    .date-month {
        display: block;
        background: #cc0000;
        color: #1a1f3a;
        font-weight: 800;
        font-size: 0.75rem;
        padding: 4px 0;
        letter-spacing: 1px;
    }

    /* DIA */
    .date-day {
        display: block;
        font-size: 1.8rem;
        font-weight: 800;
        color: #1a1f3a;
        padding: 8px 0 4px;

    }

    /* HORA */
    .date-hour {
        display: block;
        font-size: 0.8rem;
        font-weight: 700;
        color: #1a1f3a;
        padding-bottom: 8px;
    }

    .date-year {
        display: block;
        font-size: 0.7rem;
        font-weight: 600;
        color: #475569;
        margin-bottom: 4px;
    }
    
    /* CARTAZ */

    .event-poster {
        height: 120px;       
        width: auto;           
        aspect-ratio: 3 / 4;    
        object-fit: cover;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }


    /* INFO */
    .event-info h1 {
        font-size: 2rem;
        margin-bottom: 8px;
        color: #38bdf8;
    }

    /* META */
    .event-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        font-size: 0.95rem;
        color: #cbd5f5;
    }

    .event-sala {
    background: none !important;
    border: none !important;
    padding: 0 !important;
    border-radius: 0 !important;

    font-size: 0.95rem;
    color: #94a3b8;
    letter-spacing: 0.5px;
}
    /* PÁGINA DE CHECKOUT */
    .checkout-page {
        min-height: 100vh;
        background: radial-gradient(circle at top, #0f172a, #020617);
        color: #e5e7eb;
        padding: 30px;
    }

    .top-header {
        max-width: 1300px;
        margin: 0 auto 30px;
    }

    .top-header h1 {
        font-size: 2.2rem;
        color: #38bdf8;
    }

    .top-header p {
        color: #94a3b8;
    }

    /* GRID */
    .content-grid {
        max-width: 1300px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 2.2fr 1fr;
        gap: 30px;
    }

    /* MAPA */
    .map-area {
        background: #020617;
        border-radius: 20px;
        padding: 30px;
        border: 1px solid #1e293b;
    }


    .svg-wrapper {
        position: relative;
    }

    .room-svg svg {
        width: 100%;
        height: auto;
    }

    .places-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .seat {
        fill: #22c55e;
        stroke: #020617;
        stroke-width: 0.6;
        cursor: pointer;
        pointer-events: all;
        transition: 0.2s;
    }

    .seat:hover {
        fill: #38bdf8;
        r: 7;
    }

    .seat.selected {
        fill: #a855f7;
        r: 7;
    }

    /* PAINEL LATERAL */
    .side-panel {
        background: #020617;
        border-radius: 20px;
        padding: 25px;
        border: 1px solid #1e293b;
        display: flex;
        flex-direction: column;
        gap: 25px;
    }

    .panel-block h3 {
        margin-bottom: 10px;
        color: #38bdf8;
    }

    .zone-list {
        list-style: none;
        padding: 0;
    }

    .zone-list li {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #cbd5f5;
        margin-bottom: 6px;
    }

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }

    .dot.green { background: #22c55e; }
    .dot.blue { background: #38bdf8; }
    .dot.gray { background: #64748b; }
    .dot.selected { background: #a855f7; }

    .resumo strong {
        color: #22c55e;
    }

    /* FOOTER */
    .selection-footer {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #020617;
        border: 1px solid #1e293b;
        padding: 15px 35px;
        border-radius: 999px;
        display: flex;
        gap: 30px;
        align-items: center;
        box-shadow: 0 25px 40px rgba(0,0,0,0.6);
    }

    .confirm-btn {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        border: none;
        padding: 10px 28px;
        border-radius: 999px;
        font-weight: bold;
        color: #020617;
        cursor: pointer;
    }

    .close-btn {
        position: absolute;
        top: 16px;
        right: 20px;
        background: none;
        border: none;
        color: white;
        font-size: 2.5rem;
        cursor: pointer;
        z-index: 10;
        transition: 0.3s ease;
    }


    .price-tooltip.follow-mouse {
        position: absolute; /* Obrigatório para as coordenadas funcionarem */
        background: #3b82f6;
        color: white;
        padding: 6px 12px;
        border-radius: 8px;
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        pointer-events: none; /* Evita que o tooltip "trema" ao tapar o lugar */
        z-index: 999;
        display: flex;
        flex-direction: column;
        align-items: center;
        /* Removemos top e right fixos daqui */
        transition: transform 0.1s ease-out; /* Suaviza o movimento */
        white-space: nowrap;
    }   

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .info-text strong {
        color: #10b981;
        font-size: 1.2rem;
    }

    .info-text small {
        display: block;
        color: #94a3b8;
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .zona-name {
    font-size: 0.75rem;
    text-transform: uppercase;
    opacity: 0.9;
    letter-spacing: 0.5px;
    }

    .zona-price {
        font-size: 1.1rem;
    }


</style>
