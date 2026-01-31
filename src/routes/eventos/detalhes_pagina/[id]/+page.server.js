// @ts-nocheck
import { query } from '$lib/db';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
    const id = params.id; 

    // Validação básica do ID
    if (!id || id === 'undefined') {
        throw error(400, 'ID do evento inválido ou não fornecido');
    }

    try {
        // 1. Procurar os dados do evento principal
        const eventoReq = await query('SELECT * FROM Eventos WHERE id_eventos = ?', [id]);
        
        if (!eventoReq || eventoReq.length === 0) {
            throw error(404, 'Evento não encontrado na base de dados');
        }

        const evento = eventoReq[0];

        // 2. Procurar as sessões associadas
        const sessoes = await query(`
            SELECT es.*, s.nome_sala 
            FROM Eventos_Sala es
            JOIN Sala s ON es.id_sala = s.id_sala
            WHERE es.id_eventos = ?
            ORDER BY es.data_espectaculo ASC, es.hora_inicio ASC
        `, [id]);

        // Retornar os dados (usamos JSON.stringify/parse para garantir a serialização limpa de datas do MySQL)
        return {
            evento: JSON.parse(JSON.stringify(evento)),
            sessoes: JSON.parse(JSON.stringify(sessoes))
        };

    } catch (err) {
        // CORREÇÃO AQUI:
        // Se o erro já for um erro disparado pelo SvelteKit (como o 404 acima), 
        // ele terá uma propriedade 'status'. Se tiver, deixamos o SvelteKit lidar com ele.
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