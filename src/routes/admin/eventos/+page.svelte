<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount } from 'svelte';
    import { goto, invalidateAll } from '$app/navigation';
    import { enhance } from '$app/forms';

    export let data;
    $: ({ eventos } = data);

    let showModal = false;
    let eventoParaEditar = {};
    let novaImagem = ''; // Guarda a imagem selecionada

    function abrirEdicao(evento) {
        eventoParaEditar = { ...evento };
        novaImagem = evento.imagem_cartaz; // Mostra a atual por defeito
        showModal = true;
    }

    // Função para ler o ficheiro do PC e gerar a pré-visualização
    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                novaImagem = event.target.result; // Converte para Base64
            };
            reader.readAsDataURL(file);
        }
    }

    function fecharModal() {
        showModal = false;
        eventoParaEditar = {};
        novaImagem = '';
    }

    onMount(() => {
        if (!$user || $user.tipo !== 'admin') goto('/login');
    });

    function logout() {
        user.set(null);
        goto('/');
    }
</script>

<header class="header">
    <div class="logo">QuickSeat</div>
    <nav class="nav">
        <ul>
            <li><a href="/admin">Início</a></li>
            <li><a href="/admin/eventos">Eventos</a></li>
            <li class="user-greeting">Bem-vindo, <span>{$user?.nome || ''}</span></li>
            <li><button class="logout-btn" on:click={logout}>Sair</button></li>
        </ul>
    </nav>
</header>

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
            <div class="card-image" style="background-image: url('{evento.imagem_cartaz || 'https://via.placeholder.com/400x600?text=Sem+Imagem'}')">                    <span class="type-tag">{evento.tipo_espectaculo}</span>
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
                        <textarea name="descricao" bind:value={eventoParaEditar.descricao} rows="4"></textarea>
                    </div>

                    <div class="input-group">
                        <label>Tipo</label>
                        <input type="text" name="tipo" bind:value={eventoParaEditar.tipo_espectaculo} required />
                    </div>

                    <button type="submit" class="btn-save">Guardar Alterações</button>
                </div>
            </div>
        </form>
    </div>
</div>
{/if}

