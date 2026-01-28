<script lang="ts">
	// @ts-nocheck
	import favicon from '$lib/assets/favicon.svg';
	import { user } from '$lib/userStore';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { children } = $props();

	function logout() {
		user.set(null);
		goto('/');
	}

	// Esconder header em páginas específicas
	let hideHeader = $derived(
		$page.url.pathname.startsWith('/admin') || 
		$page.url.pathname.startsWith('/dashboard') ||
		$page.url.pathname === '/autenticacao/login' ||
		$page.url.pathname === '/autenticacao/registo' ||
		$page.url.pathname === '/(auth)/login' ||
		$page.url.pathname === '/(auth)/registo'
	);
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
			{#if $user}
			<li><a href="/minhas-reservas">As Minhas Reservas</a></li>
				<li class="user-greeting">Olá, <span>{$user.nome}</span></li>
			<li><button class="logout-btn" onclick={logout}>Sair</button></li>
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
</style>
