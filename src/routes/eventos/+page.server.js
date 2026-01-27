// @ts-nocheck
import { query } from '$lib/db';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    try {
        // Carrega a lista completa de eventos
        const lista = await query('SELECT * FROM Eventos ORDER BY id_eventos DESC');
        // Carrega os tipos de espetáculos distintos
        const tiposBD = await query(`
            SELECT DISTINCT tipo_espectaculo 
            FROM Eventos 
            WHERE tipo_espectaculo IS NOT NULL 
            AND tipo_espectaculo != ''
            ORDER BY tipo_espectaculo ASC
        `);
        
        const tipos = tiposBD.map(t => t.tipo_espectaculo);

        return {
            eventos: JSON.parse(JSON.stringify(lista)),
            tipos: tipos 
        };
    } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        return { eventos: [], tipos: [] };
    }
}