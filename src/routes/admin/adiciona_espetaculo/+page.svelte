<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let siteName = "QuickSeat";

    onMount(() => {
        if (!$user || $user.tipo !== 'admin') {
            goto('/login');
        }
    });

    function logout() {
        user.set(null);
        goto('/');
    }

    let nomeFicheiro = '';

    function mostrarNome(e) {
        const ficheiro = e.target.files[0];
        if (ficheiro) {
            nomeFicheiro = ficheiro.name; 
        }
    }

    let sessoes = [{ data: '', hora: '' }];
    
    function adicionarSessao() {
        sessoes = [...sessoes, { data: '', hora: '' }];
    }

    function removerSessao(index) {
        sessoes = sessoes.filter((_, i) => i !== index);
    }

    $: sessoesJSON = JSON.stringify(sessoes);

</script>

<header class="header">
    <div class="logo">{siteName}</div>
    <nav class="nav">
        <ul>
            <li><a href="/admin">Início</a></li>
            <li><a href="/admin/eventos">Eventos</a></li>
            {#if $user}
                <li class="user-info">
                    <span>Bem-Vindo, <strong> {$user.nome}</strong></span>
                    <button class="logout-btn" on:click={logout}>Sair</button>
                </li>
            {/if}
        </ul>
    </nav>
</header>

<main class="hero-section">
    <div class="hero-glow-1"></div>
    <div class="hero-glow-2"></div>

    <form method="POST" class="form-container" enctype="multipart/form-data">
        <button type="button" class="close-btn" on:click={() => window.history.back()}>&times;</button>
        <h1 class="hero-title">Novo Espetáculo</h1>

        <div class="form-layout">
            <div class="image-column">
                <div class="image-upload">
                    {#if nomeFicheiro}
                        <p style="color: var(--secondary-color); font-size: 0.9em; text-align: center; padding: 10px;">
                            {nomeFicheiro}
                        </p>
                    {:else}
                        <p>CARTAZ DO EVENTO</p>
                        <span class="plus-icon">+</span>
                    {/if} 
                    <!--aceita qualquer iamgem JPG, PNG, GIF, WEBP -->
                    <input type="file" name="imagem_ficheiro" accept="image/*" required class="file-input" on:change={mostrarNome} />

                </div>

                <small class="hint">Formatos: JPG, PNG ou WEBP</small>
            </div>

            <div class="fields-column">
                <div class="input-group">
                    <label for="nome">Nome do Evento</label>
                    <input type="text" id="nome" name="nome" placeholder="Ex: Matrix" required />
                </div>

                <div class="input-group">
                    <label for="descricao">Descrição</label>
                    <textarea id="descricao" name="descricao" rows="4" placeholder="Breve resumo do espetáculo..."></textarea>
                </div>

                <div class="input-group">
                    <label for="tipo">Tipo de Espetáculo</label>
                    <input type="text" id="tipo" name="tipo" placeholder="ex: Cinema, Teatro, Concerto" />
                </div>                

                <button type="submit" class="call-to-action">Publicar Espetáculo</button>
            </div>
        </div>

        
    </form>
</main>

<footer class="footer">
    <p>&copy; 2025 {siteName}. Todos os direitos reservados.</p>
</footer>

<style>
    :root {
        --background-dark: #1a1a2e; 
        --primary-color: #0f3460;   
        --secondary-color: #ff0000; 
        --text-light: #e0e0e0;
        --text-muted: #888;
        --border-color: #3f3f5f;
    }

    /* HEADER */
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

    .header .logo { 
        font-size: 1.8em; 
        font-weight: bold; 
        color: var(--text-light); 
    }

    .header .nav ul { 
        list-style: none; 
        display: flex; 
        align-items: center; 
        gap: 30px; 
        margin: 0; 
        padding: 0; 
    }

    .header .nav a { 
        color: var(--text-light); 
        text-decoration: none; 
        font-size: 1.1em; 
        letter-spacing: 1px; 
        transition: 0.3s; 
    }
    
    .header .nav a:hover { 
        color: var(--secondary-color); 
    }

    .user-info { display: flex; align-items: center; gap: 15px; border-left: 1px solid var(--border-color); padding-left: 20px; }
    .user-info strong { color: var(--secondary-color); }

    .logout-btn {
        background: none;
        border: 1px solid var(--secondary-color);
        color: var(--secondary-color);
        padding: 6px 15px;
        border-radius: 20px;
        cursor: pointer;
        transition: 0.3s;
    }
    .logout-btn:hover { background: var(--secondary-color); color: #1a1a2e; }

    /* LAYOUT PRINCIPAL */
    .hero-section {
        min-height: calc(100vh - 80px); /* Ajusta para descontar o header */
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        overflow: hidden;
        padding: 40px 20px;
    }

    .form-container { 
        background: rgba(22, 22, 45, 0.9); 
        padding: 50px; 
        border-radius: 20px; 
        z-index: 10;
        width: 100%;
        max-width: 950px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        border: 1px solid var(--border-color);
        position: relative;
    }
    
    .close-btn {
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
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .close-btn:hover {
        color: var(--secondary-color);
        transform: rotate(90deg);
    }

    .hero-title { font-size: 2.5em; margin-bottom: 40px; text-align: center; color: white; }

    .form-layout { display: flex; gap: 50px; align-items: flex-start; }

    /* COLUNA IMAGEM */
    .image-column { 
        flex: 0 0 280px; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
    }

    .image-upload { 
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
    }

    .image-upload:hover { 
        background: rgba(233, 69, 96, 0.05); 
    }

    .plus-icon { 
        font-size: 3.5em; 
        color: var(--secondary-color); 
        margin-bottom: 10px; 
    }

    .image-upload p { 
        font-weight: bold; 
        color: var(--text-light); 
        margin: 0; 
    }

    .file-input {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0; /* Esconde o botão do sistema, mas mantém funcional */
        cursor: pointer;
    }

    .hint { margin-top: 15px; color: var(--text-muted); font-size: 0.85em; }

    /* COLUNA CAMPOS */
    .fields-column { flex: 1; display: flex; flex-direction: column; gap: 20px; }

    .input-group { display: flex; flex-direction: column; gap: 8px; }

    label { color: var(--text-light); font-weight: 500; font-size: 1.05em; }

    input, textarea { 
        background: #16162d; 
        border: 1px solid var(--border-color); 
        color: white; 
        padding: 14px; 
        border-radius: 8px;
        transition: 0.3s;
    }

    input:focus, textarea:focus { border-color: var(--secondary-color); outline: none; background: #1f1f3d; }

    .call-to-action {
        background: var(--secondary-color);
        border: none;
        color: #1a1a2e;
        padding: 18px;
        font-size: 1.4em;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.3s;
        margin-top: 10px;
    }

    .call-to-action:hover { transform: translateY(-2px); }

    /* GLOW EFFECTS */
    .hero-glow-1, .hero-glow-2 {
        position: absolute; width: 600px; height: 600px; background: rgba(233, 69, 96, 0.05);
        border-radius: 50%; filter: blur(100px); z-index: 0;
    }
    .hero-glow-1 { top: -10%; left: -10%; }
    .hero-glow-2 { bottom: -10%; right: -10%; }

    .footer { text-align: center; padding: 25px; background: #0a0a1a; color: var(--text-muted); }

    /* Mobile */
    @media (max-width: 850px) {
        .form-layout { flex-direction: column; align-items: center; }
        .image-column { width: 100%; flex: none; }
    }
</style>