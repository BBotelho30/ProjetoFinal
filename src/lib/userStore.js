import { writable } from 'svelte/store';

// o store guarda os dados do utilizador (null se não estiver logado)
export const user = writable(null);