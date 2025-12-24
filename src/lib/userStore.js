import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Criamos o store vazio primeiro (seguro para o servidor)
export const user = writable(null);

// Só corremos a lógica de recuperação se estivermos no browser
if (browser) {
    try {
        const guardado = localStorage.getItem('user');
        if (guardado) {
            // Se houver dados, atualizamos o store
            user.set(JSON.parse(guardado));
        }
    } catch (e) {
        console.error("Erro ao ler user do localStorage", e);
    }

    // Sempre que o utilizador mudar (Login/Logout), atualizamos o localStorage
    user.subscribe((value) => {
        if (value) {
            localStorage.setItem('user', JSON.stringify(value));
        } else {
            localStorage.removeItem('user');
        }
    });
}