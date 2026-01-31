<script>
    // @ts-nocheck
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';

    export let form; 
    let nome = '';
    let descricao = '';
    let svgCode = '';
    let previewHtml = '';
    let showSuccess = false;
    let nomeFicheiro = ''; 

    $: previewHtml = svgCode;

    function processarFicheiro(event) {
        const input = event.target;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        nomeFicheiro = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            const conteudo = e.target.result;
            // Verifica se o conteúdo parece ser um SVG
            if (conteudo && conteudo.toString().includes("<svg")) {
                svgCode = conteudo.toString();
            } else {
                alert("O ficheiro selecionado não parece conter um código SVG válido.");
                nomeFicheiro = "";
                svgCode = "";
            }
        };
        reader.readAsText(file);
    }

    $: if (form?.success) {
        showSuccess = true;
        nome = '';
        descricao = '';
        svgCode = '';
        nomeFicheiro = '';
        
        setTimeout(() => {
            showSuccess = false;
            goto('/admin/salas');
        }, 2000);
    }
</script>

<main class="hero-section">
    <div class="form-container">

        <button type="button" class="close-btn" on:click={() => goto('/admin/salas')}>
            &times;
        </button>

        {#if showSuccess}
            <div class="popup-success">
                <div class="popup-content">
                    <span class="icon">✅</span>
                    <p>Sala adicionada com sucesso!</p>
                </div>
            </div>
        {/if}

        <h1>Criar Nova Sala</h1>

        {#if form?.message}
            <div class="error-msg">{form.message}</div>
        {/if}

        <form method="POST" action="?/criarSala" use:enhance>
            <div class="input-group">
                <label for="nome">Nome da Sala</label>
                <input id="nome" name="nome" bind:value={nome} required placeholder="Ex: Sala IMAX" />
            </div>

            <div class="input-group">
                <label for="descricao">Descrição</label>
                <textarea id="descricao" name="descricao" bind:value={descricao} rows="3"></textarea>
            </div>

            <div class="input-group">
                <label for="file-upload">Carregar Mapa (Ficheiro .svg ou .txt)</label>
                <label class="file-upload-wrapper">
                    <input type="file" id="file-upload" accept=".svg,.txt" on:change={processarFicheiro} class="hidden-input" />
                    <div class="file-custom-btn">
                        <span class="upload-icon">📁</span>
                        {nomeFicheiro ? `Ficheiro: ${nomeFicheiro}` : "Selecionar ficheiro do computador"}
                    </div>
                </label>
            </div>

            <input type="hidden" name="svg_code" value={svgCode} />

            <button type="submit" class="btn-save" disabled={!svgCode || !nome}>
                Criar Sala
            </button>
        </form>

        {#if previewHtml}
            <div class="preview-section">
                <h3>Preview da Sala:</h3>
                <div class="svg-render">
                    {@html previewHtml}
                </div>
            </div>
        {/if}

    </div>
</main>

<style>
    :root {
        --bg: #1a1a2e;
        --primary: #0f3460;
        --accent: #ff0000;
        --text: #e0e0e0;
    }

    .hero-section {
        background-color: var(--primary);
        min-height: calc(100vh - 80px); /* altura do header */
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 110px; /* ajusta aqui o espaço */
    }

    .form-container {
        background: rgba(22, 22, 45, 0.95);
        padding: 40px;
        border-radius: 15px;
        width: 100%;
        max-width: 900px;
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
        cursor: pointer;
        z-index: 10;
        transition: 0.3s ease;
    }

    .close-btn:hover {
        color: #ff0000;
        transform: rotate(90deg);
    }

    h1 {
        text-align: center;
        margin-bottom: 30px;
        color: white;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 15px;
    }

    label {
        color: #cbd5e1;
        font-weight: 600;
    }

    input, textarea {
        background: #111126;
        border: 1px solid #3f3f5f;
        color: white;
        padding: 10px;
        border-radius: 5px;
    }

    .hidden-input {
        display: none;
    }

    .file-custom-btn {
        background: rgba(0,0,0,0.3);
        border: 2px dashed var(--accent);
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        color: #ccc;
        transition: 0.2s;
    }

    .file-custom-btn:hover {
        background: rgba(0,0,0,0.5);
    }

    .upload-icon {
        font-size: 2em;
        color: var(--accent);
    }

    .btn-save {
        width: 100%;
        background: var(--accent);
        color: white;
        border: none;
        padding: 15px;
        font-weight: bold;
        font-size: 1.2em;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 20px;
    }

    .btn-save:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .preview-section {
        margin-top: 30px;
        background: white;
        padding: 20px;
        border-radius: 12px;
        color: #1a1f3a;
    }

    /* Corrigir estilo do autofill do Chrome */
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    textarea:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px #0f172a inset !important;
        box-shadow: 0 0 0px 1000px #0f172a inset !important;
        -webkit-text-fill-color: white !important;
        caret-color: white;
        border: 1px solid #334155;
    }

</style>