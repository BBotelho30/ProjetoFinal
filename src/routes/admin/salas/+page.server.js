// @ts-nocheck
import { query } from '$lib/db';
import { fail } from '@sveltejs/kit';

export const load = async () => {
    try {
        // 1. Carrega todas as salas primeiro (garante que a lista não fica vazia)
        const salas = await query('SELECT id_sala, nome_sala, svg_code FROM Sala');

        // No load, remove o l.step da query
        const lugaresBD = await query(`
            SELECT 
                l.coordenadas_x as x, 
                l.coordenadas_y as y, 
                z.nome_zona as zona, 
                l.fila, 
                l.coluna as num, 
                l.id_sala
            FROM Lugar l
            INNER JOIN Zona z ON l.id_zona = z.id_zona
        `).catch(() => []);

        // 3. Mapeia os lugares para as suas respetivas salas
        const salasComLugares = salas.map(s => ({
            ...s,
            lugares_guardados: lugaresBD.filter(l => l.id_sala === s.id_sala)
        }));

        return { salas: salasComLugares };
    } catch (err) {
        console.error("Erro no Load:", err);
        return { salas: [] };
    }
};

export const actions = {
guardarLugares: async ({ request }) => {
    const data = await request.formData();
    const lugaresRaw = data.get('lugares');
    const nomeSala = data.get('sala');

    const lugares = JSON.parse(lugaresRaw || '[]');

    try {
        const salaRes = await query('SELECT id_sala FROM Sala WHERE nome_sala = ?', [nomeSala]);
        const id_sala = salaRes[0].id_sala;

        // 1. LIMPEZA TOTAL (Obrigatória para apagar ou atualizar)
        // Primeiro filhos, depois pais
        await query('DELETE FROM Lugar WHERE id_sala = ?', [id_sala]);
        await query('DELETE FROM Zona WHERE id_sala = ?', [id_sala]);

        // 2. Se o utilizador limpou a sala no site, o array vem []
        // O código para aqui e a sala fica vazia na BD como desejado.
        if (lugares.length === 0) {
            return { success: true, message: 'Sala limpa com sucesso.' };
        }

        // 3. Se houver lugares, reinsere-os
        const mapaZonas = {};
        for (const l of lugares) {
            if (!mapaZonas[l.zona]) {
                const novaZona = await query(
                    'INSERT INTO Zona (nome_zona, id_sala) VALUES (?, ?)',
                    [l.zona, id_sala]
                );
                mapaZonas[l.zona] = novaZona.insertId;
            }
            const id_zona_final = mapaZonas[l.zona];

            await query(
                `INSERT INTO Lugar (fila, coluna, coordenadas_x, coordenadas_y, id_sala, id_zona, step) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [l.fila, l.num, Math.round(l.x), Math.round(l.y), id_sala, id_zona_final, l.step || 1]
            );
        }

        return { success: true };
    } catch (err) {
        console.error(err);
        return fail(500, { message: 'Erro ao processar.' });
    }
},

    criarSala: async ({ request }) => {
        const data = await request.formData();
        const nome = data.get('nome');
        const descricao = data.get('descricao');
        let svg_code = data.get('svg_code');

        if (!nome || !svg_code) {
            return fail(400, { message: 'Nome e Código SVG são obrigatórios.' });
        }

        try {
            svg_code = svg_code.trim();
            const result = await query(
                'INSERT INTO Sala (nome_sala, descricao_sala, svg_code) VALUES (?, ?, ?)',
                [nome, descricao, svg_code]
            );
            
            return { success: true, id: result.insertId };
        } catch (err) {
            console.error('ERRO CRÍTICO NO MYSQL:', err);
            return fail(500, { message: 'Erro interno: ' + err.message });
        }
    }
};