<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { user } from '$lib/userStore';

import SalaCinema from '$lib/components/SalaCinema.svelte';
import SalaPequena from '$lib/components/SalaPequena.svelte';
import SalaGrande from '$lib/components/SalaGrande.svelte';

let salaSelecionada = '';
let svgContainer: HTMLDivElement;

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
    if (!currentUser || currentUser.tipo !== 'admin') goto('/login');
});

const zonasMap: Record<string, string> = {
  'cls-1': 'D', 'cls-2': 'A', 'cls-3': 'B', 'cls-4': 'E',
  'cls-5': 'F', 'cls-6': 'G', 'cls-8': 'H', 'cls-9': 'C',
};

function handleZonaClick(event: MouseEvent) {
    const target = event.target as SVGElement;
    if (!target || !target.classList) return;
    const classeZona = Array.from(target.classList).find(c => zonasMap[c]);
    if (!classeZona) return;

    zonaSelecionada = zonasMap[classeZona];
    const grafico = (target instanceof SVGGraphicsElement) ? target : target.querySelector<SVGGraphicsElement>('path, rect, circle');
    if (!grafico) return;

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
    const svgOverlay = document.querySelector('.draw-overlay') as SVGSVGElement;
    if (!svgOverlay) return;

    const pt = svgOverlay.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    const cursorPt = pt.matrixTransform(svgOverlay.getScreenCTM()?.inverse());
    if (!cursorPt) return;

    if (event.button === 0) { 
        if (pontosGuia.length < 3) pontosGuia = [...pontosGuia, { x: cursorPt.x, y: cursorPt.y }];
    } else {
        pontosGuia = [];
    }
}

function calcularPontoExato(t: number, p0: Ponto, p1: Ponto, p2: Ponto) {
    const cpX = 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x;
    const cpY = 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y;
    return {
        x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * cpX + t ** 2 * p2.x,
        y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * cpY + t ** 2 * p2.y
    };
}

function processarFila(pontos: Ponto[]) {
    if (pontos.length < 2) return;
    const p0 = pontos[0];
    const p2 = pontos[pontos.length - 1];
    const p1 = pontos.length === 3 ? pontos[1] : { x: (p0.x + p2.x)/2, y: (p0.y + p2.y)/2 };

    contadorPassos++; 
    let novosLugares = [];
    for (let i = 0; i < qtdLugares; i++) {
        const t = i / (qtdLugares - 1);
        const pos = calcularPontoExato(t, p0, p1, p2);
        novosLugares.push({ 
            x: pos.x, y: pos.y, 
            zona: zonaSelecionada, fila: nomeFila, num: i+1, 
            id: Date.now() + i, step: contadorPassos 
        });
    }
    lugares = [...lugares, ...novosLugares];
    ultimaCurva = [...pontos]; 
    pontosGuia = [];
    nomeFila = String.fromCharCode(nomeFila.charCodeAt(0) + 1);
}

