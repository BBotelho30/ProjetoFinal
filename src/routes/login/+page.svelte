<script>
    import { user } from '$lib/userStore'; 
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let errorMessage = '';

    async function handleLogin() {
        errorMessage = '';
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                // Guarda os dados do utilizador no store
                user.set(result.user); 

                // O IF que verifica o tipo de utilizador para redirecionar
                if (result.user.tipo === 'admin') {
                    // Se for admin, vai para a página de gestão
                    goto('/admin');
                } else {
                    // Se for cliente, vai para a página de reservas
                    goto('/dashboard');
                }
                
            } else {
                errorMessage = result.message;
            }
        } catch (error) {
            errorMessage = 'Erro ao ligar ao servidor. Verifica se o MySQL está ativo.';
        }
    }
</script>

<main class="auth-page">
    <div class="auth-card">
        <h1 class="hero-title">Login</h1>
        <p class="hero-tagline">Entra para gerires as tuas reservas.</p>

        {#if errorMessage}
            <p style="color: #ff0000; margin-bottom: 1rem; font-weight: bold;">{errorMessage}</p>
            
        {/if}

        <form on:submit|preventDefault={handleLogin} class="auth-form">
            <label>
                Email
                <input type="email" bind:value={email} required />
            </label>

            <label>
                Palavra-passe
                <input type="password" bind:value={password} required />
            </label>

            <button type="submit" class="call-to-action">Entrar</button>
        </form>

        <p class="auth-footer">Ainda não tens conta? <a href="/registo">Registar</a></p>
    </div>
</main>

<style>
    .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(45deg, #1a1a2e, #0f3460);
    }

    .auth-card {
        background: rgba(10, 10, 20, 0.6);
        padding: 40px;
        border-radius: 12px;
        width: 100%;
        max-width: 400px;
        
    }
    .hero-title { 
        margin-bottom: 10px; 
    }

    .auth-form label { 
        display: block; 
        margin-top: 15px;
    }

    .auth-form input { 
        width: 100%; 
        padding: 12px; 
        margin-top: 5px; 
        border-radius: 8px; 
        border: 1px solid #3f3f5f;
        background: rgba(255,255,255,0.05);
        color: white;
    }

    .call-to-action {
        width: 100%;
        margin-top: 25px;
        padding: 12px;
        font-size: 1.2em;
        border-radius: 50px;
        border: 2px solid #ff0000;
        background: none;
        color: #ff0000;
        cursor: pointer;
    }

    .call-to-action:hover {
        background: #ff0000;
        color: #1a1a2e;
    }
</style>