<script>
    import { goto } from '$app/navigation'; // Para mudar de página após o sucesso

    let nome = '';
    let apelido = '';
    let email = '';
    let password = '';
    let passwordConfirm = '';
    let loading = false;

    async function handleRegister() {
        if (password !== passwordConfirm) {
            alert('As palavras-passe não coincidem');
            return;
        }

        loading = true;

        try {
            const response = await fetch('/api/registo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, apelido, email, password })
            });

            const result = await response.json();

            if (result.success) {
                alert('Registo concluído com sucesso!');
                goto('/login'); // Redireciona para o login
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Erro ao tentar registar. Verifica a ligação ao servidor.');
        } finally {
            loading = false;
        }
    }
</script>

<main class="auth-page">
    <div class="auth-card">
        <h1 class="hero-title">Registo</h1>
        <p class="hero-tagline">Cria uma conta para começares a reservar lugares.</p>

        <form on:submit|preventDefault={handleRegister} class="auth-form">
            <label>
                Nome
                <input type="text" bind:value={nome} required />
            </label>

            <label>
                Apelido
                <input type="text" bind:value={apelido} required />
            </label>

            <label>
                Email
                <input type="email" bind:value={email} required />
            </label>

            <label>
                Palavra-passe
                <input type="password" bind:value={password} required />
            </label>

            <label>
                Confirma Palavra-passe
                <input type="password" bind:value={passwordConfirm} required />
            </label>

            <button type="submit" class="call-to-action">Registar</button>
        </form>

        <p class="auth-footer">Já tens conta? <a href="/login">Entrar</a></p>
    </div>
</main>

<style>
    :global(:root) {
        --background-dark: #1a1a2e;
        --primary-color: #0f3460;
        --secondary-color: #e94560;
        --text-light: #e0e0e0;
        --text-muted: #888;
    }

    .auth-page{
        min-height: calc(100vh - 80px);
        display:flex;
        align-items:center;
        justify-content:center;
        padding: 40px 20px;
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
    }

    .auth-card{
        background: rgba(10, 10, 20, 0.6);
        padding: 36px 40px;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6);
        max-width:520px;
        width:100%;
        color: var(--text-light);
        text-align:left;
    }

    .hero-title{ 
        margin: 0 0 6px; 
        font-size:2em 
    }

    .hero-tagline{ 
        margin: 0 0 18px; 
        color: var(--text-muted) 
    }

    .auth-form label{
        display:block;
        font-size:0.95em;
        margin-bottom:14px;
        color:var(--text-light);
    }

    .auth-form input{
        display:block;
        width:100%;
        margin-top:6px;
        padding:12px 14px;
        border-radius:8px;
        border:1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
        color:var(--text-light);
        outline:none;
        box-sizing:border-box;
    }

    .auth-form input:focus{
        border-color: rgba(233,69,96,0.9);
        box-shadow: 0 0 0 4px rgba(233,69,96,0.06);
    }

    .call-to-action{
        margin-top:8px;
        width:100%;
        padding:12px 18px;
        border-radius:50px;
        border:2px solid var(--secondary-color);
        background: none;
        color: var(--secondary-color);
        font-size:1em;
        cursor:pointer;
    }

    .call-to-action:hover{
        background: var(--secondary-color);
        color: var(--background-dark);
    }

    .auth-footer{ 
        margin-top:14px; 
        color:var(--text-muted); 
    }

    .auth-footer a{ 
        color:var(--text-light); 
        text-decoration:underline 
    }
</style>