function carimbarFila() {
    if (ultimaCurva.length < 2) return;
    const desvioY = 20; 
    const novaCurva = ultimaCurva.map(p => ({ x: p.x, y: p.y + desvioY }));
    processarFila(novaCurva);
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
        <div class="sidebar-header"><h2>Gestor de Salas</h2></div>
        <select bind:value={salaSelecionada} on:change={() => lugares = []}>
            <option value="">--- Selecionar Sala ---</option>
            <option value="cinema">Cinema</option>
            <option value="grande">Grande</option>
            <option value="pequena">Pequena</option>
        </select>
        {#if lugares.length > 0}
            <div class="stats">Assentos: <strong>{lugares.length}</strong></div>
            <button class="btn-save" on:click={() => console.log(lugares)}>Guardar Tudo</button>
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
                            <circle cx={l.x} cy={l.y} r="2.5" fill="white" stroke="#000" />
                        {/each}
                    </svg>
                </div>
            </div>
        {/if}
    </main>
</div>

{#if modalAberto}
<div class="modal-backdrop" on:click={fecharModal}>
    <div class="modal" on:click|stopPropagation>
        <header>
            <div class="info">
                <h3>Zona {zonaSelecionada} | Fila {nomeFila}</h3>
                <p>Os lugares serão numerados como {nomeFila}1, {nomeFila}2...</p>
            </div>
            <div class="tools">
                <input type="number" bind:value={qtdLugares} />
                <button class="btn-gen" on:click={() => processarFila(pontosGuia)} disabled={pontosGuia.length < 2}>Gerar</button>
                <button class="btn-stamp" on:click={carimbarFila} disabled={ultimaCurva.length === 0}>+ Carimbar</button>
                <button class="btn-undo" on:click={desfazer} disabled={contadorPassos === 0}>↺ Desfazer</button>
            </div>
        </header>

        <div class="modal-body">
            <div class="svg-layers" on:mousedown={handleModalInteraction} on:contextmenu|preventDefault>
                <div class="svg-background">{@html svgZonaHtml}</div>
                
                <svg class="draw-overlay" viewBox={viewBoxAtiva} preserveAspectRatio="xMidYMid meet">
                    {#if pontosGuia.length >= 2}
                        <path d="M {pontosGuia[0].x} {pontosGuia[0].y} Q {pontosGuia.length === 3 ? (2 * pontosGuia[1].x - 0.5 * pontosGuia[0].x - 0.5 * pontosGuia[2].x) : (pontosGuia[0].x + pontosGuia[1].x)/2} {pontosGuia.length === 3 ? (2 * pontosGuia[1].y - 0.5 * pontosGuia[0].y - 0.5 * pontosGuia[2].y) : (pontosGuia[0].y + pontosGuia[1].y)/2} {pontosGuia[pontosGuia.length-1].x} {pontosGuia[pontosGuia.length-1].y}" 
                              fill="none" stroke="#e94560" stroke-width="2" stroke-dasharray="3" />
                    {/if}
                    
                    {#each pontosGuia as p}
                        <circle cx={p.x} cy={p.y} r={RAIO_BOLA} fill="#00d2ff" stroke="#fff" stroke-width="1" />
                    {/each}
                    
                    {#each lugares.filter(l => l.zona === zonaSelecionada) as l}
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
        <button class="btn-close" on:click={fecharModal}>Concluir e Voltar</button>
    </div>
</div>
{/if}

<style>
.admin-container { display: flex; height: 100vh; background: #0f172a; color: #f8fafc; font-family: system-ui; }
.sidebar { width: 300px; background: #1e293b; padding: 25px; border-right: 1px solid #334155; }
.editor-main { flex: 1; display: flex; justify-content: center; align-items: center; background: #020617; overflow: auto; }
.canvas-view { background: #fff; padding: 15px; border-radius: 8px; cursor: crosshair; width: 550px; }
.svg-container { position: relative; width: 100%; }
.global-overlay { position: absolute; inset: 0; pointer-events: none; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal { background: #1e293b; padding: 25px; border-radius: 16px; width: 95%; max-width: 1000px; color: #fff; }
.modal-body { position: relative; height: 550px; background: #fff; border-radius: 12px; margin: 20px 0; overflow: hidden; }

.svg-layers { position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; cursor: crosshair; }
.svg-background, .draw-overlay { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; }
:global(.svg-background svg) { width: auto; height: 100%; max-width: 100%; display: block; margin: 0 auto; }
.draw-overlay { width: auto; height: 100%; z-index: 10; pointer-events: all; margin: 0 auto; }

.seat-label {
    pointer-events: none;
    text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
    user-select: none;
}

.btn-gen { background: #e94560; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.btn-stamp { background: #3b82f6; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.btn-undo { background: #f59e0b; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.btn-close { width: 100%; background: #334155; color: #fff; border: none; padding: 12px; border-radius: 8px; cursor: pointer; }
.btn-save { width: 100%; background: #10b981; border: none; padding: 12px; border-radius: 8px; color: white; margin-top: 15px; cursor: pointer; }
input { width: 55px; padding: 8px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 6px; }
</style>