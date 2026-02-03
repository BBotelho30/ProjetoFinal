// @ts-nocheck
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const carrinho = writable([]);

let currentUserId = null;

// 🔹 Carregar carrinho do utilizador
function loadCart(userId) {
    if (!browser) return;

    currentUserId = userId;

    if (!userId) {
        return;
    }

    const saved = localStorage.getItem(`cart_${userId}`);
    carrinho.set(saved ? JSON.parse(saved) : []);
}

// 🔹 Limpar carrinho da memória
function clearCart() {
    if (browser && currentUserId) {
        localStorage.removeItem(`cart_${currentUserId}`);
    }
    carrinho.set([]);
}



// 🔹 ADICIONAR ITEM AO CARRINHO ✅
function adicionarAoCarrinho(item) {
    carrinho.update((items) => {
        return [...items, item];
    });
}

// 🔹 REMOVER ITEM DO CARRINHO (opcional, mas útil)
function removerDoCarrinho(id_lugar) {
    carrinho.update((items) =>
        items.filter(item => item.id_lugar !== id_lugar)
    );
}

// 🔹 Guardar automaticamente
if (browser) {
    carrinho.subscribe((items) => {
        if (currentUserId) {
            localStorage.setItem(
                `cart_${currentUserId}`,
                JSON.stringify(items)
            );
        }
    });
}

export const cartActions = {
    loadCart,
    clearCart,
    adicionarAoCarrinho,
    removerDoCarrinho
};

export { adicionarAoCarrinho, removerDoCarrinho, clearCart };
