    <script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    // Svelte 5: Receber props do servidor
    let { data, form = $bindable() } = $props();

    const salas = $derived(data?.salas || []);

    let zonasPorSala = $state({});

    // Proteção de rota
    onMount(() => {
        if (!$user || $user.tipo !== 'admin') {
            goto('/autenticacao/login');
        }
    });

    // Estados Reativos ($state)
    let nomeFicheiro = $state('');
    let sessoes = $state(data?.evento?.sessoes ? [...data.evento.sessoes] : 
        [{ id_sala: '', data: '', hora: '', duracao: '01:30', limite_bilhetes: 10 }]);

    // Serialização automática para o input hidden
    let sessoesJSON = $derived(JSON.stringify(sessoes));

    function adicionarSessao() {
        sessoes.push({ id_sala: '', data: '', hora: '', duracao: '01:30', limite_bilhetes: 10 });
    }

    function removerSessao(index) {
        if (sessoes.length > 1) {
            sessoes.splice(index, 1);
        }
    }

    function mostrarNome(e) {
        const ficheiro = e.target.files[0];
        if (ficheiro) {
            nomeFicheiro = ficheiro.name;
            // Criar um URL temporário para pré-visualização (opcional)
            const reader = new FileReader();
            reader.onload = (ev) => {
                const imgElement = document.getElementById('preview-img');
                if (imgElement) imgElement.style.backgroundImage = `url(${ev.target.result})`;
            };
            reader.readAsDataURL(ficheiro);
        }
    }

    // Timer para o Toast de erro
    $effect(() => {
        if (form?.message) {
            const timer = setTimeout(() => {
                form.message = null;
            }, 5000);
            return () => clearTimeout(timer);
        }
    });


    onMount(async () => {
            if (data?.evento?.sessoes) {
                for (let i = 0; i < sessoes.length; i++) {
                    if (sessoes[i].id_sala) {
                        await carregarZonas(sessoes[i].id_sala, i);
                    }
                }
            }
        });

    async function carregarZonas(id_sala, indexSessao) {
        if (!id_sala) return;
        try {
            const res = await fetch(`/api/zonas/${id_sala}`);
            if (!res.ok) throw new Error('Falha ao carregar zonas');
            const zonas = await res.json();

            // Guardamos as zonas para esta sala específica
            zonasPorSala[id_sala] = zonas;

            // Inicializa o objeto de preços se não existir
            if (!sessoes[indexSessao].precos) {
                sessoes[indexSessao].precos = {};
            }

            // Garante que cada zona tem uma chave no objeto de preços
            zonas.forEach(z => {
                if (sessoes[indexSessao].precos[z.id_zona] === undefined) {
                    sessoes[indexSessao].precos[z.id_zona] = 0;
                }
            });
        } catch (err) {
            console.error("Erro no fetch das zonas:", err);
        }
    }
    </script>

    <main class="hero-section">
        <form method="POST" class="form-container" enctype="multipart/form-data">
            <input type="hidden" name="id_evento" value={data?.evento?.id_eventos || ''} />
            <input type="hidden" name="imagem_atual" value={data?.evento?.imagem_cartaz || ''} />
            <input type="hidden" name="sessoes_data" value={sessoesJSON} />

            <button type="button" class="close-btn" onclick={() => window.history.back()}>&times;</button>
            
            <h1 class="hero-title">
                {data?.evento ? 'Editar Espetáculo' : 'Criar Evento'}
            </h1>

            <div class="form-layout">
                <div class="image-column">
                    <div 
                        id="preview-img"
                        class="image-upload" 
                        style="background-image: url({data?.evento?.imagem_cartaz || ''}); background-size: cover; background-position: center;"
                    >
                        {#if nomeFicheiro}
                            <p class="file-name">{nomeFicheiro}</p>
                        {:else if !data?.evento?.imagem_cartaz}
                            <p>ADICIONAR CARTAZ</p>
                            <span class="plus-icon">+</span>
                        {/if}
                        <input type="file" name="imagem_ficheiro" accept="image/*" required={!data?.evento} class="file-input" onchange={mostrarNome} />
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
                            <button type="button" class="add-btn" onclick={adicionarSessao}>+ Nova Sessão</button>
                        </div>

                        <div class="sessions-list">
                            {#each sessoes as sessao, i}
                            <div class="session-card">
                                <div class="session-item">
                                    <select bind:value={sessao.id_sala} onchange={() => carregarZonas(sessao.id_sala, i)} required>
                                        <option value="" disabled>Selecionar Sala</option>
                                        {#each salas as s}
                                            <option value={s.id_sala}>{s.nome_sala}</option>
                                        {/each}
                                    </select>
                                    <input type="date" bind:value={sessao.data} required />
                                    <input type="time" bind:value={sessao.hora} required />
                                    <input type="time" bind:value={sessao.duracao} title="Duração" required />
                                    
                                    {#if sessoes.length > 1}
                                        <button type="button" class="del-btn" onclick={() => removerSessao(i)}>&times;</button>
                                    {/if}
                                </div>

                                {#if sessao.id_sala && zonasPorSala[sessao.id_sala]}
                                    <div class="price-grid">
                                        <p class="price-title">Preços por Setor:</p>
                                        <div class="zones-container">
                                            {#each zonasPorSala[sessao.id_sala] as zona}
                                                <div class="zone-price-input">
                                                    <label>{zona.nome_zona}</label>
                                                    <div class="currency-input">
                                                        <input 
                                                            type="number" 
                                                            step="0.01" 
                                                            bind:value={sessao.precos[zona.id_zona]} 
                                                            placeholder="0.00"
                                                        />
                                                        <span>€</span>
                                                    </div>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
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
            <button class="toast-close" onclick={() => form.message = null}>&times;</button>
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
    background-color: var(--primary);
    min-height: calc(100vh - 80px); /* altura do header */
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 110px; /* ajusta aqui o espaço */
}


.form-container {
    background: var(--bg);
    padding: 40px;
    border-radius: 15px;
    width: 100%;
    max-width: 1000px;
    border: 1px solid #303053;
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

.session-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid #3f3f5f;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
}

.price-grid {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px dashed #3f3f5f;
}

.price-title {
    font-size: 0.8rem;
    color: var(--accent);
    font-weight: bold;
    margin-bottom: 10px;
    text-transform: uppercase;
}

.zones-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
}

.zone-price-input label {
    font-size: 0.75rem;
    display: block;
    margin-bottom: 5px;
    color: #94a3b8;
}

.currency-input {
    display: flex;
    align-items: center;
    gap: 5px;
}

.currency-input input {
    width: 100%;
    padding: 5px 8px;
}

.currency-input span {
    color: #10b981;
    font-weight: bold;
}



</style>