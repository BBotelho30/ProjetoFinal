// @ts-nocheck
import { query } from '$lib/db';
import { fail } from '@sveltejs/kit';

export const load = async () => {
    try {
        const salas = await query(
            'SELECT id_sala, nome_sala, descricao, svg_code FROM Sala'
        );

        // ---------- Lugares + Zonas ----------
        const lugaresBD = await query(`
            SELECT 
                l.coordenadas_x AS x,
                l.coordenadas_y AS y,
                l.fila,
                l.coluna AS num,
                l.id_sala,
                z.id_zona,
                z.nome_zona,
                z.coordenadas AS config_tecnica
            FROM Lugar l
            LEFT JOIN Zona z ON l.id_zona = z.id_zona
        `).catch(() => []);

        return {
            salas: salas.map(s => {
                const lugaresDaSala = lugaresBD.filter(
                    l => l.id_sala === s.id_sala
                );

                const configZonas = {};

                lugaresDaSala.forEach(l => {
                    if (!l.config_tecnica) return;

                    const cfg =
                        typeof l.config_tecnica === 'string'
                            ? JSON.parse(l.config_tecnica)
                            : l.config_tecnica;

                    const zonaKey = cfg?.idTecnico;
                    if (!zonaKey) return;

                    if (!configZonas[zonaKey]) {
                        configZonas[zonaKey] = {
                            ...cfg,
                            nome: l.nome_zona
                        };
                    }
                });

                return {
                    ...s,

             
                    lugares_guardados: lugaresDaSala.map(l => {
                        const cfg =
                            typeof l.config_tecnica === 'string'
                                ? JSON.parse(l.config_tecnica)
                                : l.config_tecnica;

                        return {
                            id: Math.random(),
                            x: l.x,
                            y: l.y,
                            zona: cfg?.idTecnico, 
                            nomeZona: l.nome_zona,
                            fila: l.fila,
                            num: l.num,
                            visivel: true
                        };
                    }),

                    config_zonas: configZonas
                };
            })
        };
    } catch (err) {
        return { salas: [] };
    }
};


export const actions = {
    guardarLugares: async ({ request }) => {
        const data = await request.formData();

        const nomeSala = data.get('sala');
        const lugaresParaGuardar = JSON.parse(
            data.get('lugares') || '[]'
        ).filter(l => l.visivel);

        const configZonasRaw = JSON.parse(
            data.get('config_zonas') || '{}'
        );

        try {
            const salaRes = await query(
                'SELECT id_sala FROM Sala WHERE nome_sala = ?',
                [nomeSala]
            );

            const id_sala = salaRes[0].id_sala;

            // Limpa mapa anterior
            await query('DELETE FROM Lugar WHERE id_sala = ?', [id_sala]);
            await query('DELETE FROM Zona WHERE id_sala = ?', [id_sala]);

            const mapaZonas = {};

            for (const l of lugaresParaGuardar) {
                if (!mapaZonas[l.zona]) {

                    // 👇 NOME HUMANO DA ZONA (vem do modal)
                    const nomeZona =
                        configZonasRaw[l.zona]?.nome || 'Zona sem nome';

                    // Guarda config técnica (inclui idTecnico)
                    const configJSON = JSON.stringify(
                        configZonasRaw[l.zona] || {}
                    );

                    const resZona = await query(
                        'INSERT INTO Zona (nome_zona, coordenadas, id_sala) VALUES (?, ?, ?)',
                        [nomeZona, configJSON, id_sala]
                    );

                    mapaZonas[l.zona] = resZona.insertId;
                }

                await query(
                    `INSERT INTO Lugar 
                        (fila, coluna, coordenadas_x, coordenadas_y, id_sala, id_zona)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        l.fila,
                        l.num,
                        Math.round(l.x),
                        Math.round(l.y),
                        id_sala,
                        mapaZonas[l.zona]
                    ]
                );
            }

            return { success: true };
        } catch (err) {
            return fail(500);
        }
    }
};
