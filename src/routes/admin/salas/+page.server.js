// @ts-nocheck
import { query } from '$lib/db';
import { fail } from '@sveltejs/kit';

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
            // Procura o ID da sala
            const salaRes = await query('SELECT id_sala FROM Sala WHERE nome_sala LIKE ?', [`%${nomeSala}%`]);
            if (salaRes.length === 0) return fail(404, { message: 'Sala não encontrada' });
            const id_sala = salaRes[0].id_sala;

            // Cria um mapa temporário para não repetir querys de zona desnecessárias
            const mapaZonas = {};

            for (const l of lugares) {
                // Verifica se já foi precessado a zona no loop ou se existe na BD
                if (!mapaZonas[l.zona]) {
                    let zonaRes = await query(
                        'SELECT id_zona FROM Zona WHERE nome_zona = ? AND id_sala = ?',
                        [l.zona, id_sala]
                    );

                    if (zonaRes.length === 0) {
                        // cria a zona se não existir
                        const novaZona = await query(
                            'INSERT INTO Zona (nome_zona, id_sala) VALUES (?, ?)',
                            [l.zona, id_sala]
                        );
                        mapaZonas[l.zona] = novaZona.insertId;
                        console.log(`Nova zona ${l.zona} criada com ID ${novaZona.insertId}`);
                    } else {
                        mapaZonas[l.zona] = zonaRes[0].id_zona;
                    }
                }

                const id_zona_final = mapaZonas[l.zona];

                // Insere o lugar já com o ID da zona correto
                await query(
                    `INSERT INTO Lugar (fila, coluna, coordenadas_x, coordenadas_y, id_sala, id_zona) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [l.fila, l.num, Math.round(l.x), Math.round(l.y), id_sala, id_zona_final]
                );
            }

            return { success: true };
        } catch (err) {
            console.error('Erro ao guardar:', err);
            return fail(500, { message: 'Erro ao processar base de dados' });
        }
    }
};