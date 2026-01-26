<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount, tick } from 'svelte';
    import { goto, invalidateAll } from '$app/navigation';
    import { enhance } from '$app/forms';

    export let data;
    $: eventos = data?.eventos || [];
    $: salas = data?.salas || [];

    let showModal = false;
    let eventoParaEditar = { sessoes: [] };
    let novaImagem = '';

    async function abrirEdicao(evento) {
        const copia = JSON.parse(JSON.stringify(evento));
        copia.sessoes = (copia.sessoes || []).map(s => ({
            ...s,
            data_espectaculo: s.data_espectaculo ? s.data_espectaculo.split('T')[0] : ''
        }));
        eventoParaEditar = copia;
        novaImagem = eventoParaEditar.imagem_cartaz || '';
        showModal = true;
        await tick();
    }

    function fecharModal() {
        showModal = false;
        eventoParaEditar = { sessoes: [] };
        novaImagem = '';
    }

    function adicionarSessao() {
        eventoParaEditar.sessoes = [
            ...eventoParaEditar.sessoes, 
            { id_sala: '', data_espectaculo: '', hora_inicio: '', duracao: '01:30' , limite_bilhetes: 10 }
        ];
    }

    function removerSessao(index) {
        eventoParaEditar.sessoes = eventoParaEditar.sessoes.filter((_, i) => i !== index);
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => { novaImagem = ev.target.result; };
            reader.readAsDataURL(file);
        }
    }

    $: sessoesJSON = JSON.stringify(eventoParaEditar.sessoes);

    onMount(() => {
        if (!$user || $user.tipo !== 'admin') goto('/autenticacao/login');
    });
</script>

