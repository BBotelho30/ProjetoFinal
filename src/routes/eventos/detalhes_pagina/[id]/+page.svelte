<script>
    // @ts-nocheck
    import { goto } from '$app/navigation';
    import { 
        format, 
        startOfMonth, 
        endOfMonth, 
        startOfWeek, 
        endOfWeek, 
        eachDayOfInterval, 
        isSameMonth, 
        isSameDay, 
        addMonths, 
        subMonths,
        isBefore,
        parseISO 
    } from 'date-fns';

    import { pt } from 'date-fns/locale'; // Para meses em português
    import { user } from '$lib/userStore';

    export let data;
    const { evento, sessoes } = data;
    const hoje = new Date();
    const inicioMesAtual = startOfMonth(hoje);

    let dataReferencia = new Date(); // Usamos um objeto Date único para controlar o mês/ano
    let diaSelecionado = null;

    // Formata a data lateral usando date-fns
    function formatarDataSessao(dataStr) {
        const d = parseISO(dataStr);
        return {
            dia: format(d, 'dd'),
            mes: format(d, 'MMM', { locale: pt }).toUpperCase(),
            semana: format(d, 'eee', { locale: pt }).toUpperCase()
        };
    }

    // Gera os dias do calendário com base na data de referência
    function gerarCalendario(refDate) {
        const inicioMes = startOfMonth(refDate);
        const fimMes = endOfMonth(refDate);

        const dataInicio = startOfWeek(inicioMes, { weekStartsOn: 0 });
        const dataFim = endOfWeek(fimMes, { weekStartsOn: 0 });

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dias = eachDayOfInterval({ start: dataInicio, end: dataFim });

        return dias.map(d => {
            const temSessoes = sessoes.some(s =>
                isSameDay(parseISO(s.data_espectaculo), d)
            );

            return {
                data: d,
                diaNumero: format(d, 'd'),
                ativo:
                    temSessoes &&
                    isSameMonth(d, inicioMes) &&
                    d >= hoje,

                isAtual: isSameMonth(d, inicioMes),
                isHoje: isSameDay(d, hoje)
            };
        });
    }


    function selecionarDia(diaObj) {
        if (diaObj.ativo) {
            diaSelecionado = diaObj.data;
        }
    }

    function sessoesDoDia(dataAlvo) {
        if (!dataAlvo) return [];
        return sessoes.filter(s => isSameDay(parseISO(s.data_espectaculo), dataAlvo));
    }

    function proximoMes() { dataReferencia = addMonths(dataReferencia, 1); diaSelecionado = null; }
    function mesAnterior() {
        const anterior = subMonths(dataReferencia, 1);

        if (
            anterior.getFullYear() < hoje.getFullYear() ||
            (anterior.getFullYear() === hoje.getFullYear() &&
            anterior.getMonth() < hoje.getMonth())
        ) {
            return; // ❌ bloqueia
        }

        dataReferencia = anterior;
        diaSelecionado = null;
    }

    function voltar() { window.history.back(); }

    function irParaCompra(sessao) {
        const agora = new Date();
        const dataSessao = new Date(`${sessao.data_espectaculo}T${sessao.hora_inicio}`);

        if (dataSessao <= agora) {
            alert('Esta sessão já não está disponível.');
            return;
        }

        if (!$user) {
            goto('/autenticacao/login');
        } else {
            goto(`/salas_compra/${sessao.id_sala}?evento=${sessao.id_eventos}`);
        }
    }



    const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

    // Reatividade do Svelte
    $: diasCalendario = gerarCalendario(dataReferencia);
    $: nomeMesAtual = format(dataReferencia, 'MMMM yyyy', { locale: pt }).toUpperCase();
    $: podeVoltarMes = !isBefore(
        startOfMonth(subMonths(dataReferencia, 1)),
        inicioMesAtual
    );
    
</script>

