<script lang="ts">
    // @ts-nocheck
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { user } from '$lib/userStore';
    import { enhance } from '$app/forms';

    let { data } = $props();

    // Estados Globais
    let salaSelecionada = $state('');
    let lugares = $state([]);
    let modalAberto = $state(false);
    let zonaAtiva = $state({ id: '', nome: '' });
    
    // Histórico de configurações técnicas por zona (Persistência Local)
    let configZonas = $state({}); 

    // Estado dos Inputs do Modal
    let config = $state({
        filas: 10,
        cols: 15,
        espacamento: 35,
        letraInicial: 'A',
        numInicial: 1
    });

    onMount(() => {
        if (!$user || $user.tipo !== 'admin') goto('/autenticacao/login');
    });

    function carregarDadosSala() {
        const sala = data.salas?.find(s => s.nome_sala === salaSelecionada);
        lugares = sala?.lugares_guardados || [];
        
        if (sala?.config_zonas) {
            configZonas = typeof sala.config_zonas === 'string' ? JSON.parse(sala.config_zonas) : sala.config_zonas;
        } else {
            configZonas = {};
        }
    }

    function selecionarZona(event) {
        const target = event.target.closest('path, polygon, rect');
        if (!target) return;

        const bbox = target.getBBox();
        // Gerar ID estável baseado na geometria se o SVG não tiver IDs
        const generatedId = target.id || `z-${Math.round(bbox.x)}-${Math.round(bbox.y)}`;
        
        // Tentar recuperar nome guardado, senão usa o padrão do SVG
        let nomeExistente = target.getAttribute('data-name') || target.id || 'Nova Zona';
        if (configZonas[generatedId]?.nome) {
            nomeExistente = configZonas[generatedId].nome;
        }

        zonaAtiva = {
            id: generatedId,
            nome: nomeExistente
        };

        // Carregar configurações técnicas se existirem
        if (configZonas[generatedId]) {
            config = { ...configZonas[generatedId] };
        } else {
            config = { filas: 10, cols: 15, espacamento: 35, letraInicial: 'A', numInicial: 1 };
        }

        modalAberto = true;
    }

    function gerarGrelhaNoBlueprint() {
        const novos = [];
        const offsetX = 100;
        const offsetY = 80;

        // Guardar logo a configuração e o nome atual no histórico
        configZonas[zonaAtiva.id] = { ...config, nome: zonaAtiva.nome };

        for (let f = 0; f < config.filas; f++) {
            const labelFila = String.fromCharCode(config.letraInicial.charCodeAt(0) + f);
            for (let c = 0; c < config.cols; c++) {
                novos.push({
                    id: Math.random(),
                    x: offsetX + (c * config.espacamento),
                    y: offsetY + (f * config.espacamento),
                    zona: zonaAtiva.id,
                    nomeZona: zonaAtiva.nome,
                    fila: labelFila,
                    num: config.numInicial + c,
                    visivel: true
                });
            }
        }
        
        const outrosLugares = lugares.filter(l => l.zona !== zonaAtiva.id);
        lugares = [...outrosLugares, ...novos];
    }

    function fecharESalvarZona() {
        // 1. Guardar snapshot final da técnica e do nome no histórico
        configZonas[zonaAtiva.id] = { ...config, nome: zonaAtiva.nome };
        
        // 2. Sincronizar o nome em todos os lugares desta zona
        lugares = lugares.map(l => {
            if (l.zona === zonaAtiva.id) {
                return { ...l, nomeZona: zonaAtiva.nome };
            }
            return l;
        });
        
        modalAberto = false;
    }

    function alternarVisibilidade(id) {
        lugares = lugares.map(l => l.id === id ? { ...l, visivel: !l.visivel } : l);
    }
</script>

