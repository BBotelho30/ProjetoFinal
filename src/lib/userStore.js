import { writable } from 'svelte/store';

// Este store guardará os dados do utilizador (null se não estiver logado)
export const user = writable(null);