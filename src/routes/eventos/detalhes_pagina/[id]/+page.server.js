// @ts-nocheck
import { query } from '$lib/db';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
    const id = params.id; 

    if (!id || id === 'undefined') {
        throw error(400, 'ID do evento inválido ou não fornecido');
    }

    try {
        const eventoReq = await query('SELECT * FROM Eventos WHERE id_eventos = ?', [id]);
        
        if (!eventoReq || eventoReq.length === 0) {
            throw error(404, 'Evento não encontrado na base de dados');
        }

        const evento = eventoReq[0];

        const sessoes = await query(`
            SELECT es.*, s.nome_sala 
            FROM Eventos_Sala es
            JOIN Sala s ON es.id_sala = s.id_sala
            WHERE es.id_eventos = ?
                AND TIMESTAMP(es.data_espectaculo, es.hora_inicio) > NOW()
            ORDER BY es.data_espectaculo ASC, es.hora_inicio ASC
        `, [id]);
        
        return {
            evento: JSON.parse(JSON.stringify(evento)),
            sessoes: JSON.parse(JSON.stringify(sessoes))
        };

    } catch (err) {

        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }

        console.error('ERRO CRÍTICO NO SERVIDOR:', err);
        throw error(500, {
            message: 'Erro interno ao carregar os dados do evento.',
            detail: err.message
        });
    }
};