<div class="admin-container">
    <aside class="sidebar">
        <h2>QuickSeat Admin</h2>
        
        <div class="field-group">
            <label>SALA ATIVA</label>
            <select bind:value={salaSelecionada} onchange={carregarDadosSala}>
                <option value="">--- Selecionar Sala ---</option>
                {#each data.salas as s}
                    <option value={s.nome_sala}>{s.nome_sala}</option>
                {/each}
            </select>
        </div>

        <button class="btn-create-room" onclick={() => goto('/admin/salas/adicionar_salas')}>
            + Criar Nova Sala
        </button>

        {#if salaSelecionada}
            <div class="action-box">
                <hr/>
                <div class="stats">
                    <p>Zonas Mapeadas: <strong>{Object.keys(configZonas).length}</strong></p>
                    <p>Cadeiras Ativas: <strong>{lugares.filter(l => l.visivel).length}</strong></p>
                </div>
                <form method="POST" action="?/guardarLugares" use:enhance>
                    <input type="hidden" name="lugares" value={JSON.stringify(lugares)} />
                    <input type="hidden" name="config_zonas" value={JSON.stringify(configZonas)} />
                    <input type="hidden" name="sala" value={salaSelecionada} />
                    <button type="submit" class="btn-save-all">💾 PUBLICAR MAPA FINAL</button>
                </form>
                <button class="btn-clear" onclick={() => { if(confirm('Limpar tudo?')) lugares = [] }}>Limpar Desenho</button>
            </div>
        {/if}
    </aside>

    <main class="viewport">
        {#if salaSelecionada}
            {@const s = data.salas.find(x => x.nome_sala === salaSelecionada)}
            <div class="macro-card">
                <p class="instruction">Clique numa zona para editar a planta técnica</p>
                <div class="svg-main" onclick={selecionarZona} aria-hidden="true">
                    {@html s.svg_code}
                </div>
            </div>
        {:else}
            <div class="empty-msg">Selecione uma sala no menu lateral.</div>
        {/if}
    </main>
</div>

{#if modalAberto}
    <div class="blueprint-overlay">
        <div class="blueprint-window">
            <header class="blueprint-header">
                <div class="title-edit">
                    <label>NOME DO SETOR / ZONA</label>
                    <input type="text" bind:value={zonaAtiva.nome} placeholder="Ex: Plateia A" />
                </div>
                <button class="close-x" onclick={() => modalAberto = false}>&times;</button>
            </header>

            <div class="blueprint-body">
                <aside class="blueprint-controls">
                    <div class="control-group">
                        <label>ESTRUTURA (F x C)</label>
                        <div class="input-row">
                            <input type="number" bind:value={config.filas} />
                            <input type="number" bind:value={config.cols} />
                        </div>
                    </div>

                    <div class="control-group">
                        <label>ESPAÇAMENTO</label>
                        <input type="number" bind:value={config.espacamento} />
                    </div>

                    <div class="control-group">
                        <label>SÉRIE INICIAL</label>
                        <div class="input-row">
                            <input type="text" bind:value={config.letraInicial} maxlength="1" />
                            <input type="number" bind:value={config.numInicial} />
                        </div>
                    </div>

                    <button class="btn-apply" onclick={gerarGrelhaNoBlueprint}>
                        {configZonas[zonaAtiva.id] ? 'REGERAR GRELHA' : 'GERAR GRELHA'}
                    </button>

                    <div class="divider"></div>

                    <button class="btn-confirm-zone" onclick={fecharESalvarZona}>
                        GUARDAR CONFIGURAÇÃO
                    </button>
                </aside>

                <section class="blueprint-canvas">
                    <div class="canvas-paper">
                        <svg width="100%" height="100%">
                            {#each Array(config.filas || 0) as _, f}
                                <text x="40" y={80 + (f * (config.espacamento || 0)) + 5} class="fixed-row-label">
                                    {String.fromCharCode((config.letraInicial || 'A').charCodeAt(0) + f)}
                                </text>
                            {/each}

                            {#each lugares.filter(l => l.zona === zonaAtiva.id) as lug}
                                <g onclick={() => alternarVisibilidade(lug.id)} class="seat-g">
                                    <circle 
                                        cx={lug.x} cy={lug.y} r="12" 
                                        fill={lug.visivel ? "#10b981" : "transparent"} 
                                        stroke={lug.visivel ? "#059669" : "#334155"}
                                        stroke-dasharray={lug.visivel ? "0" : "2"}
                                    />
                                    {#if lug.visivel}
                                        <text x={lug.x} y={lug.y + 4} class="seat-text">{lug.num}</text>
                                    {/if}
                                </g>
                            {/each}
                        </svg>
                    </div>
                </section>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(body) { margin: 0; background: #020617; color: white; font-family: 'Inter', sans-serif; }
    .admin-container { display: flex; height: 100vh; }
    
    .sidebar { width: 320px; background: #1e293b; padding: 2rem; border-right: 1px solid #334155; display: flex; flex-direction: column; }
    h2 { font-size: 1.4rem; color: #10b981; margin-bottom: 2rem; letter-spacing: -0.5px; }
    
    label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; display: block; }
    select, input { width: 100%; padding: 0.7rem; background: #020617; border: 1px solid #334155; color: white; border-radius: 8px; outline: none; }
    select:focus, input:focus { border-color: #3b82f6; }

    .btn-create-room { background: #3b82f6; color: white; border: none; padding: 0.8rem; border-radius: 8px; font-weight: bold; cursor: pointer; margin-bottom: 1rem; width: 100%; }
    .btn-save-all { background: #10b981; color: white; border: none; padding: 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 1rem; }
    .btn-clear { background: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 0.6rem; border-radius: 8px; cursor: pointer; width: 100%; margin-top: 10px; font-size: 0.8rem; }

    .viewport { flex: 1; display: flex; justify-content: center; align-items: center; background: #020617; }
    .macro-card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .instruction { color: #64748b; font-size: 0.8rem; text-align: center; margin-bottom: 1.5rem; }
    :global(.svg-main svg) { height: 65vh; width: auto; cursor: crosshair; }

    /* Modal Estúdio */
    .blueprint-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .blueprint-window { background: #0f172a; width: 95vw; height: 92vh; border-radius: 1rem; display: flex; flex-direction: column; border: 1px solid #334155; overflow: hidden; }
    .blueprint-header { padding: 1.5rem 2.5rem; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .title-edit input { background: #020617; width: 380px; font-size: 1.1rem; border-color: #3b82f6; color: #fff; }

    .blueprint-body { display: flex; flex: 1; overflow: hidden; }
    .blueprint-controls { width: 300px; padding: 2rem; background: #1e293b; border-right: 1px solid #334155; }
    .blueprint-canvas { flex: 1; padding: 2rem; background: #020617; display: flex; align-items: center; justify-content: center; }
    .canvas-paper { background: #0f172a; width: 100%; height: 100%; border-radius: 0.5rem; border: 1px solid #334155; overflow: auto; position: relative; box-shadow: inset 0 0 40px rgba(0,0,0,0.5); }

    .seat-g { cursor: pointer; }
    .seat-text { font-size: 10px; text-anchor: middle; fill: white; font-weight: bold; pointer-events: none; }
    .fixed-row-label { font-size: 14px; font-weight: 900; fill: #475569; text-anchor: middle; }

    .btn-apply { background: #3b82f6; color: white; width: 100%; padding: 0.8rem; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 1rem; }
    .btn-confirm-zone { background: #10b981; color: white; width: 100%; padding: 1.2rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 800; }
    
    .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .control-group { margin-bottom: 1.5rem; }
    .divider { height: 1px; background: #334155; margin: 1.5rem 0; }
    .close-x { font-size: 2.5rem; background: none; border: none; cursor: pointer; color: #94a3b8; }
    .empty-msg { color: #64748b; font-style: italic; }
</style>