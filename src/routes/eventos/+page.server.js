// @ts-nocheck
import { query } from '$lib/db';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    try {
        const lista = await query('SELECT * FROM Eventos ORDER BY id_eventos DESC');
        return {
            eventos: JSON.parse(JSON.stringify(lista))
        };
    } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        return { eventos: [] };
    }
}