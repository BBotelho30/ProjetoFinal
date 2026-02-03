<script>
    // @ts-nocheck
    import { goto } from '$app/navigation';
</script>

<main class="admin-dashboard">
    <div class="welcome-text">
        <h1>Olá, Administrador!</h1>
        <p>O que deseja fazer hoje?</p>
    </div>

    <div class="cards-container">
        <button class="admin-card" on:click={() => goto('/admin/salas')}>
            <div class="icon">🏢</div>
            <h2>Gestão de Salas de Eventos</h2>
            <div class="plus-sign">+</div>
        </button>

        <button class="admin-card" on:click={() => goto('/admin/adiciona_espetaculo')}>
            <div class="icon">🎭</div>
            <h2>Adicionar Evento</h2>
            <div class="plus-sign">+</div>
        </button>

        <button class="admin-card" on:click={() => goto('/admin/salas/adicionar_salas')}>
            <div class="icon">🎟️</div>
            <h2>Adicionar Sala de Eventos</h2>
            <div class="plus-sign">+</div>
        </button>
        
        <div class="admin-card disabled">
            <div class="icon">📊</div>
            <h2>Ver Estatísticas</h2>
            <span class="status-tag">Em Breve</span>
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

    /* PAINEL DE CARTÕES  */
    .admin-dashboard {
        padding: 60px 20px;
        min-height: 100vh;
        background: linear-gradient(45deg, var(--background-dark), var(--primary-color));
        color: white;
        text-align: center;
    }

    .welcome-text h1 { 
        font-size: 3em; 
        margin-bottom: 10px; 
        color: var(--text-light); 
    }

    .welcome-text p { 
        color: var(--text-muted); 
        margin-bottom: 50px; 
        font-size: 1.2em; }

    .cards-container {
        display: flex;
        justify-content: center;
        gap: 30px;
        flex-wrap: wrap;
        z-index: 10;
        position: relative;
    }

    /* Cartões brancos  */
    .admin-card {
        background: white;
        border: none;
        border-radius: 20px;
        width: 280px;
        height: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 80px 20px;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .admin-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 30px var(--primary-color);
    }

    .admin-card h2 { 
        color: var(--background-dark); 
        font-size: 1.3em;
         margin: 0; 
         font-weight: bold; 
        }

    .icon { 
        font-size: 4em; 
    }

    .plus-sign { 
        font-size: 4em; 
        color: #ddd; 
        line-height: 1; 
        font-weight: 200; 
    }

    /* Cartão Desativado */
    .admin-card.disabled {
        background: rgba(255, 255, 255, 0.1);
        border: 1px dashed #555;
        cursor: not-allowed;
        box-shadow: none;
    }

    .admin-card.disabled h2, .admin-card.disabled .icon {
        opacity: 0.3; 
        color: white; 
    }

    .status-tag { 
        background: #333; 
        color: #888; 
        padding: 5px 15px; 
        border-radius: 5px; 
    }
</style>