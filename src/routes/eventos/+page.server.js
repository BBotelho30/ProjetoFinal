// @ts-nocheck
import { query } from '$lib/db';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    try {
        // 1️⃣ Buscar eventos
        const eventos = await query(`SELECT * FROM Eventos`);

        // 2️⃣ Buscar sessões com nome da sala
        const sessoes = await query(`
            SELECT 
                es.id_eventos,
                es.data_espectaculo,
                es.hora_inicio,
                es.duracao,
                es.limite_bilhetes,
                s.nome_sala
            FROM Eventos_Sala es
            JOIN Sala s ON es.id_sala = s.id_sala
        `);

        // 3️⃣ Agrupar sessões dentro dos eventos
        const mapa = {};
        for (const ev of eventos) {
            mapa[ev.id_eventos] = {
                ...ev,
                sessoes: []
            };
        }

        for (const s of sessoes) {
            if (mapa[s.id_eventos]) {
                mapa[s.id_eventos].sessoes.push(s);
            }
        }

        const listaFinal = Object.values(mapa);

        // 4️⃣ Tipos distintos (categorias)
        const tiposBD = await query(`
            SELECT DISTINCT tipo_espectaculo 
            FROM Eventos 
            WHERE tipo_espectaculo IS NOT NULL 
            AND tipo_espectaculo != ''
            ORDER BY tipo_espectaculo ASC
        `);

        const tipos = tiposBD.map(t => t.tipo_espectaculo);

        return {
            eventos: JSON.parse(JSON.stringify(listaFinal)),
            tipos
        };

    } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        return { eventos: [], tipos: [] };
    }
}
