// @ts-nocheck
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Recupera os dados do localStorage
const dadosIniciais = browser && localStorage.getItem('meu_carrinho') 
    ? JSON.parse(localStorage.getItem('meu_carrinho')) 
    : [];

// cria a store com os dados recuperados
//writable é usado para criar uma store que pode ser lida e escrita
export const carrinho = writable(dadosIniciais);

// Sempre que a store mudar, grava no localStorage
if (browser) {
    carrinho.subscribe((valor) => {
        localStorage.setItem('meu_carrinho', JSON.stringify(valor));
    });
}

// Função para adicionar itens
export function adicionarAoCarrinho(novoItem) {
    carrinho.update(itens => {
        const existe = itens.find(i => i.id_lugar === novoItem.id_lugar && i.id_sessao === novoItem.id_sessao);
        if (existe) return itens;
        return [...itens, novoItem];
    });
}

// Função para remover itens
export function removerDoCarrinho(idLugar) {
    carrinho.update(itens => itens.filter(i => i.id_lugar !== idLugar));
}

// Função para limpar tudo (útil após o pagamento final)
export function limparCarrinho() {
    carrinho.set([]);
}