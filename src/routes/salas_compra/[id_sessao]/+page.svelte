<script lang="ts">
    // @ts-nocheck
    import { goto } from '$app/navigation';
    import { adicionarAoCarrinho } from '$lib/cartStore';

    // Svelte 5: Receber props
    let { data } = $props();

    // Svelte 5: Valores derivados
    const sessao = $derived(data.sessao);
    const lugares = $derived(data.lugares);

    const dataEvento = $derived(new Date(sessao.data_espectaculo));
    const dia = $derived(dataEvento.toLocaleDateString('pt-PT', { day: '2-digit' }));
    const mes = $derived(dataEvento.toLocaleDateString('pt-PT', { month: 'short' }).toUpperCase());
    const ano = $derived(dataEvento.getFullYear());

    // Estados Reativos ($state)
    let lugarSelecionado = $state([]);
    let modalZonaAberto = $state(false);
    let zonaSelecionadaInfo = $state(null);
    let mX = $state(0);
    let mY = $state(0);
    let lugarHover = $state(null);

    // Total derivado
    let precoTotal = $derived(lugarSelecionado.reduce((acc, l) => acc + Number(l.preco || 0), 0));

    function selecionarLugar(lugar) {
        const index = lugarSelecionado.findIndex(l => l.id_lugar === lugar.id_lugar);
        if (index === -1) {
            lugarSelecionado = [...lugarSelecionado, lugar];
        } else {
            lugarSelecionado = lugarSelecionado.filter(l => l.id_lugar !== lugar.id_lugar);
        }
    }

    function abrirZoomZona(event) {
        const target = event.target.closest('path, polygon, rect');
        if (!target) return;

        const bbox = target.getBBox();
        const techId = target.id || `z-${Math.floor(bbox.x)}-${Math.floor(bbox.y)}`;
        
        const lugaresDaZona = lugares.filter(l => {
            const cfg = typeof l.config_tecnica === 'string' ? JSON.parse(l.config_tecnica) : l.config_tecnica;
            return cfg?.idTecnico === techId || l.zona === techId;
        });

        if (lugaresDaZona.length > 0) {
            zonaSelecionadaInfo = { nome: lugaresDaZona[0].zona, lugares: lugaresDaZona };
            modalZonaAberto = true;
        }
    }

function finalizarSelecao() {
        if (lugarSelecionado.length === 0) return;
        
        lugarSelecionado.forEach(l => {
            adicionarAoCarrinho({
                id_lugar: l.id_lugar, 
                id_evento: sessao.id_eventos, // Usar o ID do evento da BD
                id_sala: sessao.id_sala,
                nome_evento: sessao.nome_evento, 
                nome_sala: sessao.nome_sala,
                data: sessao.data_espectaculo, 
                hora: sessao.hora_inicio,
                fila: l.fila, 
                num: l.num, 
                preco: l.preco, 
                zona: l.zona, 
                imagem: sessao.imagem_cartaz
            });
        });
        goto('/carrinho');
    }

    function handleMouseMove(e) {
        mX = e.clientX;
        mY = e.clientY;
    }
</script>

