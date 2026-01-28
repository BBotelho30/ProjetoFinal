<script>
// @ts-nocheck
import { user } from '$lib/userStore';
import { onMount, tick } from 'svelte';
import { goto } from '$app/navigation';

export let form;
export let data;
const salas = data?.salas || [];

// Proteção de rota
onMount(() => {
    if (!$user || $user.tipo !== 'admin') {
        goto('/autenticacao/login');
    }
});

let nomeFicheiro = '';
let sessoes = [{ id_sala: '', data: '', hora: '', duracao: '01:30', limite_bilhetes: 10 }];

// --- LÓGICA DE EDIÇÃO: Sincroniza os dados vindos do servidor ---
$: if (data?.evento?.sessoes) {
    sessoes = [...data.evento.sessoes];
}

function adicionarSessao() {
    sessoes = [...sessoes, { id_sala: '', data: '', hora: '', duracao: '01:30', limite_bilhetes: 10 }];
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

// Toast error timer
$: if (form?.message) {
    setTimeout(() => {
        form.message = null;
    }, 5000);
}
</script>

<main class="hero-section">
    <form method="POST" class="form-container" enctype="multipart/form-data">
        <input type="hidden" name="id_evento" value={data?.evento?.id_eventos || ''} />
        <input type="hidden" name="imagem_atual" value={data?.evento?.imagem_cartaz || ''} />
        <input type="hidden" name="sessoes_data" value={sessoesJSON} />

        <button type="button" class="close-btn" on:click={() => window.history.back()}>&times;</button>
        
        <h1 class="hero-title">
            {data?.evento ? 'Editar Espetáculo' : 'Configurar Espetáculo'}
        </h1>

        <div class="form-layout">
            <div class="image-column">
                <div class="image-upload" style="background-image: url({data?.evento?.imagem_cartaz || ''}); background-size: cover; background-position: center;">
                    {#if nomeFicheiro}
                        <p class="file-name">{nomeFicheiro}</p>
                    {:else if !data?.evento?.imagem_cartaz}
                        <p>ADICIONAR CARTAZ</p>
                        <span class="plus-icon">+</span>
                    {/if}
                    <input type="file" name="imagem_ficheiro" accept="image/*" required={!data?.evento} class="file-input" on:change={mostrarNome} />
                </div>
            </div>

            <div class="fields-column">
                <div class="input-group">
                    <label for="nome">Nome do Evento</label>
                    <input type="text" id="nome" name="nome" placeholder="Ex: Matrix" value={data?.evento?.nome_evento || ''} required />
                </div>

                <div class="input-group">
                    <label for="descricao">Descrição</label>
                    <textarea id="descricao" name="descricao" rows="2" placeholder="Resumo..." value={data?.evento?.descricao || ''}></textarea>
                </div>

                <div class="input-group">
                    <label for="tipo">Tipo</label>
                    <input type="text" id="tipo" name="tipo" placeholder="Cinema, Teatro" value={data?.evento?.tipo_espectaculo || ''} required />
                </div>

                <div class="sessions-section">
                    <div class="sessions-header">
                        <label>Sessões Agendadas</label>
                        <button type="button" class="add-btn" on:click={adicionarSessao}>+ Nova Sessão</button>
                    </div>

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

                                <div class="ticket-limit">

                                <input type="number" bind:value={sessao.limite_bilhetes} min="1" max="10" title="Limite de bilhetes por compra" required />
                            </div>
                                
                                {#if sessoes.length > 1}
                                    <button type="button" class="del-btn" on:click={() => removerSessao(i)}>&times;</button>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>

                <button type="submit" class="call-to-action">
                    {data?.evento ? 'Guardar Alterações' : 'Publicar Espetáculo'}
                </button>
            </div>
        </div>
    </form>
</main>

{#if form?.message}
<div class="toast-overlay">
    <div class="toast-card">
        <span class="toast-icon">❌</span>
        <div class="toast-content">
            <strong>Erro de Agendamento</strong>
            <p>{form.message}</p>
        </div>
        <button class="toast-close" on:click={() => form.message = null}>&times;</button>
    </div>
</div>
{/if}

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
    cursor: pointer;
    z-index: 10;
    transition: 0.3s ease;
}

.close-btn:hover {
    color: #ff0000;
    transform: rotate(90deg);
}

.hero-title {
    text-align: center;
    margin-bottom: 30px;
    color: white;
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
    overflow: hidden;
}

.file-input {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.file-name {
    padding: 10px;
    text-align: center;
    background: rgba(0,0,0,0.7);
    width: 100%;
}

.plus-icon {
    font-size: 3em;
    color: var(--accent);
}

.fields-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
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
    max-height: 250px;
    overflow-y: auto;
    padding-right: 5px;
}

.session-item {
    display: grid;
    grid-template-columns: 2fr 2fr 1.5fr 1.5fr auto;
    gap: 8px;
    align-items: center;
}

.del-btn {
    background: var(--accent);
    border: none;
    color: white;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
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
    transition: opacity 0.2s;
}

.call-to-action:hover {
    opacity: 0.9;
}

@media (max-width: 800px) { 
    .form-layout { flex-direction: column; } 
    .image-column { flex: none; width: 100%; }
    .session-item { grid-template-columns: 1fr 1fr; gap: 10px; } 
}

/* Toast Styles */
.toast-overlay {
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    width: 100%;
    max-width: 450px;
    padding: 0 20px;
}

.toast-card {
    background: #fff;
    color: #333;
    padding: 16px 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 15px 30px rgba(0,0,0,0.4);
    border-left: 6px solid #d32f2f;
    animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideIn {
    from { transform: translateY(-100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(1) brightness(0.8);
    cursor: pointer;
}



</style>