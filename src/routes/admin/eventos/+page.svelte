<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount, tick } from 'svelte';
    import { goto, invalidateAll } from '$app/navigation';
    import { enhance } from '$app/forms';

    // Svelte 5: Receber props
    let { data, form = $bindable() } = $props();

    // Estados Reativos ($state)
    let filtroTipo = $state("Todos");
    let filtroSala = $state("Todas");
    let filtroData = $state("");
    let pesquisa = $state("");
    
    let showModal = $state(false);
    let zonasPorSala = $state({}); 
    let eventoParaEditar = $state({ sessoes: [] });
    let novaImagem = $state('');

    // Valores Derivados ($derived)
    const eventos = $derived(data?.eventos || []);
    const salas = $derived(data?.salas || []);
    
    const tiposExistentes = $derived([...new Set(
        eventos.map(e => e.tipo_espectaculo?.toLowerCase()).filter(Boolean)
    )]);

    const salasExistentes = $derived(salas.map(s => s.nome_sala));

    const eventosFiltrados = $derived(eventos.filter(e => {
        const correspondeTipo = filtroTipo === "Todos" || e.tipo_espectaculo?.toLowerCase() === filtroTipo.toLowerCase();
        const correspondeNome = e.nome_evento.toLowerCase().includes(pesquisa.toLowerCase());
        const correspondeSala = filtroSala === "Todas" || e.sessoes?.some(s => s.nome_sala === filtroSala);
        const correspondeData = !filtroData || e.sessoes?.some(s => s.data_espectaculo?.startsWith(filtroData));
        return correspondeTipo && correspondeNome && correspondeSala && correspondeData;
    }));

    const sessoesJSON = $derived(JSON.stringify(eventoParaEditar.sessoes));

    // Funções
    async function abrirEdicao(evento) {
        const copia = JSON.parse(JSON.stringify(evento));
        copia.sessoes = (copia.sessoes || []).map(s => ({
            ...s,
            data_espectaculo: s.data_espectaculo ? s.data_espectaculo.split('T')[0] : '',
            precos: s.precos || {}
        }));
        
        eventoParaEditar = copia;
        novaImagem = eventoParaEditar.imagem_cartaz || '';
        showModal = true;

        // Carregar zonas para as sessões existentes no modal
        for (let i = 0; i < eventoParaEditar.sessoes.length; i++) {
            if (eventoParaEditar.sessoes[i].id_sala) {
                await carregarZonasEdicao(eventoParaEditar.sessoes[i].id_sala, i);
            }
        }
    }

    async function carregarZonasEdicao(id_sala, indexSessao) {
        if (!id_sala) return;
        try {
            const res = await fetch(`/api/zonas/${id_sala}`);
            const zonas = await res.json();
            zonasPorSala[id_sala] = zonas;

            if (!eventoParaEditar.sessoes[indexSessao].precos) {
                eventoParaEditar.sessoes[indexSessao].precos = {};
            }

            zonas.forEach(z => {
                if (eventoParaEditar.sessoes[indexSessao].precos[z.id_zona] === undefined) {
                    eventoParaEditar.sessoes[indexSessao].precos[z.id_zona] = 0;
                }
            });
        } catch (err) {
            console.error("Erro ao carregar zonas:", err);
        }
    }

    function fecharModal() {
        showModal = false;
        eventoParaEditar = { sessoes: [] };
        novaImagem = '';
    }

    function adicionarSessao() {
        eventoParaEditar.sessoes.push({ 
            id_sala: '', data_espectaculo: '', hora_inicio: '', 
            duracao: '01:30' , limite_bilhetes: 10, precos: {} 
        });
    }

    function removerSessao(index) {
        eventoParaEditar.sessoes.splice(index, 1);
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => { novaImagem = ev.target.result; };
            reader.readAsDataURL(file);
        }
    }

    const formatarTexto = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();

    onMount(() => {
        if (!$user || $user.tipo !== 'admin') goto('/autenticacao/login');
    });
