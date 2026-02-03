// @ts-nocheck
import { query } from '$lib/db';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
    const { id_sala } = params;

    if (!id_sala) {
        return json({ error: 'ID da sala não fornecido' }, { status: 400 });
    }

    try {
        // Busca as zonas que pertencem a esta sala específica
        const zonas = await query(
            'SELECT id_zona, nome_zona FROM Zona WHERE id_sala = ?',
            [id_sala]
        );
        
        return json(zonas);
    } catch (err) {
        console.error('Erro ao buscar zonas:', err);
        return json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}