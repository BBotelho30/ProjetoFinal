<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { user } from '$lib/userStore';
    import { enhance } from '$app/forms';

    import SalaCinema from '$lib/components/SalaCinema.svelte';
    import SalaPequena from '$lib/components/SalaPequena.svelte';
    import SalaGrande from '$lib/components/SalaGrande.svelte';

    let salaSelecionada = '';
    let modalAberto = false;
    let svgZonaHtml = '';
    let zonaSelecionada = '';
    let viewBoxAtiva = '0 0 595.28 841.89'; 

    const TAMANHO_ZOOM = 250; 
    const RAIO_BOLA = 4;      

    interface Ponto { x: number; y: number; }
    interface Lugar { x: number; y: number; zona: string; id: number; fila: string; num: number; step: number; }

    let pontosGuia: Ponto[] = [];
    let lugares: Lugar[] = [];
    let nomeFila = 'A';
    let qtdLugares = 10;
    let ultimaCurva: Ponto[] = []; 
    let contadorPassos = 0;

    onMount(() => {
        const currentUser = $user as any;
        if (!currentUser || currentUser.tipo !== 'admin') goto('/autenticacao/login');
    });

    const zonasMap: Record<string, string> = {
      'cls-1': 'D', 'cls-2': 'A', 'cls-3': 'B', 'cls-4': 'E',
      'cls-5': 'F', 'cls-6': 'G', 'cls-7': 'I', 'cls-8': 'H', 
      'cls-9': 'C', 'cls-10': 'J', 'cls-11': 'K', 'cls-12': 'L'
    };

    function handleZonaClick(event: MouseEvent) {
        const target = event.target as SVGElement;
        const element = target?.closest('[class*="cls-"]');
        if (!element) return;

        const classes = Array.from(element.classList);
        const classeZona = classes.find(c => zonasMap[c]);
        if (!classeZona) return;

        zonaSelecionada = zonasMap[classeZona];
        const grafico = element as unknown as SVGGraphicsElement;
        const bbox = grafico.getBBox();
        const centroX = bbox.x + bbox.width / 2;
        const centroY = bbox.y + bbox.height / 2;
        
        viewBoxAtiva = `${centroX - TAMANHO_ZOOM/2} ${centroY - TAMANHO_ZOOM/2} ${TAMANHO_ZOOM} ${TAMANHO_ZOOM}`;

        const svgModal = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgModal.setAttribute('viewBox', viewBoxAtiva);
        svgModal.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svgModal.appendChild(grafico.cloneNode(true));

        svgZonaHtml = svgModal.outerHTML;
        pontosGuia = []; 
        modalAberto = true;
        contadorPassos = 0;
    }

    function handleModalInteraction(event: MouseEvent) {
        event.preventDefault();
        const svgOverlay = event.currentTarget as SVGSVGElement;
        const pt = svgOverlay.createSVGPoint();
        pt.x = event.clientX; pt.y = event.clientY;
        const cursorPt = pt.matrixTransform(svgOverlay.getScreenCTM()?.inverse());
        if (!cursorPt) return;

        if (event.button === 0) {
            if (pontosGuia.length < 3) pontosGuia = [...pontosGuia, { x: cursorPt.x, y: cursorPt.y }];
        } else if (event.button === 2) {
            pontosGuia = [];
        }
    }

    function calcularPontoExato(t: number, p0: Ponto, p1: Ponto, p2: Ponto): Ponto {
        const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
        const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
        return { x, y };
    }

    function processarFila(pontos: Ponto[]) {
        if (pontos.length < 2) return;
        const p0 = pontos[0];
        const p2 = pontos[pontos.length - 1];
        const p1 = pontos.length === 3 ? pontos[1] : { x: (p0.x + p2.x)/2, y: (p0.y + p2.y)/2 };

        contadorPassos++; 
        let novosLugares = [];
        for (let i = 0; i < qtdLugares; i++) {
            const t = qtdLugares > 1 ? i / (qtdLugares - 1) : 0.5;
            const pos = calcularPontoExato(t, p0, p1, p2);
            novosLugares.push({ 
                x: pos.x, y: pos.y, zona: zonaSelecionada, fila: nomeFila, num: i+1, 
                id: Date.now() + i, step: contadorPassos 
            });
        }
        lugares = [...lugares, ...novosLugares];
        ultimaCurva = [p0, p1, p2]; 
        pontosGuia = [];
        nomeFila = String.fromCharCode(nomeFila.charCodeAt(0) + 1);
    }

    function carimbarFila() {
        if (ultimaCurva.length < 2) return;
        processarFila(ultimaCurva.map(p => ({ x: p.x, y: p.y + 22 })));
    }

    function desfazer() {
        if (contadorPassos === 0) return;
        lugares = lugares.filter(l => !(l.zona === zonaSelecionada && l.step === contadorPassos));
        contadorPassos--;
        nomeFila = String.fromCharCode(nomeFila.charCodeAt(0) - 1);
    }

    function fecharModal() {
        modalAberto = false;
        svgZonaHtml = '';
        ultimaCurva = [];
    }
</script>

