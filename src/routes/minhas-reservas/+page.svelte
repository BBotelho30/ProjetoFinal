<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  type Reserva = {
    id_reserva: number;
    nome_evento: string;
    nome_sala: string;
    id_lugar: number;
    data_reserva: string;
    estado_reserva: string;
  };

    let reservas: Reserva[] = [];
    let loading = true;

  onMount(async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      goto('/autenticacao/login');
      return;
    }

    const res = await fetch('/api/reservas', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    reservas = await res.json();
    loading = false;
  });
</script>

<main class="reservas-page">
  <h1>🎟️ As Minhas Reservas</h1>

  {#if loading}
    <p>A carregar reservas...</p>
  {:else if reservas.length === 0}
    <p class="empty">Ainda não tens reservas.</p>
  {:else}
    <div class="reservas-list">
      {#each reservas as r}
        <div class="reserva-card">
          <h3>{r.nome_evento}</h3>

          <p><strong>Sala:</strong> {r.nome_sala}</p>
          <p><strong>Lugar:</strong> {r.id_lugar}</p>
          <p>
            <strong>Data:</strong>
            {new Date(r.data_reserva).toLocaleDateString('pt-PT')}
          </p>

          <span class="estado {r.estado_reserva}">
            {r.estado_reserva}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</main>

<style>


</style>