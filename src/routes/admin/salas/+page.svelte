<script lang="ts">
    // @ts-nocheck
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { user } from '$lib/userStore';
    import { enhance } from '$app/forms';

    export let data;

    let salaSelecionada = '';
    let modalAberto = false;
    let svgZonaHtml = ''; 
    let zonaSelecionada = '';
    let viewBoxAtiva = '0 0 595.28 841.89'; 

    const RAIO_BOLA = 4;
    const DISTANCIA_FILAS = 22; 

    let pontosGuia = [];
    let lugares = [];
    let nomeFila = 'A';
    let qtdLugares = 10;
    let ultimaCurva = []; 
    let contadorPassos = 0;
    let passosPorZona = {};

    onMount(() => {
        const currentUser = $user;
        if (!currentUser || currentUser.tipo !== 'admin') goto('/autenticacao/login');
    });

    // Carrega os lugares da BD para o estado local ao mudar de sala
    function carregarDadosSala() {
        const salaAtiva = data.salas?.find(s => s.nome_sala === salaSelecionada);
        if (salaAtiva && salaAtiva.lugares_guardados) {
            lugares = salaAtiva.lugares_guardados;
            
            // Reconstroi passosPorZona para que o Desfazer funcione em dados vindos da BD
            passosPorZona = {};
            lugares.forEach(l => {
                if (!passosPorZona[l.zona] || l.step > passosPorZona[l.zona]) {
                    passosPorZona[l.zona] = l.step;
                }
            });
        } else {
            lugares = [];
            passosPorZona = {};
        }
    }

   function handleZonaClick(event: MouseEvent) {
        const target = event.target as SVGElement;
        const element = target?.closest('path, polygon, rect, ellipse, circle');
        if (!element) return;

        const grafico = element as unknown as SVGGraphicsElement;
        const bbox = grafico.getBBox();
        
        // --- NOVO: LÓGICA PARA RECUPERAR O NOME DA ZONA ---
        // 1. Tenta pelo ID do SVG (prioridade)
        let nomeEncontrado = element.id || '';

        // 2. Se não tem ID, procura nos lugares já existentes se algum 
        // está dentro desta área (bbox)
        if (!nomeEncontrado) {
            const lugarExistente = lugares.find(l => 
                l.x >= bbox.x && l.x <= (bbox.x + bbox.width) &&
                l.y >= bbox.y && l.y <= (bbox.y + bbox.height)
            );
            if (lugarExistente) nomeEncontrado = lugarExistente.zona;
        }

        zonaSelecionada = nomeEncontrado;
        // ------------------------------------------------

        const padding = 40;
        viewBoxAtiva = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;

        const svgModal = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgModal.setAttribute('viewBox', viewBoxAtiva);
        svgModal.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svgModal.appendChild(grafico.cloneNode(true));

        svgZonaHtml = svgModal.outerHTML;
        pontosGuia = []; 
        
        // Sincroniza o contador de passos e a letra da fila
        contadorPassos = passosPorZona[zonaSelecionada] || 0;
        const lugaresDestaZona = lugares.filter(l => l.zona === zonaSelecionada);
        if (lugaresDestaZona.length > 0) {
            const ultimaFila = [...lugaresDestaZona].sort((a,b) => a.step - b.step).pop()?.fila || 'A';
            nomeFila = String.fromCharCode(ultimaFila.charCodeAt(0) + 1);
        } else {
            nomeFila = 'A';
        }

        modalAberto = true;
    }

    function handleModalInteraction(event) {
        event.preventDefault();
        const svgOverlay = event.currentTarget;
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

    function processarFila(pontos) {
        if (pontos.length < 2 || !zonaSelecionada) return;
        const elementoZona = document.querySelector('.svg-background svg > *');
        const margens = elementoZona.getBBox();

        const p0 = pontos[0];
        const p2 = pontos[pontos.length - 1];
        let p1 = pontos.length === 3 
            ? { x: 2 * pontos[1].x - 0.5 * p0.x - 0.5 * p2.x, y: 2 * pontos[1].y - 0.5 * p0.y - 0.5 * p2.y }
            : { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 };

        const meuStep = (passosPorZona[zonaSelecionada] || 0) + 1;
        let filaTemporaria = [];

        for (let i = 0; i < qtdLugares; i++) {
            const t = qtdLugares > 1 ? i / (qtdLugares - 1) : 0.5;
            const xFinal = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
            const yFinal = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;

            if (xFinal < margens.x || xFinal > (margens.x + margens.width) || yFinal < margens.y || yFinal > (margens.y + margens.height)) break;

            filaTemporaria.push({
                x: xFinal, y: yFinal, zona: zonaSelecionada,
                fila: nomeFila, num: i + 1, id: Date.now() + i, step: meuStep
            });
        }

        if (filaTemporaria.length > 0) {
            lugares = [...lugares, ...filaTemporaria];
            passosPorZona[zonaSelecionada] = meuStep;
            contadorPassos = meuStep;
            ultimaCurva = pontos;
            nomeFila = String.fromCharCode(nomeFila.charCodeAt(0) + 1);
            pontosGuia = [];
        }
    }

    function carimbarFila() {
        if (ultimaCurva.length < 2) return;
        processarFila(ultimaCurva.map(p => ({ x: p.x, y: p.y + DISTANCIA_FILAS })));
    }

    function desfazer() {
        const stepAtual = passosPorZona[zonaSelecionada] || 0;
        if (stepAtual === 0) return;
        lugares = lugares.filter(l => !(l.zona === zonaSelecionada && l.step === stepAtual));
        passosPorZona[zonaSelecionada] = stepAtual - 1;
        contadorPassos = passosPorZona[zonaSelecionada];
        if (nomeFila !== 'A') nomeFila = String.fromCharCode(nomeFila.charCodeAt(0) - 1);
    }

    function fecharModal() {
        modalAberto = false;
        svgZonaHtml = '';
    }
</script>

<div class="admin-container">
    <aside class="sidebar">
        <h2>Gestor de Salas</h2>
        <div class="input-group">
            <label for="sala">Escolher Sala</label>
            <select id="sala" bind:value={salaSelecionada} on:change={carregarDadosSala}>
                <option value="">--- Selecionar ---</option>
                {#if data.salas}
                    {#each data.salas as s}
                        <option value={s.nome_sala}>{s.nome_sala}</option>
                    {/each}
                {/if}
            </select>
        </div>
        <button class="btn-new-room" on:click={() => goto('/admin/salas/adicionar_salas')}>+ Criar Nova Sala</button>
        <hr/>
        {#if lugares.length > 0}
            <div class="stats">
                <p>Lugares: <strong>{lugares.length}</strong></p>
                <form method="POST" action="?/guardarLugares" use:enhance>
                    <input type="hidden" name="lugares" value={JSON.stringify(lugares)} />
                    <input type="hidden" name="sala" value={salaSelecionada} />
                    <button type="submit" class="btn-save">Guardar Desenho</button>
                </form>
            </div>
        {/if}
    </aside>

    <main class="editor-main">
        {#if salaSelecionada}
            {@const salaAtiva = data.salas?.find(s => s.nome_sala === salaSelecionada)}
            <div class="canvas-view">
                <div class="svg-container" on:click={handleZonaClick} role="presentation">
                    {#if salaAtiva?.svg_code}
                        <div style="pointer-events: all;">{@html salaAtiva.svg_code}</div>
                    {/if}
                    <svg class="global-overlay" viewBox="0 0 595.28 841.89" style="position: absolute; inset: 0; pointer-events: none;">
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
                <h3>Edição: Zona</h3>
                <div class="zona-input-wrapper">
                    <label for="nome-zona">Nome:</label>
                    <input id="nome-zona" type="text" bind:value={zonaSelecionada} placeholder="Ex: Plateia A" />
                </div>
            </div>
            <div class="tools">
                <input type="number" bind:value={qtdLugares} />
                <button class="btn-gen" on:click={() => processarFila(pontosGuia)} disabled={pontosGuia.length < 2 || !zonaSelecionada}>Gerar</button>
                <button class="btn-stamp" on:click={carimbarFila} disabled={ultimaCurva.length === 0}>+ Fila</button>
                <button class="btn-undo" on:click={desfazer} disabled={contadorPassos === 0}>Desfazer</button>
            </div>
        </header>

        <div class="modal-scroll-area">
            <div class="modal-body">
                <div class="svg-layers">
                    <div class="svg-background">{@html svgZonaHtml}</div>
                    
                   <svg class="draw-overlay" viewBox={viewBoxAtiva} on:mousedown={handleModalInteraction} on:contextmenu|preventDefault role="application">
    
    {#if pontosGuia.length >= 2}
        {@const p0 = pontosGuia[0]}
        {@const p2 = pontosGuia[pontosGuia.length - 1]}
        {@const p1 = pontosGuia.length === 3 
            ? { x: 2 * pontosGuia[1].x - 0.5 * p0.x - 0.5 * p2.x, y: 2 * pontosGuia[1].y - 0.5 * p0.y - 0.5 * p2.y } 
            : { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 }
        }
        <path d="M {p0.x} {p0.y} Q {p1.x} {p1.y} {p2.x} {p2.y}" fill="none" stroke="#00d2ff" stroke-width="1.5" stroke-dasharray="4" opacity="0.6" />
    {/if}
    
    {#each pontosGuia as p}
        <circle cx={p.x} cy={p.y} r={RAIO_BOLA} fill="#00d2ff" stroke="#fff" stroke-width="1.5" />
    {/each}
    
    {#each lugares.filter(l => 
        zonaSelecionada && l.zona.toString().trim().toLowerCase() === zonaSelecionada.toString().trim().toLowerCase()
    ) as l}
        <g>
            <circle cx={l.x} cy={l.y} r={RAIO_BOLA} fill="#e94560" stroke="#fff" stroke-width="0.8" />
            <text 
                x={l.x} 
                y={l.y - (RAIO_BOLA + 2)} 
                font-size="6" 
                text-anchor="middle" 
                fill="#fff" 
                font-weight="bold" 
                class="seat-label"
            >
                {l.fila}{l.num}
            </text>
        </g>
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
    .canvas-view { background: #fff; padding: 20px; border-radius: 12px; width: 580px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .svg-container { position: relative; width: 100%; }
    .global-overlay { position: absolute; inset: 0; pointer-events: none; }
    .btn-new-room { width: 100%; background: #3b82f6; color: white; padding: 12px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; margin: 15px 0; }
    hr { border: 0; border-top: 1px solid #334155; margin: 20px 0; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(8px); }
    .modal { background: #1e293b; border-radius: 20px; width: 95%; max-width: 1100px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
    .modal-header { padding: 20px 30px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .zona-input-wrapper { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
    .zona-input-wrapper input { background: #0f172a; border: 1px solid #e94560; color: #fff; padding: 5px 10px; border-radius: 5px; width: 150px; }
    .modal-scroll-area { flex: 1; overflow-y: auto; padding: 20px; }
    .modal-body { position: relative; height: 600px; background: #fff; border-radius: 12px; overflow: hidden; }
    .svg-layers { position: relative; width: 100%; height: 100%; }
    .svg-background { position: absolute; inset: 0; z-index: 5; pointer-events: none; display: flex; justify-content: center; }
    .draw-overlay { position: absolute; inset: 0; z-index: 20; width: 100%; height: 100%; cursor: crosshair; }
    .btn-gen { background: #e94560; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
    .btn-stamp { background: #3b82f6; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .btn-undo { background: #f59e0b; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .btn-save { width: 100%; background: #10b981; color: white; padding: 12px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; margin-top: 15px; }
    .btn-close { width: 100%; background: #475569; color: #fff; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; }
    input[type="number"] { width: 70px; padding: 8px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 8px; }
    .seat-label { pointer-events: none; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }
</style>