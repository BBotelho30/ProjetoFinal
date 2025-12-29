<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount } from 'svelte';
    import { goto, invalidateAll } from '$app/navigation';
    import { enhance } from '$app/forms';

    export let data;
    $: ({ eventos = [], salas = [] } = data);

    let showModal = false;
    let eventoParaEditar = { sessoes: [] };
    let novaImagem = '';

    function abrirEdicao(evento) {
        eventoParaEditar = JSON.parse(JSON.stringify(evento));
        if (!eventoParaEditar.sessoes) eventoParaEditar.sessoes = [];
        novaImagem = eventoParaEditar.imagem_cartaz;
        showModal = true;
    }

    function adicionarSessao() {
        eventoParaEditar.sessoes = [
            ...eventoParaEditar.sessoes, 
            { id_sala: '', data_espectaculo: '', hora_inicio: '', duracao: '02:00' }
        ];
    }

    function removerSessao(index) {
        eventoParaEditar.sessoes = eventoParaEditar.sessoes.filter((_, i) => i !== index);
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => { novaImagem = event.target.result; };
            reader.readAsDataURL(file);
        }
    }

    function fecharModal() {
        showModal = false;
        eventoParaEditar = { sessoes: [] };
        novaImagem = '';
    }

    $: sessoesJSON = JSON.stringify(eventoParaEditar.sessoes);

    onMount(() => {
        if (!$user || $user.tipo !== 'admin') goto('/autenticacao/login');
    });
</script>

<main class="admin-dashboard">
    <div class="welcome-text">
        <h1>Lista de Espetáculos</h1>
        <a href="/admin/adiciona_espetaculo" class="btn-add-event">
            + Adicionar Espetáculo
        </a>
    </div>

    <div class="cards-grid">
        {#each eventos as evento}
            <div class="event-card">
                <div class="card-image" style="background-image: url('{evento.imagem_cartaz || 'https://via.placeholder.com/400x600?text=Sem+Imagem'}')">
                    <span class="type-tag">{evento.tipo_espectaculo}</span>
                </div>
                <div class="card-info">
                    <h3>{evento.nome_evento}</h3>
                    <p>{evento.descricao || 'Sem descrição.'}</p>
                    <div class="card-actions">
                        <button class="action-btn edit" on:click={() => abrirEdicao(evento)}>Editar</button>
                        <form method="POST" action="?/eliminar" use:enhance>
                            <input type="hidden" name="id" value={evento.id_eventos} />
                            <button type="submit" class="action-btn delete" on:click={(e) => {
                                if (!confirm(`Tem a certeza que deseja eliminar "${evento.nome_evento}"?`)) {
                                    e.preventDefault();
                                }
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
        <h2>Editar Espetáculo</h2>
        
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

            <div class="form-layout">
                <div class="image-column">
                    <div class="image-upload-modal">
                        {#if novaImagem}
                            <img src={novaImagem} alt="Preview" class="preview-img" />
                        {:else if eventoParaEditar.imagem_cartaz}
                            <img src={eventoParaEditar.imagem_cartaz} alt="Cartaz atual" class="preview-img" />
                        {:else}
                            <p>CARTAZ DO EVENTO</p>
                            <span class="plus-icon">+</span>
                        {/if}
                        <input type="file" accept="image/*" on:change={handleFileChange} class="file-input" />
                        <input type="hidden" name="nova-imagem" value={novaImagem} />
                    </div>
                    <small class="hint">Formatos: JPG, PNG ou WEBP</small>
                </div>

                <div class="fields-column">
                    <div class="input-group">
                        <label>Nome do Evento</label>
                        <input type="text" name="nome" bind:value={eventoParaEditar.nome_evento} required />
                    </div>

                    <div class="input-group">
                        <label>Descrição</label>
                        <textarea name="descricao" bind:value={eventoParaEditar.descricao} rows="2"></textarea>
                    </div>

                    <div class="sessions-editor-box">
                        <div class="sessions-header">
                            <label>Sessões Agendadas</label>
                            <button type="button" class="add-sess-btn" on:click={adicionarSessao}>+ Sessão</button>
                        </div>
                        <div class="sessions-list">
                            {#each eventoParaEditar.sessoes as sessao, i}
                                <div class="session-row">
                                    <select bind:value={sessao.id_sala} required>
                                        <option value="" disabled>Sala</option>
                                        {#each salas as sala}
                                            <option value={sala.id_sala}>{sala.nome_sala}</option>
                                        {/each}
                                    </select>
                                    <input type="date" bind:value={sessao.data_espectaculo} required />
                                    <input type="time" bind:value={sessao.hora_inicio} required />
                                    <input type="time" bind:value={sessao.duracao} title="Duração" required />
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
    /* TODOS OS TEUS ESTILOS ORIGINAIS RECUPERADOS */
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
    
    .modal-close { position: absolute; top: 15px; right: 20px; background: none; border: none; color: var(--text-light); font-size: 3.5em; cursor: pointer; }
    .form-layout { display: flex; gap: 40px; }
    .image-column { flex: 0 0 260px; }
    .image-upload-modal { 
        width: 100%; height: 350px; border: 2px dashed var(--secondary-color);
        display: flex; align-items: center; justify-content: center; position: relative; border-radius: 10px;
    }
    .preview-img { width: 100%; height: 100%; object-fit: contain; }
    .file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

    /* ESTILO NOVO PARA SESSÕES INTEGRADO */
    .sessions-editor-box {
        background: rgba(0,0,0,0.2); border: 1px solid var(--border-color);
        padding: 15px; border-radius: 10px; margin-top: 10px;
    }
    .sessions-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .add-sess-btn { background: var(--primary-color); border: 1px solid var(--secondary-color); color: white; padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8em; }
    
    .sessions-list { max-height: 140px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
    .session-row { display: grid; grid-template-columns: 1.5fr 1.5fr 1fr 1fr auto; gap: 8px; align-items: center; }
    .session-row select, .session-row input { background: #16162d; border: 1px solid var(--border-color); color: white; padding: 6px; border-radius: 5px; font-size: 0.85em; }
    .del-sess-btn { background: var(--secondary-color); border: none; color: white; border-radius: 5px; cursor: pointer; padding: 2px 8px; }

    .btn-save { 
        width: 100%; background: var(--secondary-color); color: #1a1a2e; border: none; 
        padding: 18px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.2em; margin-top: 20px;
    }
    
    .fields-column { flex: 1; display: flex; flex-direction: column; gap: 15px; }
    .input-group { display: flex; flex-direction: column; gap: 5px; }
    .input-group input, .input-group textarea { background: #16162d; border: 1px solid var(--border-color); color: white; padding: 12px; border-radius: 8px; }
</style>