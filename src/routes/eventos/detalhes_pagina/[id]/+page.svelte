<script>
    // @ts-nocheck
    import { goto } from '$app/navigation';
    export let data;
    const { evento, sessoes } = data;

    // Função para formatar a data no estilo "calendário" lateral
    function formatarDataSessao(dataStr) {
        const d = new Date(dataStr);
        const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
        
        return {
            dia: d.getDate().toString().padStart(2, '0'),
            mes: meses[d.getMonth()],
            semana: diasSemana[d.getDay()]
        };
    }

    function irParaCompra(sessao) {
        // Redireciona para o mapa de lugares da sala
        goto(`/salas_compra/${sessao.id_sala}?evento=${sessao.id_eventos}`);    }
</script>

<main class="page-container">
    <section class="event-header">
        <div class="poster-box">
            <img src={evento.imagem_cartaz || '/placeholder.jpg'} alt={evento.nome_evento} />
        </div>
        
        <div class="main-details">
            <span class="category-tag">{evento.tipo_espectaculo || 'ESPETÁCULO'}</span>
            <h1>{evento.nome_evento}</h1>
            
            <div class="meta-info">
                <p><strong>Classificação:</strong> M/06 anos</p>
                <p><strong>Duração:</strong> {sessoes[0]?.duracao || '--'} min. s/ intervalo</p>
            </div>
        </div>
    </section>

    <section class="sessions-area">
        <h2 class="section-title">SESSÕES</h2>
        
        <div class="sessions-list">
            {#each sessoes as sessao}
                {@const d = formatarDataSessao(sessao.data_espectaculo)}
                <div class="session-item">
                    <div class="calendar-card">
                        <span class="month-label">{d.mes}</span>
                        <span class="day-number">{d.dia}</span>
                        <span class="week-day">{d.semana}</span>
                        <span class="hour-label">{sessao.hora_inicio.slice(0, 5)}</span>
                    </div>

                    <div class="venue-info">
                        <h3>{sessao.nome_sala}</h3>
                        <p>Portugal</p>
                    </div>

                    <div class="action-box">
                        <button class="buy-now-btn" on:click={() => irParaCompra(sessao)}>
                            COMPRAR
                        </button>
                        <small class="price-range">Bilhetes disponíveis</small>
                    </div>
                </div>
            {:else}
                <p class="empty-msg">Não existem sessões agendadas para este evento.</p>
            {/each}
        </div>
    </section>

    <section class="description-area">
        <h2 class="section-title">DESCRIÇÃO</h2>
        <div class="content">
            {evento.descricao || 'Sem descrição disponível.'}
        </div>
    </section>
</main>

<style>
    .page-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 40px 20px;
        font-family: 'Inter', sans-serif;
        color: #1a1a1a;
        background: white;
    }

    .event-header { 
        display: flex; 
        gap: 40px; 
        margin-bottom: 60px; 
    }

    .poster-box img { 
        width: 300px; 
        border-radius: 4px; 
        box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
    }
    
    .category-tag { 
        background: #f0f0f0; 
        padding: 4px 12px; 
        font-size: 0.75em; 
        font-weight: bold; 
    }

    .main-details h1 { 
        font-size: 2.8em; 
        margin: 15px 0; 
        font-weight: 800; 
        line-height: 1.1; 
        color: #222; 
    }

    .meta-info p { 
        margin: 8px 0; 
        color: #555; 
        font-size: 1.1em; 
    }

    .section-title {
        font-size: 1.8em;
        border-bottom: 2px solid #1a1a1a;
        padding-bottom: 10px;
        margin-bottom: 30px;
        font-weight: 700;
    }

    .session-item {
        display: flex;
        align-items: center;
        padding: 20px 0;
        border-bottom: 1px solid #eee;
        gap: 25px;
    }

    .calendar-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid #ddd;
        min-width: 80px;
    }
    .month-label { 
        background: #cc0000; 
        color: white; 
        width: 100%; 
        text-align: center; 
        font-size: 0.8em; 
        font-weight: bold; 
        padding: 2px 0; 
    }

    .day-number { 
        font-size: 1.8em; 
        font-weight: bold; 
        margin: 5px 0; 
    }

    .week-day { 
        font-size: 0.7em; 
        text-transform: uppercase; 
        color: #777; 
        margin-bottom: 5px; 
    }

    .hour-label { 
        border-top: 1px solid #eee; 
        width: 100%; 
        text-align: center; 
        padding: 5px 0; 
        font-weight: bold; 
    }

    .venue-info { 
        flex-grow: 1; 
    }

    .venue-info h3 { 
        font-size: 1.2em; 
        margin: 0; 
    }

    .buy-now-btn {
        background: #000;
        color: white;
        border: none;
        padding: 10px 30px;
        font-weight: bold;
        border-radius: 2px;
        cursor: pointer;
    }
    .price-range { 
        display: block; 
        margin-top: 5px; 
        font-size: 0.8em; 
        color: #999; 
    }

    .description-area .content { 
        line-height: 1.7; 
        font-size: 1.1em; 
        white-space: pre-line; 
    }

    .empty-msg { 
        color: #888; 
        font-style: italic; 
    }

    @media (max-width: 768px) {
        .event-header { 
            flex-direction: column; 
            text-align: center; 
        }

        .poster-box img { 
            width: 100%; 
            max-width: 300px; 
        }

        .session-item { 
            flex-direction: column; 
            text-align: center; 
        }
    }
</style>