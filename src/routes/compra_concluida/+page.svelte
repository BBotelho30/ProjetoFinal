<script lang="ts">
  import { onMount } from 'svelte';
  import { cartActions } from '$lib/cartStore';

  onMount(() => {
    // 🧹 Limpa o carrinho APÓS compra concluída
    cartActions.clearCart();
  });
</script>



<main class="success-page">
  <div class="success-card">
    <h1>Compra Concluída!</h1>

    <p class="subtitle">
      Os seus bilhetes foram emitidos com sucesso.
    </p>

    <p class="info">
      📧 Enviámos os bilhetes para o seu email.<br />
      Também pode consultá-los em <strong>As Minhas Reservas</strong>.
    </p>

    <div class="actions">
      <a href="/reservas" class="btn primary">
        Ver as Minhas Reservas
      </a>

      <a href="/eventos" class="btn secondary">
        Voltar aos Eventos
      </a>
    </div>
  </div>
</main>

<style>
  .success-page {
    min-height: 80vh;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #e5e7eb;
  }

  .success-card {
    background: #0f3460;
    padding: 40px;
    border-radius: 16px;
    max-width: 520px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  }

  h1 {
    color: #22c55e;
    font-size: 2rem;
    margin-bottom: 15px;
  }

  .subtitle {
    font-size: 1.1rem;
    margin-bottom: 20px;
  }

  .info {
    font-size: 0.95rem;
    color: #cbd5f5;
    margin-bottom: 30px;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    padding: 12px 22px;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: 0.25s;
  }

  .btn.primary {
    background: #22c55e;
    color: #062e1b;
  }

  .btn.primary:hover {
    background: #16a34a;
  }

  .btn.secondary {
    background: #1a1a2e;
    color: #e5e7eb;
    border: 1px solid #334155;
  }

  .btn.secondary:hover {
    background: #111827;
  }
</style>
