// @ts-nocheck
import { query } from '$lib/db';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    // Usamos params.id porque a pasta se chama [id]
    const id = params.id; 

    try {
        // 1. Procurar os dados do evento principal
        const eventoReq = await query('SELECT * FROM Eventos WHERE id_eventos = ?', [id]);
        const evento = eventoReq[0];

        if (!evento) {
            throw error(404, 'Evento não encontrado');
        }

        // 2. Procurar as sessões com JOIN para obter o nome da sala
        const sessoes = await query(`
            SELECT es.*, s.nome_sala 
            FROM Eventos_Sala es
            JOIN Sala s ON es.id_sala = s.id_sala
            WHERE es.id_eventos = ?
            ORDER BY es.data_espectaculo ASC, es.hora_inicio ASC
        `, [id]);

        return {
            evento: JSON.parse(JSON.stringify(evento)),
            sessoes: JSON.parse(JSON.stringify(sessoes))
        };
    } catch (err) {
        console.error('Erro ao carregar detalhes:', err);
        throw error(500, 'Erro ao carregar os dados do evento');
    }
}