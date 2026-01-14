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

<main class="admin-container">
    {#if showSuccess}
        <div class="popup-success">
            <div class="popup-content">
                <span class="icon">✅</span>
                <p>Sala adicionada com sucesso!</p>
            </div>
        </div>
    {/if}

    <div class="form-card">
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

          

            <button type="submit" class="btn-save" disabled={!svgCode || !nome}>Criar Sala</button>
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
    .admin-container { 
        min-height: 100vh; 
        background: #0f172a; 
        padding: 40px 20px; 
        font-family: sans-serif;
    }

    .form-card { 
        background: #1e293b; 
        padding: 2.5rem; 
        border-radius: 12px; 
        color: white; 
        max-width: 800px; 
        margin: 0 auto; 
        box-shadow: 0 10px 25px rgba(0,0,0,0.5); 
    }

    h1 { margin-bottom: 2rem; font-size: 1.8rem; text-align: center; color: #f8fafc; }

    .input-group { margin-bottom: 1.8rem; display: flex; flex-direction: column; gap: 8px; }

    label { font-weight: 600; color: #cbd5e1; font-size: 0.95rem; }

    textarea, input { 
        background: #0f172a; border: 1px solid #334155; color: white; 
        padding: 12px; border-radius: 8px; font-size: 1rem; 
    }

    /* Estilo do Upload */
    .hidden-input { display: none; }
    .file-upload-wrapper { cursor: pointer; }
    .file-custom-btn { 
        background: #1e293b; border: 2px dashed #475569; padding: 20px; border-radius: 8px; 
        text-align: center; transition: all 0.2s ease; display: flex; flex-direction: column; 
        align-items: center; gap: 10px; color: #94a3b8; 
    }
    .file-custom-btn:hover { border-color: #3b82f6; background: #0f172a; color: #f8fafc; }
    .upload-icon { font-size: 1.5rem; }

    .btn-save { 
        background: #10b981; color: white; border: none; padding: 16px; 
        border-radius: 8px; cursor: pointer; width: 100%; font-weight: bold; 
        font-size: 1.1rem; margin-top: 10px;
    }
    .btn-save:disabled { background: #475569; cursor: not-allowed; }

    .preview-section { margin-top: 2.5rem; background: white; padding: 25px; border-radius: 12px; color: #1e293b; }
    .svg-render :global(svg) { max-width: 100%; height: auto; }

    .error-msg { background: #f87171; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center; }

    .popup-success { 
        position: fixed; top: 20px; right: 20px; background: #10b981; color: white; 
        padding: 15px 25px; border-radius: 10px; z-index: 1000; animation: slideIn 0.3s ease-out; 
    }
    .popup-content { display: flex; align-items: center; gap: 10px; font-weight: bold; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
</style>