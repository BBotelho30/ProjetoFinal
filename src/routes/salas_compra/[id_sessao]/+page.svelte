<script>
    // @ts-nocheck
    import SalaCinema from '$lib/components/SalaCinema.svelte';
    import SalaPequena from '$lib/components/SalaPequena.svelte';
    import SalaGrande from '$lib/components/SalaGrande.svelte';

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
        <div class="svg-wrapper">
            <div class="room-svg">
                {#if sessao.nome_sala.toLowerCase().includes('pequena')}
                    <SalaPequena />
                {:else if sessao.nome_sala.toLowerCase().includes('grande')}
                    <SalaGrande />
                {:else}
                    <SalaCinema />
                {/if}
            </div>

            <svg class="places-overlay" viewBox="0 0 595.28 841.89" preserveAspectRatio="xMidYMid meet">
                {#each lugares as l}
                    <circle 
                        cx={l.x} 
                        cy={l.y} 
                        r="3.5" 
                        class="seat"
                        class:selected={lugarSelecionado?.id_lugar === l.id_lugar}
                        on:click={() => selecionarLugar(l)}
                    >
                        <title>Fila {l.fila}, Lugar {l.num}</title>
                    </circle>
                {/each}
            </svg>
        </div>
    </main>

    {#if lugarSelecionado}
        <div class="selection-footer">
            <p>Lugar Selecionado: <strong>Fila {lugarSelecionado.fila}, Lugar {lugarSelecionado.num}</strong></p>
            <button class="confirm-btn">Confirmar Reserva</button>
        </div>
    {/if}
</div>

<style>
    .checkout-page {
        min-height: 90vh;
        background: #121212;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
    }

    .room-container {
        width: 100%;
        max-width: 1000px;
        background: white;
        padding: 40px;
        border-radius: 15px;
        position: relative;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .svg-wrapper {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .room-svg {
        width: 100%;
        height: auto;
        z-index: 1;
    }

    /* O Overlay fica em cima da sala */
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
        fill: #ffffff;
        stroke: #333;
        stroke-width: 0.5;
        cursor: pointer;
        pointer-events: all; /* Ativa o clique apenas nos círculos */
        transition: all 0.2s;
    }

    .seat:hover {
        fill: #ffde59;
        r: 5;
    }

    .seat.selected {
        fill: #2ecc71; /* Verde quando é selecionado */
        stroke: #1b5e20;
        r: 5;
    }

    .screen-indicator {
        width: 60%;
        height: 4px;
        background: #444;
        margin-bottom: 50px;
        text-align: center;
        line-height: 30px;
        font-size: 0.7em;
        color: #888;
        border-radius: 100px / 10px;
    }

    .selection-footer {
        position: fixed;
        bottom: 20px;
        background: #1e1e1e;
        padding: 20px 40px;
        border-radius: 50px;
        display: flex;
        gap: 30px;
        align-items: center;
        border: 1px solid #333;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        z-index: 100;
    }

    .confirm-btn {
        background: #2ecc71;
        color: white;
        border: none;
        padding: 10px 25px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
    }

    :global(.room-svg svg) {
        width: 100%;
        height: auto;
    }
</style>