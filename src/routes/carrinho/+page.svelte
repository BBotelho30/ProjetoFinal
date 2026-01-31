<script lang="ts">
    // @ts-nocheck
    import { goto } from '$app/navigation'; 
    import { carrinho, removerDoCarrinho } from '$lib/cartStore';
    export let data;
    
    $: evento = data?.evento || {};
    $: itens = data?.itens || [];

    $: total = itens.reduce((acumulador, objetoAtual) => {
        const valor = Number(objetoAtual.preco) || 0;
        return acumulador + valor;
    }, 0);

    const formatarPreco = (valor) => Number(valor).toFixed(2) + '€';



    $: itensAgrupados = $carrinho.reduce((acc, item) => {
        const chave = `${item.nome_evento}-${item.data}`;
        if (!acc[chave]) acc[chave] = { info: item, lugares: [] };
        acc[chave].lugares.push(item);
        return acc;
    }, {});

    $: totalGeral = $carrinho.reduce((acc, item) => acc + Number(item.preco), 0);
</script>

<main class="cart-page">
    <div class="cart-card">
        <header class="cart-header">
            <h1>CARRINHO DE COMPRAS</h1>
        </header>

        <div class="cart-table-wrapper">
            <table class="cart-table">
                {#each Object.values(itensAgrupados) as grupo}
                    <tbody>
                        <tr class="event-summary">
                            <td colspan="3">
                                <div class="event-flex">
                                    <img src={grupo.info.imagem} alt="Cartaz" />
                                    <div class="details">
                                        <strong>{grupo.info.nome_evento}</strong>
                                        <span>{grupo.info.nome_sala}</span>
                                        <span>{grupo.info.data} | {grupo.info.hora.slice(0,5)}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        {#each grupo.lugares as lugar}
                            <tr class="item-row">
                                <td>Bilhete: Fila {lugar.fila}, Lugar {lugar.num}</td>
                                <td class="text-center">{lugar.zona}</td>
                                <td class="text-right">
                                    {Number(lugar.preco).toFixed(2)}€
                                    <button class="btn-delete" on:click={() => removerDoCarrinho(lugar.id_lugar)}>🗑️</button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                {/each}
            </table>
        </div>

        <div class="total-bar">
            <span>TOTAL</span>
            <span>{totalGeral.toFixed(2)}€</span>
        </div>

        <div class="cart-actions">
            <button class="btn-dark" on:click={() => goto('/eventos')}>MAIS COMPRAS</button>
            <button class="btn-success" on:click={() => goto('/finalizacaoCompra')}>FINALIZAR COMPRA</button>
        </div>
    </div>
</main>

<style>
    /* Cores do projeto aplicadas ao fundo */
    .cart-page { 
        background: linear-gradient(45deg, #1a1a2e, #0f3460); 
        min-height: 100vh; 
        padding: 60px 20px; 
        color: #333; 
        font-family: sans-serif; 
    }

    .cart-card { 
        max-width: 1000px; 
        margin: 0 auto; 
        background: white; 
        padding: 40px; 
        border-radius: 12px; 
        box-shadow: 0 15px 35px rgba(0,0,0,0.4); 
    }
    
    .cart-header h1 { 
        font-size: 2rem; 
        border-bottom: 3px solid #ff0000; /* Destaque em vermelho do projeto */
        margin: 0; 
        padding-bottom: 10px; 
        color: #1a1a2e;
        font-weight: 800;
    }
    
    .cart-header p { font-size: 0.9rem; color: #666; margin-top: 10px; font-weight: bold; }

    .cart-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    .cart-table th { background: #1a1a2e; color: white; padding: 15px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    
    .event-flex { display: flex; gap: 20px; padding: 20px; background: #f8f9fa; border-bottom: 2px solid #eee; }
    .event-flex img { width: 90px; height: 130px; object-fit: cover; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .details { display: flex; flex-direction: column; gap: 6px; justify-content: center; }
    .details strong { font-size: 1.4rem; color: #1a1a2e; }
    .details span { color: #555; font-weight: 500; }

    .item-row td { padding: 18px; border-bottom: 1px solid #eee; font-size: 1rem; color: #444; }
    .text-right { text-align: right; font-weight: bold; }
    .text-center { text-align: center; }

    .total-bar { 
        background: #1a1a2e; 
        color: white; 
        display: flex; 
        justify-content: space-between; 
        padding: 20px 30px; 
        font-weight: bold; 
        font-size: 1.6rem; 
        margin-top: 5px;
        border-radius: 0 0 8px 8px;
    }

    .cart-actions { display: flex; justify-content: flex-end; margin-top: 40px; }
    
    .main-buttons { display: flex; gap: 15px; }
    
    .btn-dark { 
        background: #1a1a2e; 
        color: white; 
        border: none; 
        padding: 15px 25px; 
        cursor: pointer; 
        font-weight: bold; 
        border-radius: 8px;
        transition: 0.3s;
    }
    
    .btn-success { 
        background: #ff0000; /* Vermelho vibrante do projeto */
        color: white; 
        border: none; 
        padding: 15px 35px; 
        cursor: pointer; 
        font-weight: bold; 
        font-size: 1.1rem; 
        border-radius: 8px;
        transition: 0.3s;
    }

    .btn-dark:hover { background: #000; transform: translateY(-2px); }
    .btn-success:hover { background: #cc0000; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3); }

    @media (max-width: 768px) {
        .cart-actions { justify-content: center; }
        .main-buttons { flex-direction: column; width: 100%; }
        .event-flex { flex-direction: column; align-items: center; text-align: center; }
    }
</style>