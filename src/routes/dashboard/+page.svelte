<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { goto } from '$app/navigation';
</script>

<main class="hero-section">
    <div class="hero-content">
        {#if $user}
            <h1 class="hero-title">Olá, {$user?.nome || 'bem-vindo'}!</h1>
            <p class="hero-tagline">Estás na tua área de gestão de reservas.</p>
        {:else}
            <p class="hero-tagline">A carregar o teu perfil...</p>
        {/if}
        
        <div class="dashboard-actions">
            <button class="call-to-action" on:click={() => goto('/eventos')}>
                Ver Eventos Disponíveis
            </button>
        </div>
    </div>
</main>

<style>
    
    :root {
        --background-dark: #1a1a2e; 
        --primary-color: #0f3460;   
        --secondary-color: #ff0000; 
        --text-light: #e0e0e0;
        --text-muted: #888;
    }

    .hero-section {
        flex: 1;
        width: 100%;
        min-height: 85vh;
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .hero-content {
        z-index: 10;
        max-width: 800px;
        padding: 20px;
    }

    .hero-title { 
        font-size: 3.5em; 
        color: var(--text-light); 
        margin-bottom: 20px;
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
    }

    .hero-tagline { 
        font-size: 1.4em; 
        color: var(--text-muted); 
        margin-bottom: 40px; 
    }

    .call-to-action {
        background: none;
        border: 2px solid var(--secondary-color);
        color: var(--secondary-color);
        padding: 15px 40px;
        font-size: 1.2em;
        border-radius: 50px;
        cursor: pointer;
        transition: 0.3s;
    }

    .call-to-action:hover {
        background-color: var(--secondary-color);
        color: var(--background-dark);
    }
</style>