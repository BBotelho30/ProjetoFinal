<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    export let data;
    const salas = data?.salas || [];

    onMount(() => {
        if (!$user || $user.tipo !== 'admin') {
            goto('/autenticacao/login');
        }
    });

    let nomeFicheiro = '';
    // Estrutura inicial de uma sessão
    let sessoes = [{ id_sala: '', data: '', hora: '', duracao: '01:30' }];

    function adicionarSessao() {
        sessoes = [...sessoes, { id_sala: '', data: '', hora: '', duracao: '01:30' }];
    }

    function removerSessao(index) {
        if (sessoes.length > 1) {
            sessoes = sessoes.filter((_, i) => i !== index);
        }
    }

    function mostrarNome(e) {
        const ficheiro = e.target.files[0];
        if (ficheiro) nomeFicheiro = ficheiro.name;
    }

    // Serializa o array para enviar via formulário POST
    $: sessoesJSON = JSON.stringify(sessoes);
</script>

<main class="hero-section">
    <form method="POST" class="form-container" enctype="multipart/form-data">
        <button type="button" class="close-btn" on:click={() => window.history.back()}>&times;</button>
        <h1 class="hero-title">Configurar Espetáculo</h1>

        <div class="form-layout">
            <div class="image-column">
                <div class="image-upload">
                    {#if nomeFicheiro}
                        <p class="file-name">{nomeFicheiro}</p>
                    {:else}
                        <p>CARTAZ</p>
                        <span class="plus-icon">+</span>
                    {/if} 
                    <input type="file" name="imagem_ficheiro" accept="image/*" required class="file-input" on:change={mostrarNome} />
                </div>
            </div>

            <div class="fields-column">
                <div class="input-group">
                    <label for="nome">Nome do Evento</label>
                    <input type="text" id="nome" name="nome" placeholder="Ex: Matrix" required />
                </div>

                <div class="input-group">
                    <label for="descricao">Descrição</label>
                    <textarea id="descricao" name="descricao" rows="2" placeholder="Resumo..."></textarea>
                </div>

                <div class="input-group">
                    <label for="tipo">Tipo</label>
                    <input type="text" id="tipo" name="tipo" placeholder="Cinema, Teatro" />
                </div>

                <div class="sessions-section">
                    <div class="sessions-header">
                        <label>Sessões Agendadas</label>
                        <button type="button" class="add-btn" on:click={adicionarSessao}>+ Nova Sessão</button>
                    </div>

                    <input type="hidden" name="sessoes_data" value={sessoesJSON} />

                    <div class="sessions-list">
                        {#each sessoes as sessao, i}
                            <div class="session-item">
                                <select bind:value={sessao.id_sala} required>
                                    <option value="" disabled>Sala</option>
                                    {#each salas as s}
                                        <option value={s.id_sala}>{s.nome_sala}</option>
                                    {/each}
                                </select>
                                <input type="date" bind:value={sessao.data} required />
                                <input type="time" bind:value={sessao.hora} required />
                                <input type="time" bind:value={sessao.duracao} title="Duração" required />
                                {#if sessoes.length > 1}
                                    <button type="button" class="del-btn" on:click={() => removerSessao(i)}>&times;</button>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>

                <button type="submit" class="call-to-action">Publicar Espetáculo</button>
            </div>
        </div>
    </form>
</main>

<style>
    :root {
        --bg: #1a1a2e; 
        --primary: #0f3460;
        --accent: #ff0000; 
        --text: #e0e0e0;
    }

    .hero-section {
        min-height: 100vh; 
        background: radial-gradient(circle at top, var(--primary), var(--bg));
        display: flex; 
        justify-content: center; 
        align-items: center; 
        padding: 20px;
    }

    .form-container { 
        background: rgba(22, 22, 45, 0.95); 
        padding: 40px; 
        border-radius: 15px;
        width: 100%; 
        max-width: 1000px; 
        border: 1px solid #3f3f5f; 
        position: relative;
    }

    .close-btn { 
        position: absolute; 
        top: 10px; 
        right: 20px; 
        background: none; 
        border: none; 
        color: white; 
        font-size: 3em; 
        cursor: pointer; }

    .hero-title { 
        text-align: center; 
        margin-bottom: 30px; 
    }

    .form-layout { 
        display: flex; 
        gap: 30px; 
    }

    .image-column { 
        flex: 0 0 240px; 
    }

    .image-upload { 
        height: 320px; 
        border: 2px dashed var(--accent); 
        border-radius: 10px;
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center;
        position: relative; 
        background: rgba(0,0,0,0.3);
    }

    .file-input { 
        position: absolute; 
        width: 100%; 
        eight: 100%; 
        opacity: 0; 
        cursor: pointer; 
    }

    .plus-icon { 
        font-size: 3em; 
        color: var(--accent); 
    }

    .fields-column { 
        flex: 1; 
        display: 
        flex; flex-direction: 
        column; gap: 15px; 
    }

    .input-group { 
        display: flex; 
        flex-direction: column; 
        gap: 5px; 
    }
    
    input, textarea, select { 
        background: #111126; 
        border: 1px solid #3f3f5f; 
        color: white; 
        padding: 10px; 
        border-radius: 5px;
    }

    /* Estilo das Sessões */
    .sessions-section { 
        background: rgba(0,0,0,0.2); 
        padding: 15px; 
        border-radius: 10px; 
    }

    .sessions-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 10px; 
    }

    .add-btn { 
        background: none; 
        border: 1px solid var(--accent); 
        color: var(--accent); 
        padding: 4px 10px; 
        border-radius: 4px; 
        cursor: pointer; 
    }
    
    .sessions-list { 
        display: flex; 
        flex-direction: column; 
        gap: 8px; 
        max-height: 200px; 
        overflow-y: auto; 
    }

    .session-item { 
        display: grid; 
        grid-template-columns: 2fr 2fr 1.5fr 1.5fr auto; 
        gap: 8px; 
        align-items: center; 
    }
    
    .del-btn { 
        background: var(--accent); 
        order: none; 
        color: white; 
        border-radius: 50%; 
        width: 25px; 
        height: 25px; 
        cursor: pointer; 
    }

    .call-to-action { 
        background: var(--accent); 
        color: white; 
        border: none; 
        padding: 15px; 
        font-weight: bold; 
        font-size: 1.2em; 
        border-radius: 5px; 
        cursor: pointer; 
        margin-top: 10px; 
    }
    
    @media (max-width: 800px) { .form-layout { flex-direction: column; } .session-item { grid-template-columns: 1fr 1fr; } }
</style>