<script lang="ts">
    import { carrinho } from '$lib/cartStore';
    import { goto } from '$app/navigation';
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';

    let accessToken = $state('');

    onMount(async () => {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        goto('/autenticacao/login');
    }
    });

    type Perfil = {
        nome?: string;
        email?: string;
        telefone?: string;
        pais?: string;
        distrito?: string;
        morada?: string;
    };

    type ItemCarrinho = {
        preco?: number | string;
    };

    const { data } = $props<{ perfil?: Perfil }>();

    let perfil: Perfil = data?.perfil ?? {};

    const total = $derived.by(() => {
        return Array.isArray($carrinho)
        ? ($carrinho as ItemCarrinho[]).reduce(
            (s, i) => s + Number(i.preco ?? 0),
            0
            )
        : 0;
    });

    $effect(() => {
        if ($carrinho.length === 0) {
        if (typeof window !== 'undefined') {
            goto('/eventos');
        }
        }
    });
    
    </script>

    <main class="checkout-page">
        <form method="POST" action="?/finalizarReserva" >
            <input type="hidden" name="itens" value={JSON.stringify($carrinho)} />

            <div class="checkout-container">
                <div class="form-column">
                    <section class="section-card">
                        <h2>1. Dados de Contacto</h2>
                        <div class="grid-inputs">
                            <div class="field">
                                <label>Nome *</label>
                                <input type="text" name="nome" required value={perfil?.nome || ''} />
                            </div>
                            <div class="field">
                                <label>Apelido *</label>
                                <input type="text" name="apelido" required />
                            </div>
                        </div>

                        <div class="field">
                            <label>Email *</label>
                            <input type="email" name="email" required value={perfil?.email || ''} />
                        </div>

                        <div class="field">
                        <label>Telefone *</label>
                        <input type="tel" name="telefone" required value={perfil.telefone || ''} />
                        </div>

                    <div class="grid-inputs">
                        <div class="field">
                            <label>País *</label>
                            <input type="text" name="pais" required value={perfil.pais} />
                        </div>
                        <div class="field">
                            <label>Distrito *</label>
                            <input type="text" name="distrito" required value={perfil.distrito || ''} />
                        </div>
                    </div>

                        <div class="field">
                            <label>Morada (Opcional)</label>
                            <input type="text" name="morada" />
                        </div>
                    </section>

                    <section class="section-card billing">
                        <h2>2. Dados de Faturação (Opcional)</h2>
                        <p class="info-text">Deixe em branco se não desejar NIF na fatura.</p>
                        <div class="field">
                            <label>Nome na Fatura</label>
                            <input type="text" name="fatura_nome" />
                        </div>
                        <div class="grid-inputs">
                            <div class="field">
                                <label>NIF</label>
                                <input type="text" name="fatura_nif" maxlength="9" />
                            </div>
                            <div class="field">
                                <label>Morada de Faturação</label>
                                <input type="text" name="fatura_morada" />
                            </div>
                        </div>
                    </section>
                </div>

                <aside class="summary-column">
                    <div class="summary-card">
                        <h2>Resumo</h2>
                        <div class="summary-details">
                            <p>Total de Bilhetes: <span>{$carrinho.length}</span></p>
                            <hr />
    <p class="total">Total a Pagar: <span>{total.toFixed(2)}€</span></p>                    </div>
                        <button type="submit" class="btn-confirm">CONFIRMAR E PAGAR</button>
                        <a href="/carrinho" class="btn-back">Voltar ao Carrinho</a>
                    </div>
                </aside>
            </div>
        </form>
    </main>

    <style>
        .checkout-page { padding: 40px; max-width: 1100px; margin: 0 auto; color: #e0e0e0; }
        .checkout-container { display: grid; grid-template-columns: 1fr 350px; gap: 30px; }
        .section-card { background: #0f3460; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        h2 { color: #ff0000; font-size: 1.4rem; margin-bottom: 20px; border-bottom: 1px solid #16213e; padding-bottom: 10px; }
        .grid-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .field { margin-bottom: 15px; display: flex; flex-direction: column; }
        label { font-size: 0.85rem; margin-bottom: 5px; color: #94a3b8; }
        input { padding: 12px; border-radius: 6px; border: 1px solid #16213e; background: #1a1a2e; color: white; transition: 0.3s; }
        input:focus { border-color: #ff0000; outline: none; }
        .info-text { font-size: 0.8rem; color: #94a3b8; margin-bottom: 15px; }
        
        .summary-card { background: #16213e; padding: 25px; border-radius: 12px; position: sticky; top: 100px; border: 1px solid #0f3460; }
        .total { font-size: 1.5rem; font-weight: bold; margin-top: 10px; }
        .total span { color: #22c55e; }
        .btn-confirm { width: 100%; background: #22c55e; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1.1em; margin-top: 20px; transition: 0.3s; }
        .btn-confirm:hover { background: #16a34a; transform: translateY(-2px); }
        .btn-back { display: block; text-align: center; margin-top: 15px; color: #94a3b8; text-decoration: none; font-size: 0.9em; }
    </style>