<main class="admin-dashboard">
    <div class="welcome-text">
        <h1>Lista de Espetáculos</h1>
        <a href="/admin/adiciona_espetaculo" class="btn-add-event">+ Adicionar Espetáculo</a>
    </div>

    <div class="cards-grid">
        {#each eventos as evento}
            <div class="event-card">
                <div class="card-image" style="background-image: url('{evento.imagem_cartaz || ''}')">
                    <span class="type-tag">{evento.tipo_espectaculo}</span>
                </div>
                <div class="card-info">
                    <h3>{evento.nome_evento}</h3>
                    <div class="card-actions">
                        <button class="action-btn edit" on:click={() => abrirEdicao(evento)}>Editar</button>
                        <form method="POST" action="?/eliminar" use:enhance>
                            <input type="hidden" name="id" value={evento.id_eventos} />
                            <button type="submit" class="action-btn delete" on:click={(e) => {
                                if(!confirm('Deseja eliminar este evento?')) e.preventDefault();
                            }}>Eliminar</button>
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
        <button class="modal-close" on:click={fecharModal}>&times;</button>
        <h2>Editar: {eventoParaEditar.nome_evento}</h2>
        
        <form method="POST" action="?/editar" use:enhance={() => {
            return async ({ result }) => {
                if (result.type === 'success') {
                    await invalidateAll();
                    fecharModal();
                }
            };
        }}>
            <input type="hidden" name="id" value={eventoParaEditar.id_eventos} />
            <input type="hidden" name="sessoes_data" value={sessoesJSON} />
            <input type="hidden" name="nova-imagem" value={novaImagem} />

            <div class="form-layout">
                <div class="image-column">
                    <div class="image-upload-modal" style="background-image: url({novaImagem}); background-size: cover; background-position: center;">
                        {#if !novaImagem}<p>ALTERAR CARTAZ</p>{/if}
                        <input type="file" accept="image/*" on:change={handleFileChange} class="file-input" />
                    </div>
                </div>

                <div class="fields-column">
                    <div class="input-group">
                        <label for="edit-nome">Nome</label>
                        <input id="edit-nome" type="text" name="nome" bind:value={eventoParaEditar.nome_evento} required />
                    </div>

                    <div class="input-group">
                        <label for="edit-descricao">Descrição</label>
                        <textarea id="edit-descricao" name="descricao" bind:value={eventoParaEditar.descricao} rows="2"></textarea>
                    </div>

                    <div class="input-group">
                        <label for="edit-tipo">Tipo de Espetáculo</label>
                        <input id="edit-tipo" type="text" name="tipo" bind:value={eventoParaEditar.tipo_espectaculo} placeholder="Cinema, Teatro..." />
                    </div>
                    
                    <div class="sessions-editor-box">
                        <div class="sessions-header">
                            <label>Sessões</label>
                            <button type="button" class="add-sess-btn" on:click={adicionarSessao}>+ Nova Sessão</button>
                        </div>
                        <div class="sessions-list">
                            {#each eventoParaEditar.sessoes as sessao, i}
                                <div class="session-row">
                                    <select bind:value={sessao.id_sala} required>
                                        {#each salas as sala}
                                            <option value={sala.id_sala}>{sala.nome_sala}</option>
                                        {/each}
                                    </select>
                                    <input type="date" bind:value={sessao.data_espectaculo} required />
                                    <input type="time" bind:value={sessao.hora_inicio} required />
                                    <input type="time" bind:value={sessao.duracao} title="Duração" required />
                                    <input type="number" bind:value={sessao.limite_bilhetes} min="1"  max = "10" title="Limite por compra"  required />
                                    <button type="button" class="del-sess-btn" on:click={() => removerSessao(i)}>&times;</button>
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
    }
    
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
    
    .card-info { padding: 15px; color: white; flex-grow: 1; display: flex; flex-direction: column; }
    .card-info h3 { margin: 0 0 8px 0; font-size: 1.5em; }
    .card-info p { color: var(--text-muted); font-size: 0.9em; margin-bottom: 12px; }
    
    .card-actions { display: flex; gap: 10px; align-items: center; }
    .action-btn { width: 100%; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: 0.3s; }
    .action-btn.edit { background: transparent; border: 1px solid #666; color: #666; }
    .action-btn.delete { background: transparent; border: 1px solid #ff0000; color: #ff0000; }

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
        position: absolute; 
        top: 15px; 
        right: 20px; 
        background: none; 
        border: none; 
        color: var(--text-light); 
        font-size: 3.5em; 
        cursor: pointer;
        transition: 0.3s ease;
    }
    
    .modal-close:hover {
        color: var(--secondary-color);
        transform: rotate(90deg);
    }
    
    
    .form-layout { display: flex; gap: 40px; }
    .image-column { flex: 0 0 260px; }
    .image-upload-modal { 
        width: 100%; height: 350px; border: 2px dashed var(--secondary-color);
        display: flex; align-items: center; justify-content: center; position: relative; border-radius: 10px;
    }
    .preview-img { width: 100%; height: 100%; object-fit: contain; }
    .file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

    .sessions-editor-box {
        background: rgba(0,0,0,0.2); 
        border: 1px solid var(--border-color);
        padding: 15px; 
        border-radius: 10px; 
        margin-top: 10px;
    }
    .sessions-header { 
        display: flex; 
        justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .add-sess-btn {  background: none;
        border: 1px solid var(--accent);
        color: var(--accent);
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
    }

    .sessions-list { max-height: 140px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
    .session-row { 
    display: grid; 
    grid-template-columns: 1.5fr 1.5fr 1fr 1fr 0.8fr auto; 
    gap: 8px; 
    align-items: center; 
}
    .session-row select, .session-row input { background: #16162d; border: 1px solid var(--border-color); color: white; padding: 6px; border-radius: 5px; font-size: 0.85em; }
    .del-sess-btn { background: var(--secondary-color); border: none; color: var(--background-dark); border-radius: 5px; cursor: pointer; padding: 1.2px 8px; font-size: 1.45em; font-weight: bold; }

    .btn-save { 
        width: 100%; background: var(--secondary-color); color: #1a1a2e; border: none; 
        padding: 18px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.2em; margin-top: 20px;
    }
    
    .fields-column { flex: 1; display: flex; flex-direction: column; gap: 15px; }
    .input-group { display: flex; flex-direction: column; gap: 5px; }
    .input-group input, .input-group textarea { background: #16162d; border: 1px solid var(--border-color); color: white; padding: 12px; border-radius: 8px; }
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(1) brightness(0.8);
    cursor: pointer;
}


</style>