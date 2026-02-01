// @ts-nocheck
import { query } from '$lib/db';
import { error } from '@sveltejs/kit';

export async function load({ params, url }) {
    const id_sala = params.id_sessao; 
    const id_evento = url.searchParams.get('evento');

    try {
        // 1. Buscar detalhes da Sessão e Sala
        // Nota: Se a coluna svg_code não estiver na tabela Sala, garante que a adicionaste via ALTER TABLE
        const sessaoRes = await query(`
            SELECT 
                s.id_sala, s.nome_sala, s.svg_code,
                es.hora_inicio, es.data_espectaculo,
                e.id_eventos, e.nome_evento, e.imagem_cartaz
            FROM Sala s
            JOIN Eventos_Sala es ON s.id_sala = es.id_sala
            JOIN Eventos e ON es.id_eventos = e.id_eventos
            WHERE s.id_sala = ? AND e.id_eventos = ?
        `, [id_sala, id_evento]);

        if (sessaoRes.length === 0) throw error(404, 'Sessão não encontrada');
        const sessao = sessaoRes[0];

        // 2. Buscar Lugares, Zonas e os Preços específicos deste evento
        const lugares = await query(`
            SELECT 
                l.id_lugar, l.fila, l.coluna as num, 
                l.coordenadas_x as x, l.coordenadas_y as y, 
                z.nome_zona as zona,
                z.coordenadas as config_tecnica,
                COALESCE(pez.preco, 0) as preco,
                CASE WHEN r.id_reserva IS NOT NULL THEN 'ocupado' ELSE 'livre' END AS estado
            FROM Lugar l
            JOIN Zona z ON l.id_zona = z.id_zona
            LEFT JOIN Preco_Evento_Zona pez ON z.id_zona = pez.id_zona AND pez.id_eventos = ?
            LEFT JOIN Reserva r ON l.id_lugar = r.id_lugar AND r.id_evento = ? AND r.estado_reserva != 'cancelada'
            WHERE l.id_sala = ?
        `, [id_evento, id_evento, id_sala]);

        return {
            sessao: JSON.parse(JSON.stringify(sessao)),
            lugares: JSON.parse(JSON.stringify(lugares))
        };
    } catch (err) {
        console.error("ERRO SQL:", err);
        throw error(500, 'Erro ao carregar mapa da sala');
    }
}