// @ts-nocheck
import { query } from '$lib/db';
import { fail } from '@sveltejs/kit';

export const load = async () => {
    try {
        const salas = await query('SELECT id_sala, nome_sala, svg_code FROM Sala');
        return { salas: salas || [] };
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

        if (!lugaresRaw || !nomeSala) {
            return fail(400, { message: 'Dados incompletos' });
        }

        const lugares = JSON.parse(lugaresRaw);

        try {
            const salaRes = await query('SELECT id_sala FROM Sala WHERE nome_sala LIKE ?', [`%${nomeSala}%`]);
            if (salaRes.length === 0) return fail(404, { message: 'Sala não encontrada' });
            const id_sala = salaRes[0].id_sala;

            const mapaZonas = {};

            for (const l of lugares) {
                if (!mapaZonas[l.zona]) {
                    let zonaRes = await query(
                        'SELECT id_zona FROM Zona WHERE nome_zona = ? AND id_sala = ?',
                        [l.zona, id_sala]
                    );

                    if (zonaRes.length === 0) {
                        const novaZona = await query(
                            'INSERT INTO Zona (nome_zona, id_sala) VALUES (?, ?)',
                            [l.zona, id_sala]
                        );
                        mapaZonas[l.zona] = novaZona.insertId;
                    } else {
                        mapaZonas[l.zona] = zonaRes[0].id_zona;
                    }
                }

                const id_zona_final = mapaZonas[l.zona];

                await query(
                    `INSERT INTO Lugar (fila, coluna, coordenadas_x, coordenadas_y, id_sala, id_zona) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [l.fila, l.num, Math.round(l.x), Math.round(l.y), id_sala, id_zona_final]
                );
            }

            return { success: true };
        } catch (err) {
            console.error("Erro ao guardar lugares:", err);
            return fail(500, { message: 'Erro ao processar base de dados' });
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
            // Limpeza básica para evitar caracteres que quebrem a query
            svg_code = svg_code.trim();

            const result = await query(
                'INSERT INTO Sala (nome_sala, descricao_sala, svg_code) VALUES (?, ?, ?)',
                [nome, descricao, svg_code]
            );
            
            return { success: true, id: result.insertId };
        } catch (err) {
            // ESTE LOG É FUNDAMENTAL: Vê o terminal onde o SvelteKit está a correr
            console.error('ERRO CRÍTICO NO MYSQL:', err);
            return fail(500, { message: 'Erro interno: ' + err.message });
        }
    }
};