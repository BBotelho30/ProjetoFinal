// @ts-nocheck
import { query } from '$lib/db';
import { error } from '@sveltejs/kit';

export async function load({ params, url }) {
    const id_sala = params.id_sessao;
    const id_evento = url.searchParams.get('evento');

    // Buscar dados da sessão e sala
    try {
        const sessaoRes = await query(`
            SELECT 

                s.id_sala,
                s.nome_sala,
                s.svg_code,

                es.hora_inicio,
                es.data_espectaculo,

                e.nome_evento,
                e.imagem_cartaz
            FROM Sala s
            JOIN Eventos_Sala es ON s.id_sala = es.id_sala
            JOIN Eventos e ON es.id_eventos = e.id_eventos
            WHERE s.id_sala = ? AND e.id_eventos = ?
        `, [id_sala, id_evento]);


        // Verificar se a sessão existe
        if (sessaoRes.length === 0) throw error(404, 'Sessão não encontrada');

        const lugares = await query(`
            SELECT 
                l.id_lugar, 
                l.fila, 
                l.coluna as num, 
                l.coordenadas_x as x, 
                l.coordenadas_y as y, 
                l.id_zona,
                z.nome_zona as zona,
                z.preco_base as preco
            FROM Lugar l
            JOIN Zona z ON l.id_zona = z.id_zona
            WHERE l.id_sala = ?
        `, [id_sala]);

        // Retornar os dados
        return {
            sessao: JSON.parse(JSON.stringify(sessaoRes[0])),
            lugares: JSON.parse(JSON.stringify(lugares))
        };
    } catch (err) {
        console.error(err);
        throw error(500, 'Erro ao carregar mapa da sala');
    }
}