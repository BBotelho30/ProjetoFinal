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
    <div class="logo">Gestão de Reservas</div>
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
    </div>

    <div class="cards-grid">
        {#each eventos as evento}
            <div class="event-card">
            <div class="card-image" style="background-image: url('{evento.imagem_cartaz || 'https://via.placeholder.com/400x600?text=Sem+Imagem'}')">                    <span class="type-tag">{evento.tipo_espectaculo}</span>
                </div>
                <div class="card-info">
                    <h3>{evento.nome_evento}</h3>
                    <p>{evento.descricao}</p>
                    <div class="card-actions">
                        <button class="action-btn edit" on:click={() => abrirEdicao(evento)}>Editar</button>
                        <form method="POST" action="?/eliminar" use:enhance>
                            <input type="hidden" name="id" value={evento.id_eventos} />
                            <button type="submit" class="action-btn delete">Eliminar</button>
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

            <div class="form-group">
                <label>Nova Imagem</label>
                <input type="file" accept="image/*" on:change={handleFileChange} />
                <input type="hidden" name="nova-imagem" value={novaImagem} />
                
                {#if novaImagem}
                    <img src={novaImagem} alt="Preview" class="preview-img" />
                {/if}
            </div>


            <div class="form-group">
                <label>Nome do Evento</label>
                <input type="text" name="nome" bind:value={eventoParaEditar.nome_evento} required />
            </div>



            <div class="form-group">
                <label>Tipo</label>
                <input type="text" name="tipo" bind:value={eventoParaEditar.tipo_espectaculo} required />
            </div>

            <div class="form-group">
                <label>Descrição</label>
                <textarea name="descricao" bind:value={eventoParaEditar.descricao} rows="3"></textarea>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-cancel" on:click={fecharModal}>Cancelar</button>
                <button type="submit" class="btn-save">Guardar Alterações</button>
            </div>
        </form>
    </div>
</div>
{/if}

<style>
   
    :root { --primary-color: #0f3460; --secondary-color: #e94560; --background-dark: #1a1a2e; --text-light: #e0e0e0; --text-muted: #888; --card-bg: #16213e; }
    .header { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; background-color: var(--primary-color); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); position: sticky; top: 0; z-index: 1000; font-family: sans-serif; }
    .logo { font-size: 1.8em; font-weight: bold; color: var(--text-light); }
    .nav ul { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; }
    .nav li { margin-left: 30px; }
    .nav a { color: var(--text-light); text-decoration: none; font-size: 1.1em; }
    .user-greeting { color: var(--text-light); font-size: 1.1em; }
    .user-greeting span { color: var(--secondary-color); font-weight: bold; }
    .logout-btn { background: none; border: 2px solid var(--secondary-color); color: var(--secondary-color); padding: 8px 20px; border-radius: 50px; cursor: pointer; font-family: sans-serif; }
    .admin-dashboard { padding: 40px 60px; min-height: 100vh; background: linear-gradient(45deg, var(--background-dark), var(--primary-color)); font-family: sans-serif; }
    .welcome-text { text-align: center; margin-bottom: 50px; color: white; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto; }
    .event-card { background: var(--card-bg); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.3); display: flex; flex-direction: column; }
    .card-image { height: 250px; background-size: cover; background-position: center; position: relative; }
    .type-tag { position: absolute; top: 15px; right: 15px; background: var(--secondary-color); color: white; padding: 5px 12px; border-radius: 50px; font-size: 0.8em; font-weight: bold; }
    .card-info { padding: 20px; color: white; flex-grow: 1; display: flex; flex-direction: column; }
    .card-info h3 { margin: 0 0 10px 0; font-size: 1.4em; }
    .card-info p { color: var(--text-muted); font-size: 0.9em; margin-bottom: 20px; flex-grow: 1; }
    .card-actions { display: flex; gap: 10px; align-items: center; }
    .card-actions form { flex: 1; margin: 0; }
    .action-btn { width: 100%; padding: 10px; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; }
    .action-btn.edit { background: #4e4e4e; color: white; }
    .action-btn.delete { background: transparent; border: 1px solid #ff4d4d; color: #ff4d4d; }

    /* CSS MODAL */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 2000; backdrop-filter: blur(4px); }
    .modal-content { background: var(--card-bg); padding: 30px; border-radius: 20px; width: 90%; max-width: 500px; color: white; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; margin-bottom: 5px; color: var(--text-light); font-size: 0.9em; }
    .form-group input, .form-group textarea { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #333; background: var(--background-dark); color: white; }
    .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
    .btn-save { flex: 2; background: var(--secondary-color); color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; }
    .btn-cancel { flex: 1; background: #444; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; }
    
    /* PRÉ-VISUALIZAÇÃO DA IMAGEM NO MODAL */
    .preview-img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        margin-top: 10px;
        border-radius: 8px;
        border: 2px solid var(--secondary-color);
    }</style>