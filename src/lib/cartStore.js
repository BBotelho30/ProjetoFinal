// @ts-nocheck
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const carrinho = writable([]);

let currentUserId = null;

// 🔹 Carregar carrinho do utilizador
function loadCart(userId) {
    if (!browser || !userId) {
        carrinho.set([]);
        return;
    }

    currentUserId = userId;

    const saved = localStorage.getItem(`cart_${userId}`);
    if (saved) {
        carrinho.set(JSON.parse(saved));
    } else {
        carrinho.set([]);
    }
}

// 🔹 Limpar carrinho da memória
function clearCart() {
    currentUserId = null;
    carrinho.set([]);
}

// 🔹 ADICIONAR ITEM AO CARRINHO ✅
function adicionarAoCarrinho(item) {
    carrinho.update((items) => {
        return [...items, item];
    });
}

// 🔹 REMOVER ITEM DO CARRINHO (opcional, mas útil)
function removerDoCarrinho(index) {
    carrinho.update((items) => {
        items.splice(index, 1);
        return [...items];
    });
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

// 👉 EXPORTS DIRETOS (para código antigo não quebrar)
export { adicionarAoCarrinho, removerDoCarrinho };