<div class="checkout-page" onmousemove={handleMouseMove} role="presentation">
    <header class="event-header">
        <div class="poster-wrapper">
            <div class="date-card">
                <span class="date-month">{mes}</span>
                <span class="date-day">{dia}</span>
                <span class="date-year">{ano}</span>
                <span class="date-hour">{sessao.hora_inicio.slice(0, 5)}</span>
            </div>
            <img src={sessao.imagem_cartaz} alt={sessao.nome_evento} class="event-poster" />
        </div>
        <div class="event-info">
            <h1>{sessao.nome_evento}</h1>
            <span class="event-sala">{sessao.nome_sala}</span>
        </div>
        <button class="close-btn" onclick={() => window.history.back()}>&times;</button>
    </header>

    <main class="content-grid">
        <section class="map-area">
            <div class="room-svg" onclick={abrirZoomZona} aria-hidden="true">
                {@html sessao.svg_code}
            </div>
            <p class="map-hint">Clique numa zona para escolher os lugares</p>
        </section>

        <aside class="side-panel">
            <div class="panel-block resumo">
                <h3>Lugares Selecionados</h3>
                {#each lugarSelecionado as l}
                    <div class="ticket-mini">
                        <span>{l.zona} • Fila {l.fila}, {l.num}</span>
                        <strong>{l.preco}€</strong>
                    </div>
                {:else}
                    <p class="empty-text">Nenhum lugar escolhido</p>
                {/each}
            </div>
        </aside>
    </main>

    {#if lugarSelecionado.length > 0}
        <div class="selection-footer">
            <div class="footer-info">
                <span>{lugarSelecionado.length} Bilhetes</span>
                <strong>Total: {precoTotal.toFixed(2)}€</strong>
            </div>
            <button class="confirm-btn" onclick={finalizarSelecao}>FINALIZAR COMPRA</button>
        </div>
    {/if}
</div>

{#if modalZonaAberto && zonaSelecionadaInfo}
    <div class="blueprint-overlay">
        <div class="blueprint-window">
            <header class="blueprint-header">
                <h2>{zonaSelecionadaInfo.nome}</h2>
                <button class="close-x" onclick={() => modalZonaAberto = false}>&times;</button>
            </header>
            <div class="blueprint-body">
                <div class="canvas-paper">
                    <svg width="100%" height="100%" viewBox="0 0 1000 800">
                        {#each zonaSelecionadaInfo.lugares as l}
                            <g class="seat-g" class:occupied={l.estado === 'ocupado'} 
                               onclick={() => l.estado !== 'ocupado' && selecionarLugar(l)}
                               onmouseenter={() => lugarHover = l} onmouseleave={() => lugarHover = null}>
                                <circle cx={l.x} cy={l.y} r="15" 
                                    class="seat" 
                                    class:selected={lugarSelecionado.some(sel => sel.id_lugar === l.id_lugar)} />
                                <text x={l.x} y={l.y + 5} class="seat-label">{l.num}</text>
                            </g>
                        {/each}
                    </svg>
                    {#if lugarHover}
                        <div class="tooltip" style="top:{mY - 80}px; left:{mX}px">
                            {lugarHover.fila}{lugarHover.num} • {lugarHover.preco}€
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>

    :root {
        --primary-color: #0f3460;
        --secondary-color: #ff0000;
        --background-dark: #1a1a2e;
        --text-light: #e0e0e0;
        --text-muted: #888;
        --card-bg: #16213e;
    }

    .checkout-page {
        min-height: 100vh;
        padding: 30px 30px 40px;
        color: var(--text-light);
        background: var(--primary-color);
    }

    :global(.room-svg svg) { width: 100%; height: auto; cursor: crosshair; }
    .map-hint { color: #64748b; text-align: center; font-size: 0.8rem; margin-top: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

    .seat { fill: #10b981; transition: 0.2s; cursor: pointer; stroke: #0f172a; stroke-width: 2; }
    .seat:hover { fill: var(--accent); r: 18; }
    .seat.selected { fill: #f59e0b; r: 18; stroke: white; }
    .seat-g.occupied { opacity: 0.2; cursor: not-allowed; pointer-events: none; }
    .seat-label { fill: white; font-size: 10px; font-weight: bold; text-anchor: middle; pointer-events: none; }
    .tooltip { position: fixed; background: var(--accent); color: #020617; padding: 6px 15px; border-radius: 8px; font-weight: 800; pointer-events: none; z-index: 3000; box-shadow: 0 5px 15px rgba(0,0,0,0.4); }

    :global(body) {
        margin: 0;
        background: var(--background-dark);
        color: #e5e7eb;
    }

    .event-header {
        max-width: 1160px;
        margin: 0 auto 35px;
        display: flex;
        gap: 25px;
        align-items: center;
        background: rgba(22, 33, 62, 0.96);
        padding: 20px 20px;
        border-radius: 22px;
        border: 1px solid #1e293b;
        box-shadow: 0 25px 50px rgba(0,0,0,0.6);
        position: relative;
    }

    .poster-wrapper {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .date-card {
        width: 70px;
        height: 110px;            
        background: white;
        border-radius: 8px;
        overflow: hidden;
        text-align: center;
        box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        display: flex;          
        flex-direction: column;
    }

    .date-month {
        background: #cc0000;
        color: white;
        font-weight: 800;
        font-size: 0.75rem;
        padding: 5px 0;
        letter-spacing: 1px;
    }

    .date-day {
        font-size: 1.8rem;
        font-weight: 800;
        color: #1a1f3a;
        padding-top: 5px;
    }

    .date-year {
        font-size: 0.7rem;
        font-weight: 600;
        color: #475569;
    }

    .date-hour {
        font-size: 0.8rem;
        font-weight: 700;
        color: #1a1f3a;
        padding: 4px 0 8px;
    }

    .event-poster {
        height: 110px;       
        aspect-ratio: 3 / 4;    
        object-fit: cover;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }

    .event-info h1 {
        font-size: 2.2rem;
        margin: 0 0 5px 0;
        color: var(--accent);
        text-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
    }

    .event-sala {
        font-size: 1rem;
        color: #94a3b8;
        letter-spacing: 0.5px;
    }

    /* --- LAYOUT GRID --- */
    .content-grid {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 30px;
    }

    .map-area {
        background: white; /* Mantém o fundo branco para o SVG original se destacar */
        border-radius: 24px;
        padding: 30px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .instruction {
        color: #64748b;
        font-size: 0.8rem;
        margin-bottom: 15px;
        font-weight: 600;
        text-transform: uppercase;
    }

    /* --- PAINEL LATERAL --- */
    .side-panel {
        background: rgba(22, 33, 62, 0.96);
        border-radius: 24px;
        padding: 25px;
        border: 1px solid #1e293b;
        height: fit-content;
    }

    .side-panel h3 {
        color: var(--accent);
        font-size: 1.1rem;
        margin-top: 0;
        border-bottom: 1px solid #334155;
        padding-bottom: 10px;
    }

    .ticket-mini {
        background: #0f172a;
        padding: 15px;
        border-radius: 12px;
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
        border-left: 4px solid var(--accent);
        animation: fadeIn 0.3s ease-out;
    }

    .ticket-mini span {
        font-size: 0.85rem;
        color: #cbd5e1;
    }

    .ticket-mini strong {
        font-size: 1.1rem;
        color: var(--secondary-color);
        margin-top: 5px;
    }

    /* --- FOOTER DE SELECÇÃO --- */
    .selection-footer {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #020617;
        border: 1px solid #1e293b;
        padding: 15px 40px;
        border-radius: 999px;
        display: flex;
        gap: 40px;
        align-items: center;
        box-shadow: 0 25px 50px rgba(0,0,0,0.8);
        z-index: 100;
        border: 1px solid var(--background-dark);
    }

    .footer-info {
        display: flex;
        flex-direction: column;
    }

    .footer-info span {
        font-size: 0.8rem;
        color: #94a3b8;
    }

    .footer-info strong {
        font-size: 1.3rem;
        color: var(--secondary-color);
    }

    .confirm-btn {
        background: var(--secondary-color);
        color: #020617;
        border: none;
        padding: 12px 35px;
        border-radius: 999px;
        font-weight: 800;
        font-size: 1rem;
        cursor: pointer;
        transition: 0.3s ease;
    }

    .confirm-btn:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 10px 10px rgba(255, 0, 0, 0.4);
    }

    /* --- MODAL BLUEPRINT (AJUSTES) --- */
    .blueprint-overlay {
        position: fixed;
        inset: 0;
        /* Fundo escuro mas com 85% de opacidade */
        background: rgba(2, 6, 23, 0.85); 
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
        /* O segredo para ver o fundo desfocado */
        backdrop-filter: blur(12px); 
        -webkit-backdrop-filter: blur(12px);
    }

    .blueprint-window {
        /* Fundo da janela ligeiramente transparente */
        background: rgba(15, 23, 42, 0.9); 
        width: 95vw;
        height: 90vh;
        border-radius: 24px;
        /* Borda subtil para dar definição */
        border: 1px solid rgba(255, 255, 255, 0.1); 
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .blueprint-header {
        padding: 20px 40px;
        /* Header também segue a transparência */
        background: rgba(30, 41, 59, 0.5); 
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .canvas-paper {
        flex: 1;
        /* Fundo do canvas quase transparente para veres a página por trás */
        background-color: rgba(2, 6, 23, 0.4); 
        background-image: 
            linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px);
        background-size: 40px 40px;
        overflow: auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-btn, .close-x {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 2.5rem;
        cursor: pointer;
        transition: 0.2s;
    }
    
    .close-btn {
        position: absolute;
        top: 30px;
        right: 30px;
        background: none;
        border: none;
        color: white;
        font-size: 3em;
        cursor: pointer;
        z-index: 10;
        transition: 0.3s ease;
    }

    .close-btn:hover {
        color: #ff0000;
        transform: rotate(90deg);
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(10px); }
        to { opacity: 1; transform: translateX(0); }
    }

</style>