<main class="hero-section">
    <div class="form-container">
        <button type="button" class="close-btn" on:click={voltar}>&times;</button>
        
        <section class="event-header">
            <div class="poster-box">
                <img src={evento.imagem_cartaz || '/placeholder.jpg'} alt={evento.nome_evento} />
            </div>
            
            <div class="main-details">
                <h1>{evento.nome_evento}</h1>

                <div class="tag-wrapper">
                    <span class="category-tag">
                        {evento.tipo_espectaculo || 'ESPETÁCULO'}
                    </span>
                </div>

                <div class="meta-info">
                    <p><strong>Classificação:</strong> M/06 anos</p>
                    <p><strong>Duração:</strong> {sessoes[0]?.duracao || '--'} horas</p>
                </div>
            </div>  
        </section>

    <!-- CALENDÁRIO E SESSÕES LADO A LADO -->
    <div class="calendar-wrapper">
            <!-- CALENDÁRIO -->
            <div class="calendar-container">
                <div class="calendar-header">
                    {#if podeVoltarMes}
                        <button on:click={mesAnterior} class="nav-btn">&lt;</button>
                    {:else}
                        <div class="nav-btn placeholder"></div>
                    {/if}

                    <h3>{nomeMesAtual}</h3>

                    <button on:click={proximoMes} class="nav-btn">&gt;</button>
                </div>


                <div class="calendar-weekdays">
                    {#each diasSemana as dia}
                        <div class="weekday">{dia}</div>
                    {/each}
                </div>

                <div class="calendar-days">
                    {#each diasCalendario as diaObj}
                        <button 
                            class="calendar-day"
                            class:ativo={diaObj.ativo}
                            class:selecionado={diaSelecionado && isSameDay(diaObj.data, diaSelecionado)}
                            class:inativo={!diaObj.isAtual}
                            on:click={() => selecionarDia(diaObj)}
                            disabled={!diaObj.ativo}
                        >
                            {diaObj.diaNumero}
                        </button>
                    {/each}
                </div>
            </div>

            {#if diaSelecionado}
                <div class="sessoes-selecionadas sessoes-container">
                    <h3>Sessões de {format(diaSelecionado, "dd 'de' MMMM", { locale: pt })}</h3>
                    
                    <div class="sessions-list">
                        {#each sessoesDoDia(diaSelecionado) as sessao}
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
                                </div>

                                <div class="action-box">
                                    <button class="buy-now-btn" on:click={() => irParaCompra(sessao)}>
                                        COMPRAR
                                    </button>
                                    <small class="price-range">Bilhetes disponíveis</small>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {:else}
                <div class="sessoes-vazio sessoes-container">
                    <p>Escolha uma data marcada a verde no calendário.</p>
                </div>
            {/if}
        </div>
        
        <section class="descricao-section">
            <h2>Descrição</h2>
            <p class="descricao-text">
                {evento.descricao || 'Sem descrição disponível.'}
            </p>
        </section>

    </div>
</main>




<style>
    :root {
        --primary-color: #0f3460;
        --secondary-color: #ff0000;
        --background-dark: #1a1a2e;
        --text-light: #e0e0e0;
        --text-muted: #888;
        --card-bg: #16213e;
    }

    .hero-section {
        min-height: 100vh;
        background: linear-gradient(
            45deg,
            var(--background-dark),
            var(--primary-color)
        );
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }


    .form-container {
        background: rgba(22, 33, 62, 0.96);
        padding: 40px;
        border-radius: 15px;
        width: 100%;
        max-width: 1000px;
        border: 1px solid rgba(79, 102, 150, 0.4);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        position: relative;
    }

    .close-btn {
        position: absolute;
        top: 10px;
        right: 20px;
        background: none;
        border: none;
        color: white;
        font-size: 3em;
        cursor: pointer;
        z-index: 10;
        transition: 0.3s ease;
    }

    .close-btn:hover {
        color: #ff0000;
        transform: rotate(90deg);
    }

    .event-header { 
        display: flex; 
        gap: 40px; 
        margin-bottom: 60px; 
    }

    .poster-box img { 
        width:200px; 
        border-radius: 4px; 
        box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
    }

    .tag-wrapper {
        margin: 17px 0 10px 0;
    }
    
    .category-tag { 
        display: inline-block;
        background: #ff0000;
        padding: 4px 12px;
        font-size: 0.8em;
        font-weight: bold;
        color: #1a1a1a;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .main-details {
        flex: 1;
    }

    .main-details h1 {
        font-size: 2.7em;
        margin: 0 10px 10px 0;
        color: white;
        letter-spacing: 1px;
    }

    .meta-info p { 
        margin: 8px 0; 
        color: #b0b0b0; 
        font-size: 1.1em; 
    }

    /* descrição do evento */
    .descricao-section {
        margin-top: 60px;
        padding-top: 10px;
        border-top: 2px solid rgba(255, 255, 255, 0.15);
    }

    .descricao-section h2 {
        font-size: 1.8em;
        margin-bottom: 10px;
        color: white;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .descricao-text {
        font-size: 1.1em;
        line-height: 1.8;
        color: #cbd5e1;
        white-space: pre-line;
        max-width: 100%;
    }


    .session-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 25px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
        gap: 20px;
    }

    .nav-btn.placeholder {
        visibility: hidden;
    }


    .calendar-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid #ddd;
        background: #f0f0f0;
        min-width: 65px;
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
        color: #1a1f3a; 
    }

    .week-day { 
        font-size: 0.8em; 
        text-transform: uppercase; 
        color: #1a1f3a; 
        margin-bottom: 5px; 
    }

    .hour-label { 
        border-top: 1px solid #eee; 
        width: 100%; 
        text-align: center; 
        padding: 5px 0; 
        font-weight: bold;
        color: #1a1f3a; 
    }

    .venue-info {
        flex: 1; 
        display: flex;
        align-items: center;
        padding-left: 10px;
    }

    .venue-info h3 {
        font-size: 1.4em;
        margin: 0;
        text-transform: uppercase;
        color: white;
        border: none !important;
    }

    .action-box {
        display: flex;
        flex-direction: column;
        align-items: center; 
        min-width: 150px; 
    }

    .buy-now-btn {
        width: 80%; 
        background: #ff0000;
        color: #1a1f3a;
        border: none;
        padding: 12px 20px;
        font-weight: bold;
        font-size: 1.1em;
        border-radius: 6px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .price-range { 
        display: block; 
        margin-top: 5px; 
        font-size: 0.8em; 
        color: #999;
        text-align: center;
    }


    .calendar-wrapper {
        display: flex;
        gap: 30px;
        margin-top: 40px;
        align-items: flex-start; 
        max-height: 600px; 
    }

    .calendar-container {
        flex: 0 0 320px;
        position: sticky;
        top: 20px;
    }

    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        color: #fff;
    }

    .calendar-header h3 {
        margin: 0;
        font-size: 1.2em;
    }

    .nav-btn {
        background: #ff0000;
        color: #1a1f3a;
        border: none;
        padding: 5px 10px;
        font-size: 1em;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    }

    .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 3px;
        margin-bottom: 8px;
    }

    .weekday {
        text-align: center;
        color: #b0b0b0;
        font-weight: bold;
        padding: 5px 0;
        font-size: 0.75em;
    }

    .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 3px;
    }

    .calendar-day {
        aspect-ratio: 1;
        border: 1px solid #555;
        background: transparent;
        color: #b0b0b0;
        cursor: pointer;
        border-radius: 5px;
        font-weight: bold;
        transition: all 0.3s ease;
        font-size: 0.85em;
        padding: 0;
    }

    .calendar-day:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
    }

    .calendar-day.ativo {
        background: #a8d968;
        color: #1a1a1a;
        border-color: #a8d968;
        cursor: pointer;
    }

    .calendar-day.selecionado {
        background: #ff0000;
        color: #1a1f3a;
        border-color: #ff0000;
    }

    .calendar-day.inativo {
        color: #555;
        cursor: default;
    }

    .calendar-day:disabled {
        cursor: default;
    }

    .sessoes-container {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 30px;
        height: fit-content; 
        min-height: 120px; 
        align-self: flex-start; 
    }

    .sessoes-selecionadas {
        display: flex;
        flex-direction: column; 
    }

    .sessoes-selecionadas h3 {
        margin-top: 0;
        margin-bottom: 25px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .sessoes-vazio {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .sessoes-vazio p {
        color: #b0b0b0;
        font-size: 1.3em;
        text-align: center;
        margin: 0;
    }

    .sessions-list {
        max-height: 500px; /* Ajusta conforme o design (deve ser similar à altura do calendário) */
        overflow-y: auto; /* Ativa o scroll vertical */
        padding-right: 15px; /* Espaço para a barra de scroll não tapar o botão */
    }

    /* Personalização da barra de scroll para ficar elegante */
    .sessions-list::-webkit-scrollbar {
        width: 6px;
    }

    .sessions-list::-webkit-scrollbar-thumb {
        background-color: #e2e8f0; /* Cor "Branco Sujo" / Cinza claro */
        border-radius: 10px;
        border: 1px solid rgba(0, 0, 0, 0.1); /* Dá um pouco de definição */
    }

    .sessions-list::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 5px;
    }

    .sessions-list::-webkit-scrollbar-thumb:hover {
        background-color: #f1f5f9; /* Brilha um pouco mais ao passar o rato */
    }

    /* Container para calendário + sessões lado a lado */
    .sessions-area > .calendar-container {
        display: none;
    }

    .sessions-area::after {
        content: '';
    }

    .sessions-area {
        display: flex;
        gap: 20px;
        margin-top: 40px;
    }

    .sessions-area .calendar-container {
        display: block;
    }

    .sessions-area .sessoes-selecionadas {
        margin-left: 0;
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

        
    }
</style>