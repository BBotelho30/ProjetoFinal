<script>
    import { user } from '$lib/userStore';
    import { goto } from '$app/navigation';

    // proteção simples (client-side)
    $: if ($user === null) {
        goto('/autenticacao/login');
    }
</script>

<slot />
