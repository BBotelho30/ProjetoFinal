<script>
    // @ts-nocheck
    import { user } from '$lib/userStore';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    onMount(() => {
        if (!$user) {
            goto('/login');
        }
    });
</script>

<header class="header">
    <div class="logo">QuickSeat</div>
    <nav class="nav">
        <ul>
            <li><a href="/dashboard">Início</a></li>
            <li><a href="/eventos">Eventos</a></li>
            <li><a href="/minhas-reservas">As Minhas Reservas</a></li>
            
            {#if $user}
                <li class="user-greeting">Bem-vindo, <span>{$user?.nome || 'Utilizador'}</span></li>
                <li><button class="logout-btn" on:click={() => { user.set(null); goto('/'); }}>Sair</button></li>
            {/if}
        </ul>
    </nav>
</header>

<slot />

<footer class="footer">
    <p>&copy; 2025 QuickSeat. Todos os direitos reservados.</p>
</footer>

<style>
    :root {
        --background-dark: #1a1a2e;
        --primary-color: #0f3460;
        --secondary-color: #ff0000;
        --text-light: #e0e0e0;
        --text-muted: #888;
    }

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

    .logo {
        font-size: 1.8em;
        font-weight: bold;
        color: var(--text-light);
    }

    .nav ul {
        list-style: none;
        display: flex;
        align-items: center;
        gap: 30px;
        margin: 0;
        padding: 0;
    }

    .nav a {
        color: var(--text-light);
        text-decoration: none;
        font-size: 1.1em;
        letter-spacing: 1px;
        transition: 0.3s;
    }

    .nav a:hover {
        color: var(--secondary-color);
    }

    .user-greeting {
        color: var(--text-light);
        font-size: 1.1em;
    }

    .user-greeting span {
        color: var(--secondary-color);
        font-weight: bold;
    }

    .logout-btn {
        background: none;
        border: 2px solid var(--secondary-color);
        color: var(--secondary-color);
        padding: 8px 20px;
        border-radius: 50px;
        cursor: pointer;
        font-size: 1.1em;
        transition: 0.3s;
    }

    .logout-btn:hover {
        background: var(--secondary-color);
        color: #1a1a2e;
    }

    .footer {
        background-color: var(--primary-color);
        text-align: center;
        padding: 20px;
        color: var(--text-muted);
        border-top: 2px solid #3f3f5f;
    }
</style>