<style>
    body { font-family: 'Bebas Neue', sans-serif; }
   
    :root { 
        --primary-color: #0f3460; 
        --secondary-color: #ff0000; 
        --background-dark: #1a1a2e; 
        --text-light: #e0e0e0; 
        --text-muted: #888; 
        --card-bg: #16213e; 
    }
    
    .header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 20px 40px; 
        background-color: var(--primary-color); 
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); 
        position: sticky; 
        top: 0; 
        z-index: 1000; 
    }
    
    .logo { 
        font-size: 1.8em; 
        font-weight: bold; 
        color: var(--text-light); 
    }
    
    .nav ul { 
        list-style: none; 
        margin: 0; 
        padding: 0; 
        display: flex; 
        align-items: center; 
    }
    
    .nav li { 
        margin-left: 30px; 
    }
    
    .nav a { 
        color: var(--text-light); 
        text-decoration: none; 
        font-size: 1.1em; 
        letter-spacing: 1px;
        transition: color 0.3s ease;
    }
    
    .nav a:hover {
        color: var(--secondary-color);
    }
    
    .user-greeting { 
        color: var(--text-light); 
        font-size: 1.1em; 
    }
    
    .user-greeting span { 
        color: var(--secondary-color); 
        font-weight: bold; 
    }
    
    .logout-btn { 
        background: none; 
        border: 2px solid var(--secondary-color); 
        color: var(--secondary-color); 
        padding: 8px 20px; 
        border-radius: 50px; 
        cursor: pointer;
        font-size: 0.9em;
        transition: 0.3s;
    }
    
    .logout-btn:hover {
        background: var(--secondary-color);
        color: #1a1a2e;
    }
    
    .admin-dashboard { 
        padding: 40px 60px; 
        min-height: 100vh; 
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color)); 
    }
    
    .welcome-text { 
        text-align: center; 
        margin-bottom: 50px; 
        color: white; 
    }
    
    .btn-add-event {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: var(--secondary-color);
        color: #1a1a2e;
        padding: 15px 30px;
        border-radius: 30px;
        text-decoration: none;
        font-size: 1.2em;
        font-weight: bold;
        transition: 0.3s;
        margin-top: 10px;
    }
    
    .btn-add-event .plus-icon {
        font-size: 1.5em;
        line-height: 1;
    }
    
    .btn-add-event:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 20px rgba(255, 0, 0, 0.4);
    }
    
    .cards-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
        gap: 40px; 
        max-width: 1200px; 
        margin: 0 auto; 
    }
    
    .event-card { 
        background: var(--card-bg); 
        border-radius: 20px; 
        overflow: hidden; 
        box-shadow: 0 10px 20px rgba(0,0,0,0.3); 
        display: flex; 
        flex-direction: column; 
    }
    
    .card-image { 
        height: 390px; 
        background-size: cover; 
        background-position: center; 
        position: relative; 
    }
    
    .type-tag { 
        position: absolute; 
        top: 15px; 
        right: 15px; 
        background: var(--secondary-color); 
        color: #1a1a2e; 
        padding: 5px 12px; 
        border-radius: 50px; 
        font-size: 1em; 
        font-weight: bold; 
    }
    
    .card-info { 
        padding: 15px; 
        color: white; 
        flex-grow: 1; 
        display: flex; 
        flex-direction: column; 
    }
    
    .card-info h3 { 
        margin: 0 0 8px 0; 
        font-size: 1.5em; 
    }
    
    .card-info p { 
        color: var(--text-muted); 
        font-size: 0.9em; 
        margin-bottom: 12px; 
        flex-grow: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
    }
    
    .card-actions { 
        display: flex; 
        gap: 10px; 
        align-items: center; 
    }
    
    .card-actions form { 
        flex: 1; 
        margin: 0; 
    }
    
    .action-btn { 
        width: 100%; 
        padding: 10px; 
        border-radius: 10px; 
        cursor: pointer; 
        font-weight: bold;
        font-size: 1em;
        transition: 0.3s;
    }
    
    .action-btn.edit { 
        background: transparent; 
        border: 1px solid #666; 
        color: #666; 
    }
    
    .action-btn.edit:hover {
        background: #666;
        color: #1a1a2e;
    }
    
    .action-btn.delete { 
        background: transparent; 
        border: 1px solid #ff0000; 
        color: #ff0000; 
    }
    
    .action-btn.delete:hover {
        background: #ff0000;
        color: #1a1a2e;
    }

    /* CSS MODAL */
    .modal-overlay { 
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(0,0,0,0.85); 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        z-index: 2000; 
        backdrop-filter: blur(4px); 
    }
    
    .modal-content { 
        background: var(--card-bg); 
        padding: 30px 40px; 
        border-radius: 20px; 
        width: 90%; 
        max-width: 900px; 
        color: white;
        position: relative;
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
        transition: 0.3s;
        line-height: 1;
        padding: 0;
        width: 50px;
        height: 50px;
    }
    
    .modal-close:hover {
        color: var(--secondary-color);
        transform: rotate(90deg);
    }
    
    .modal-content h2 {
        font-size: 2em;
        margin-bottom: 20px;
        text-align: center;
    }
    
    .form-layout { 
        display: flex; 
        gap: 50px; 
        align-items: flex-start; 
    }
    
    .image-column { 
        flex: 0 0 280px; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
    }
    
    .image-upload-modal { 
        width: 100%; 
        height: 380px; 
        border: 2px dashed var(--secondary-color);
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center;
        background: rgba(0,0,0,0.2);
        border-radius: 10px;
        transition: 0.3s;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    
    .image-upload-modal:hover { 
        background: rgba(233, 69, 96, 0.05); 
    }
    
    .plus-icon { 
        font-size: 3.5em; 
        color: var(--secondary-color); 
        margin-bottom: 10px; 
    }
    
    .image-upload-modal p { 
        font-weight: bold; 
        color: var(--text-light); 
        margin: 0; 
    }
    
    .file-input {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }
    
    .hint { 
        margin-top: 15px; 
        color: var(--text-muted); 
        font-size: 0.85em; 
    }
    
    .fields-column { 
        flex: 1; 
        display: flex; 
        flex-direction: column; 
        gap: 20px; 
    }
    
    .input-group { 
        display: flex; 
        flex-direction: column; 
        gap: 8px; 
    }
    
    .input-group label { 
        color: var(--text-light); 
        font-weight: 500; 
        font-size: 1.05em; 
    }
    
    .input-group input, 
    .input-group textarea { 
        background: #16162d; 
        border: 1px solid var(--border-color); 
        color: white; 
        padding: 14px; 
        border-radius: 8px;
        transition: 0.3s;
    }
    
    .input-group input:focus, 
    .input-group textarea:focus { 
        border-color: var(--secondary-color); 
        outline: none; 
        background: #1f1f3d; 
    }
    
    .form-group label { 
        display: block; 
        margin-bottom: 5px; 
        color: var(--text-light); 
        font-size: 0.9em; 
    }
    
    .form-group input, .form-group textarea { 
        width: 100%; 
        padding: 10px; 
        border-radius: 8px; 
        border: 1px solid #333; 
        background: var(--background-dark); 
        color: white; 
    }
    
    .modal-actions { 
        display: flex; 
        gap: 10px; 
        margin-top: 20px; 
    }
    
    .btn-save { 
        width: 100%;
        background: var(--secondary-color); 
        color: #1a1a2e; 
        border: none; 
        padding: 18px; 
        border-radius: 8px; 
        cursor: pointer; 
        font-weight: bold;
        font-size: 1.2em;
        transition: 0.3s;
        margin-top: 10px;
    }
    
    .btn-save:hover {
        transform: translateY(-2px);
    }
    
    .btn-cancel { 
        flex: 1; 
        background: #444; 
        color: white; 
        border: none; 
        padding: 12px; 
        border-radius: 10px; 
        cursor: pointer;
        transition: 0.3s;
    }
    
    .btn-cancel:hover {
        background: #555;
    }
    
    /* PRÉ-VISUALIZAÇÃO DA IMAGEM NO MODAL */
    .preview-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 8px;
    }
</style>