<div class="admin-container">
    <aside class="sidebar">
        <h2>Gestor de Salas</h2>
        <div class="input-group">
            <label>Escolher Sala</label>
            <select bind:value={salaSelecionada} on:change={() => lugares = []}>
                <option value="">--- Selecionar ---</option>
                <option value="cinema">Sala Cinema</option>
                <option value="grande">Sala Grande</option>
                <option value="pequena">Sala Pequena</option>
            </select>
        </div>
        
        {#if lugares.length > 0}
            <div class="stats">
                <p>Lugares: <strong>{lugares.length}</strong></p>
                <form method="POST" action="?/guardarLugares" use:enhance>
                <input type="hidden" name="lugares" value={JSON.stringify(lugares)} />
                <input type="hidden" name="sala" value={salaSelecionada} />
    
                <button type="submit" class="btn-save">
                    Guardar 
                </button>
            </form>
            </div>
        {/if}
    </aside>

    <main class="editor-main">
        {#if salaSelecionada}
            <div class="canvas-view" on:click={handleZonaClick}>
                <div class="svg-container">
                    {#if salaSelecionada === 'cinema'}<SalaCinema />{/if}
                    {#if salaSelecionada === 'grande'}<SalaGrande />{/if}
                    {#if salaSelecionada === 'pequena'}<SalaPequena />{/if}
                    <svg class="global-overlay" viewBox="0 0 595.28 841.89">
                        {#each lugares as l}
                            <circle cx={l.x} cy={l.y} r="2.5" fill="white" stroke="#000" stroke-width="0.5" />
                        {/each}
                    </svg>
                </div>
            </div>
        {/if}
    </main>
</div>

{#if modalAberto}
<div class="modal-backdrop">
    <div class="modal">
        <header class="modal-header">
            <div class="info">
                <h3>Edição: Zona {zonaSelecionada} | Fila {nomeFila}</h3>
                <p>Botão esquerdo marca. Direito limpa.</p>
            </div>
            <div class="tools">
                <input type="number" bind:value={qtdLugares} />
                <button class="btn-gen" on:click={() => processarFila(pontosGuia)} disabled={pontosGuia.length < 2}>Gerar</button>
                <button class="btn-stamp" on:click={carimbarFila} disabled={ultimaCurva.length === 0}>+ Fila</button>
                <button class="btn-undo" on:click={desfazer} disabled={contadorPassos === 0}>Desfazer</button>
            </div>
        </header>

        <div class="modal-scroll-area">
            <div class="modal-body">
                <div class="svg-layers">
                    <div class="svg-background">{@html svgZonaHtml}</div>
                    <svg class="draw-overlay" viewBox={viewBoxAtiva} on:mousedown={handleModalInteraction} on:contextmenu|preventDefault>
                        {#if pontosGuia.length >= 2}
                            <path d="M {pontosGuia[0].x} {pontosGuia[0].y} Q {pontosGuia.length === 3 ? (2 * pontosGuia[1].x - 0.5 * pontosGuia[0].x - 0.5 * pontosGuia[2].x) : (pontosGuia[0].x + pontosGuia[1].x)/2} {pontosGuia.length === 3 ? (2 * pontosGuia[1].y - 0.5 * pontosGuia[0].y - 0.5 * pontosGuia[2].y) : (pontosGuia[0].y + pontosGuia[1].y)/2} {pontosGuia[pontosGuia.length-1].x} {pontosGuia[pontosGuia.length-1].y}" fill="none" stroke="#e94560" stroke-width="2" stroke-dasharray="4" />
                        {/if}
                        {#each pontosGuia as p}<circle cx={p.x} cy={p.y} r={RAIO_BOLA} fill="#00d2ff" stroke="#fff" stroke-width="1.5" />{/each}
                        {#each lugares.filter(l => l.zona === zonaSelecionada) as l}
                            <g><circle cx={l.x} cy={l.y} r={RAIO_BOLA} fill="#e94560" stroke="#fff" stroke-width="0.8" /><text x={l.x} y={l.y - (RAIO_BOLA + 2)} font-size="6" text-anchor="middle" fill="#fff" font-weight="bold" class="seat-label">{l.fila}{l.num}</text></g>
                        {/each}
                    </svg>
                </div>
            </div>
        </div>

        <footer class="modal-footer">
            <button class="btn-close" on:click={fecharModal}>Concluir Zona</button>
        </footer>
    </div>
</div>
{/if}

<style>
    .admin-container { display: flex; height: 100vh; background: #0f172a; color: #fff; }
    .sidebar { width: 300px; background: #1e293b; padding: 25px; border-right: 1px solid #334155; }
    .editor-main { flex: 1; display: flex; justify-content: center; align-items: center; background: #020617; overflow: auto; }
    .canvas-view { background: #fff; padding: 20px; border-radius: 12px; width: 580px; }
    .svg-container { position: relative; width: 100%; }
    .global-overlay { position: absolute; inset: 0; pointer-events: none; }

    /* MODAL FIXO COM SCROLL INTERNO */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.95); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(8px); }
    .modal { background: #1e293b; border-radius: 20px; width: 95%; max-width: 1100px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }

    .modal-header { padding: 25px 30px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .modal-scroll-area { flex: 1; overflow-y: auto; padding: 20px 30px; }
    .modal-body { position: relative; height: 600px; background: #fff; border-radius: 12px; overflow: hidden; }
    .modal-footer { padding: 20px 30px; background: #1e293b; border-top: 1px solid #334155; }

    .svg-layers { position: relative; width: 100%; height: 100%; }
    .svg-background { position: absolute; inset: 0; z-index: 5; pointer-events: none; display: flex; justify-content: center; }
    .draw-overlay { position: absolute; inset: 0; z-index: 20; width: 100%; height: 100%; cursor: crosshair; }

    .btn-gen { background: #e94560; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .btn-stamp { background: #3b82f6; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .btn-undo { background: #f59e0b; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .btn-save { width: 100%; background: #10b981; color: white; padding: 12px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; margin-top: 15px; }
    .btn-close { width: 100%; background: #475569; color: #fff; border: none; padding: 15px; border-radius: 10px; font-weight: bold; cursor: pointer; }
    
    input[type="number"] { width: 60px; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 8px; }
    .seat-label { pointer-events: none; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }
</style>