</script>

<main class="admin-dashboard">
    <div class="welcome-text">
        <h1>Lista de Espetáculos</h1>
        <div class="add-button-wrapper">
            <a href="/admin/adiciona_espetaculo" class="btn-add-event">+ Adicionar Espetáculo</a>
        </div>
    </div>
        
    <div class="filter-wrapper">
        <div class="filter-bar">
            <select bind:value={filtroTipo}>
                <option value="Todos">Todos os tipos</option>
                {#each tiposExistentes as tipo}
                    <option value={tipo}>{formatarTexto(tipo)}</option>
                {/each}
            </select>
            <select bind:value={filtroSala}>
                <option value="Todas">Todas as salas</option>
                {#each salasExistentes as sala}
                    <option value={sala}>{sala}</option>
                {/each}
            </select>

            <div class="date-picker-wrapper">
                <input id="filtro-data" type="date" bind:value={filtroData} class="date-input" />
                <button type="button" class="date-icon-btn" onclick={() => document.getElementById('filtro-data').showPicker?.()}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M7 2v2H5a2 2 0 0 0-2 2v2h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm14 8H3v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10zm-11 3h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 0h2v2H6v-2z"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="search-bar">
            <input type="text" placeholder="PESQUISAR EVENTO..." bind:value={pesquisa} />
        </div>
    </div>

    <div class="cards-grid">
        {#each eventosFiltrados as evento}
            <div class="event-card">
                <div class="card-image" style="background-image: url('{evento.imagem_cartaz || ''}')">
                    <span class="type-tag">{evento.tipo_espectaculo}</span>
                </div>
                <div class="card-info">
                    <h3>{evento.nome_evento}</h3>
                    <div class="card-actions">
                        <button class="action-btn edit" onclick={() => abrirEdicao(evento)}>Editar</button>
                        <form method="POST" action="?/eliminar" use:enhance>
                            <input type="hidden" name="id" value={evento.id_eventos} />
                            <button type="submit" class="action-btn delete" onclick={(e) => { if(!confirm('Deseja eliminar?')) e.preventDefault(); }}>Eliminar</button>
                        </form>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</main>

{#if showModal}
<div class="modal-overlay">
    <div class="modal-content">
        <button class="modal-close" onclick={fecharModal}>&times;</button>
        <h2>Editar: {eventoParaEditar.nome_evento}</h2>
        
        <form method="POST" action="?/editar" enctype="multipart/form-data" use:enhance={() => {
            return async ({ result }) => {
                if (result.type === 'success') {
                    await invalidateAll();
                    fecharModal();
                }
            };
        }}>
            <input type="hidden" name="id" value={eventoParaEditar.id_eventos} />
            <input type="hidden" name="sessoes_data" value={sessoesJSON} />
            <input type="hidden" name="imagem_atual" value={eventoParaEditar.imagem_cartaz} />

            <div class="form-layout">
                <div class="image-column">
                    <div class="image-upload-modal" style="background-image: url({novaImagem}); background-size: cover; background-position: center;">
                        <input type="file" name="imagem_ficheiro" accept="image/*" onchange={handleFileChange} class="file-input" />
                    </div>
                </div>

                <div class="fields-column">
                    <div class="input-group">
                        <label>Nome</label>
                        <input type="text" name="nome" bind:value={eventoParaEditar.nome_evento} required />
                    </div>

                    <div class="input-group">
                        <label>Descrição</label>
                        <textarea name="descricao" bind:value={eventoParaEditar.descricao} rows="2"></textarea>
                    </div>

                    <div class="sessions-editor-box">
                        <div class="sessions-header">
                            <label>Sessões & Preços</label>
                            <button type="button" class="add-sess-btn" onclick={adicionarSessao}>+ Sessão</button>
                        </div>
                            <div class="sessions-list">
                                {#each eventoParaEditar.sessoes as sessao, i}
                                    <div class="session-card-edit">
                                        <div class="session-row">
                                            <select bind:value={sessao.id_sala} onchange={() => carregarZonasEdicao(sessao.id_sala, i)} required>
                                                <option value="" disabled>Selecionar Sala</option>
                                                {#each salas as s}
                                                    <option value={s.id_sala}>{s.nome_sala}</option>
                                                {/each}
                                            </select>
                                            <input type="date" bind:value={sessao.data_espectaculo} required />
                                            <input type="time" bind:value={sessao.hora_inicio} required />
                                            <button type="button" class="del-sess-btn" onclick={() => removerSessao(i)}>&times;</button>
                                        </div>
                                            {#if sessao.id_sala && zonasPorSala[sessao.id_sala]}
                                                <div class="modal-price-grid">
                                                    <span class="price-title-label">Preços por Setor:</span>
                                                    {#each zonasPorSala[sessao.id_sala] as zona}
                                                        <div class="zone-input-mini">
                                                            <label>{zona.nome_zona}</label>
                                                            <div class="currency-wrapper">
                                                                <input 
                                                                    type="number" 
                                                                    step="0.01" 
                                                                    bind:value={eventoParaEditar.sessoes[i].precos[zona.id_zona]} 
                                                                />
                                                                <span class="euro-badge">€</span>
                                                            </div>
                                                        </div>
                                                    {/each}
                                                </div>
                                            {/if}
                                    </div>
                                {/each}
                            </div>
                    </div>
                    <button type="submit" class="btn-save">Guardar Alterações</button>
                </div>
            </div>
        </form>
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
        --border-color: #3f3f5f;
        --accent-green: #10b981;
    }
    
    /* Layout Principal */
    .admin-dashboard { 
        padding: 40px 60px; 
        min-height: 100vh; 
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color)); 
    }
    
    .welcome-text { text-align: center; margin-bottom: 50px; color: white; }
    
    .btn-add-event {
        display: inline-flex; align-items: center; justify-content: center; gap: 10px;
        background: var(--secondary-color); color: #1a1a2e; padding: 15px 30px;
        border-radius: 30px; text-decoration: none; font-size: 1.2em; font-weight: bold; transition: 0.3s;
    }
    .btn-add-event:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(255, 0, 0, 0.4); }
    
    /* Filtros e Pesquisa */
    .filter-wrapper {
        max-width: 1200px;
        margin: 0 auto 40px auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
    }

    .filter-bar { display: flex; align-items: center; gap: 15px; }

    .filter-bar select, .search-bar input, .date-input {
        background: var(--background-dark);
        color: white;
        border: 2px solid var(--secondary-color);
        border-radius: 8px;
        font-weight: bold;
        outline: none;
        height: 44px;
        padding: 0 15px;
        transition: 0.3s;
    }

    .search-bar { position: relative; }
    .search-bar input { width: 250px; padding-right: 40px; }

    .date-picker-wrapper { position: relative; }
    .date-icon-btn {
        position: absolute; right: 10px; top: 50%;
        transform: translateY(-50%); background: none;
        border: none; color: white; cursor: pointer;
    }

    /* Grid de Cards */
    .cards-grid { 
        display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
        gap: 40px; max-width: 1200px; margin: 0 auto; 
    }
    
    .event-card { 
        background: var(--card-bg); border-radius: 20px; overflow: hidden; 
        box-shadow: 0 10px 20px rgba(0,0,0,0.3); display: flex; flex-direction: column; 
    }
    
    .card-image { height: 390px; background-size: cover; background-position: center; position: relative; }
    
    .type-tag { 
        position: absolute; top: 15px; right: 15px; background: var(--secondary-color); 
        color: #1a1a2e; padding: 5px 12px; border-radius: 50px; font-size: 1em; font-weight: bold; 
    }
    
    .card-info { padding: 15px; color: white; flex-grow: 1; }
    .card-actions { display: flex; gap: 10px; margin-top: 15px; }
    
    .action-btn { width: 100%; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: 0.3s; background: transparent; }
    .action-btn.edit { border: 1px solid #666; color: #666; }
    .action-btn.delete { border: 1px solid var(--secondary-color); color: var(--secondary-color); }

    /* MODAL */
    .modal-overlay { 
        position: fixed; inset: 0; background: rgba(0,0,0,0.85); 
        display: flex; justify-content: center; align-items: center; z-index: 2000; backdrop-filter: blur(4px); 
    }
    
    .modal-content { 
        background: var(--card-bg); padding: 30px 40px; border-radius: 20px; 
        width: 90%; max-width: 950px; color: white; position: relative;
    }
    
    .modal-close { 
        position: absolute; top: 15px; right: 20px; background: none; 
        border: none; color: var(--text-light); font-size: 3.5em; cursor: pointer; transition: 0.3s;
    }
    .modal-close:hover { color: var(--secondary-color); transform: rotate(90deg); }
    
    .form-layout { display: flex; gap: 40px; }
    .image-column { flex: 0 0 260px; }
    .image-upload-modal { 
        width: 100%; height: 350px; border: 2px dashed var(--secondary-color);
        display: flex; align-items: center; justify-content: center; position: relative; border-radius: 10px;
    }
    
    .fields-column { flex: 1; display: flex; flex-direction: column; gap: 15px; }
    .input-group input, .input-group textarea { 
        background: #16162d; border: 1px solid var(--border-color); 
        color: white; padding: 12px; border-radius: 8px; width: 100%;
    }

    /* Sessões no Modal */
    .sessions-editor-box {
        background: rgba(0,0,0,0.2); border: 1px solid var(--border-color);
        padding: 15px; border-radius: 10px; margin-top: 10px;
    }

    .sessions-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .sessions-list { max-height: 300px; overflow-y: auto; padding-right: 10px; }

    .session-edit-card {
        background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color);
        border-radius: 12px; padding: 18px; margin-bottom: 15px;
    }

    .session-row { 
        display: grid; grid-template-columns: 1.5fr 1.5fr 1fr auto; 
        gap: 10px; align-items: center; 
    }

    .session-row select, .session-row input { 
        background: #16162d; border: 1px solid var(--border-color); 
        color: white; padding: 8px; border-radius: 5px; 
    }

    .del-sess-btn { background: var(--secondary-color); border: none; color: white; border-radius: 5px; cursor: pointer; padding: 5px 10px; font-weight: bold; }

    /* Grid de Preços */
    .modal-price-grid {
        margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border-color);
        display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px;
    }

    .price-title-label { color: var(--secondary-color); font-size: 0.8rem; font-weight: bold; grid-column: 1 / -1; margin-bottom: 5px; }

    .zone-input-mini { display: flex; flex-direction: column; gap: 5px; }
    .zone-input-mini label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

    .currency-wrapper {
        display: flex; align-items: center; background: #0a0a1a;
        border: 1px solid var(--border-color); border-radius: 8px; padding-right: 10px;
    }
    .currency-wrapper:focus-within { border-color: var(--accent-green); }

    .currency-wrapper input {
        width: 100%; background: transparent !important; border: none !important;
        padding: 8px !important; color: white !important; font-size: 0.9rem;
    }

    .euro-badge { color: var(--accent-green); font-weight: 800; font-size: 0.9rem; }

    .btn-save { 
        width: 100%; background: var(--secondary-color); color: #1a1a2e; 
        border: none; padding: 18px; border-radius: 8px; cursor: pointer; 
        font-weight: bold; font-size: 1.2em; margin-top: 20px;
    }

    /* Scrollbar */
    .sessions-list::-webkit-scrollbar { width: 6px; }
    .sessions-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }

    /* Calendar Icons */
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(1) brightness(0.8); cursor: pointer;
    }
</style>