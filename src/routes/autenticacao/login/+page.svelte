<script>
  // @ts-nocheck
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { user } from '$lib/userStore';


  let email = '';
  let password = '';
  let loading = false;
  let errorMessage = '';

  async function handleLogin() {
  errorMessage = '';
  loading = true;

  const { data: { session }, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  loading = false;

  if (error || !session) {
    errorMessage = error?.message || 'Erro desconhecido durante o login.';
    return;
  }

  // sincronizar
  const syncRes = await fetch('/api/sync-user', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  // buscar tipo
  const meRes = await fetch('/api/me', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });


  if (!meRes.ok) {
    return;
  }

  const data = await meRes.json();

  // 🔐 guardar o utilizador COMPLETO no store
  user.set({
    id: session.user.id,
    email: session.user.email,
    nome: data.tipo === 'admin'
        ? 'Administrador'
        : session.user.user_metadata?.nome ?? 'Utilizador',
    tipo: data.tipo,
  });

  if (data.tipo === 'admin') {
    goto('/admin');
  } else {
    goto('/');
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

            <button type="submit" class="call-to-action" disabled={loading}>
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
        </form>

        <p class="auth-footer">Ainda não tens conta? <a href="/autenticacao/registo">Registar</a></p>
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

    .auth-footer {
        margin-top: 20px;
        text-align: center;
        color: #888;
    }

    .auth-footer a {
        color: #e0e0e0;
        text-decoration: underline;
    }
</style>