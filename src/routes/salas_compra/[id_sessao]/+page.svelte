<script lang="ts">
    // @ts-nocheck
    export let data;
    const { sessao, lugares } = data;

    let lugarSelecionado = null;

    function selecionarLugar(lugar) {
        lugarSelecionado = lugar;
        console.log("Lugar escolhido:", lugar);
    }
</script>

<div class="checkout-page">
    <header class="checkout-header">
        <h1>{sessao.nome_evento}</h1>
        <p>{sessao.nome_sala} | {sessao.hora_inicio.slice(0, 5)}</p>
    </header>

    <main class="room-container">
        <div class="screen-indicator">ECRÃ / PALCO</div>

        <div class="svg-wrapper">
            <div class="room-svg">
                {#if sessao.svg_code}
                    {@html sessao.svg_code}
                {:else}
                    <p>Mapa da sala indisponível.</p>
                {/if}
            </div>

            <svg class="places-overlay" viewBox="0 0 595.28 841.89" preserveAspectRatio="xMidYMid meet">
                {#each lugares as l}
                    <circle cx={l.x} cy={l.y} r="4" class="seat" class:selected={lugarSelecionado?.id_lugar === l.id_lugar} on:click={() => selecionarLugar(l)}>
                        <title>Fila {l.fila}, Lugar {l.num}</title>
                    </circle>
                {/each}
            </svg>
        </div>
    </main>

    {#if lugarSelecionado}
        <div class="selection-footer">
            <div class="info-text">
                <p>Lugar Selecionado:</p>
                <strong>Fila {lugarSelecionado.fila}, Lugar {lugarSelecionado.num}</strong>
            </div>
            <button class="confirm-btn">Confirmar Reserva</button>
        </div>
    {/if}
</div>

<style>
    .checkout-page {
        min-height: 95vh;
        background: #0f172a;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
    }

    .checkout-header { 
        text-align: center; 
        margin-bottom: 30px; 
    }
    
    .checkout-header h1 { font-size: 2.5rem; color: #3b82f6; margin-bottom: 5px; }

    .room-container {
        width: 100%;
        max-width: 900px;
        background: white;
        padding: 60px 40px 40px 40px;
        border-radius: 20px;
        position: relative;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .screen-indicator {
        width: 80%;
        height: 10px;
        background: #e2e8f0;
        margin-bottom: 60px;
        border-radius: 50px;
        color: #64748b;
        font-size: 0.8rem;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        padding-bottom: 15px;
        border-bottom: 4px solid #cbd5e1;
    }

    .svg-wrapper {
        position: relative;
        width: 100%;
    }

    .room-svg {
        width: 100%;
        z-index: 1;
        opacity: 1.0;
    }

    .places-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        pointer-events: none; 
    }

    .seat {
        fill: #94a3b8;
        stroke: #1e293b;
        stroke-width: 0.5;
        cursor: pointer;
        pointer-events: all;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .seat:hover {
        fill: #3b82f6;
        r: 6;
    }

    .seat.selected {
        fill: #10b981;
        stroke: #064e3b;
        r: 7;
    }

    .selection-footer {
        position: fixed;
        bottom: 30px;
        background: #1e293b;
        padding: 15px 35px;
        border-radius: 100px;
        display: flex;
        gap: 40px;
        align-items: center;
        border: 1px solid #334155;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
        z-index: 100;
        animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    .confirm-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 50px;
        font-weight: bold;
        cursor: pointer;
        font-size: 1rem;
        transition: transform 0.2s;
    }

    .confirm-btn:hover { transform: scale(1.05); background: #059669; }

    :global(.room-svg svg) {
        width: 100%;
        height: auto;
    }
</style>