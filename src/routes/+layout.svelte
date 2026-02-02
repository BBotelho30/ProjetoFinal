<script lang="ts">
    // @ts-nocheck
    import favicon from '$lib/assets/favicon.svg';
    import { user } from '$lib/userStore';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';
    import { carrinho, cartActions } from '$lib/cartStore';


    let { children } = $props();

    // Reatividade para o número de itens e visibilidade do carrinho
    let totalItens = $derived($carrinho?.length || 0);
    
    // Condição para mostrar o carrinho: apenas se houver um utilizador logado
    let mostrarCarrinho = $derived($user !== null);

    async function logout() {
        await supabase.auth.signOut();
        user.set(null);
        cartActions.clearCart();
        goto('/');
    }

    let hideHeader = $derived(
        $page.url.pathname.startsWith('/admin') || 
       
        $page.url.pathname === '/autenticacao/login' ||
        $page.url.pathname === '/autenticacao/registo' ||
        $page.url.pathname === '/(auth)/login' ||
        $page.url.pathname === '/(auth)/registo'
    );

    // Verificar sessão do utilizador ao montar o componente
    onMount(async () => {
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData?.session) {
            user.set(null);
            cartActions.clearCart();
            return;
        }

        const session = sessionData.session;

        // 🔐 ir buscar o tipo ao backend
        const meRes = await fetch('/api/me', {
            headers: {
            Authorization: `Bearer ${session.access_token}`
            }
        });

        if (!meRes.ok) {
            user.set(null);
            return;
        }

        const me = await meRes.json();

        user.set({
            id: session.user.id,
            email: session.user.email,
            nome: me.tipo === 'admin'
            ? 'Administrador'
            : session.user.user_metadata?.nome ?? 'Utilizador',
            tipo: me.tipo,
            foto: null
        });

        cartActions.loadCart(session.user.id);
    });


</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

{#if !hideHeader}
<header class="header">

	<div class="logo">QuickSeat</div>
	<nav class="nav">
		<ul>
			<li><a href={$user ? "/dashboard" : "/"}>Início</a></li>
			<li><a href="/eventos">Eventos</a></li>

            {#if mostrarCarrinho}
                <li class="cart-link">
                    <a href="/carrinho">
                        🛒 Carrinho 
                        {#if totalItens > 0}
                            <span class="cart-badge">{totalItens}</span>
                        {/if}
                    </a>
                </li>
            {/if}

			{#if $user}
			<li><a href="/minhas-reservas">As Minhas Reservas</a></li>
			<li class="user-menu">
				<button class="user-button" on:click={() => goto('/conta')}>
					<div class="avatar">
						{#if $user.foto}
							<img src={$user.foto} alt="Foto de perfil" />
						{:else}
							<span>{ $user?.nome?.[0]?.toUpperCase() ?? '' }</span>
						{/if}
					</div>
					<span class="user-name">{$user.nome}</span>
				</button>
			</li>
			<li><button class="logout-btn" on:click={logout}>Sair</button></li>
			{:else}
			<li><a href="/autenticacao/login">Login</a></li>
			<li><a href="/autenticacao/registo">Registo</a></li>
			{/if}
		</ul>
	</nav>

</header>
{/if}

{@render children()}
<style>
:global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100%;
    background-color: #1a1a2e;
    color: #e0e0e0;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px;
    background-color: #0f3460;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.logo {
    font-size: 1.8em;
    font-weight: bold;
    color: #e0e0e0;
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
    color: #e0e0e0;
    text-decoration: none;
    font-size: 1.1em;
    letter-spacing: 1px;
    transition: 0.3s;
}

.nav a:hover {
    color: #ff0000;
}


.user-greeting {
    color: #e0e0e0;
    font-size: 1.1em;
}

.user-greeting span {
    color: #ff0000;
    font-weight: bold;
}


.logout-btn {
    background: none;
    border: 2px solid #ff0000;
    color: #ff0000;
    padding: 8px 20px;
    border-radius: 50px;
    cursor: pointer;
    font-size: 1.1em;
    transition: 0.3s;
}

.logout-btn:hover {
    background: #ff0000;
    color: #1a1a2e;
}


.user-menu {
    display: flex;
    align-items: center;
}

.user-button {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    color: #e0e0e0;
    cursor: pointer;
    font-size: 1.05em;
    padding: 6px 10px;
    border-radius: 30px;
    transition: 0.3s;
}

.user-button:hover {
    background: rgba(255, 255, 255, 0.1);
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ff0000;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    overflow: hidden;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-name {
    font-weight: 500;
}

.cart-link a {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
    }

.cart-badge {
    background-color: #ff0000;
    color: white;
    font-size: 0.7em;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 50%;
    position: relative;
    top: -8px;
    right: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    animation: pop 0.3s ease-out;
}

@keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.4); }
    100% { transform: scale(1); }
}

.cart-link:hover a {
    color: #ff0000;
}
</style>
