// @ts-nocheck
import { query } from '$lib/db';
import { fail } from '@sveltejs/kit';

export async function load() {
    try {
        const salas = await query('SELECT id_sala, nome_sala FROM Sala') || [];
        const listaEventos = await query('SELECT * FROM Eventos ORDER BY id_eventos DESC') || [];

        const eventosComSessoes = await Promise.all(listaEventos.map(async (evento) => {
            try {
                const sessoesBD = await query('SELECT * FROM Eventos_Sala WHERE id_eventos = ?', [evento.id_eventos]) || [];
                const precosBD = await query('SELECT id_zona, preco FROM Preco_Evento_Zona WHERE id_eventos = ?', [evento.id_eventos]) || [];
                
                const mapaPrecos = {};
                precosBD.forEach(p => {
                    if (p && p.id_zona) mapaPrecos[p.id_zona] = p.preco;
                });

                const sessoes = sessoesBD.map(s => {
                    const d = s.data_espectaculo ? new Date(s.data_espectaculo) : null;
                    return {
                        ...s,
                        data_espectaculo: (d && !isNaN(d.getTime())) ? d.toISOString().split('T')[0] : "",
                        hora_inicio: s.hora_inicio ? s.hora_inicio.slice(0, 5) : "00:00",
                        duracao: s.duracao ? s.duracao.slice(0, 5) : '01:30',
                        precos: mapaPrecos
                    };
                });

                return { ...evento, sessoes };
            } catch (err) {
                return { ...evento, sessoes: [] };
            }
        }));

        return { 
            eventos: JSON.parse(JSON.stringify(eventosComSessoes)),
            salas: JSON.parse(JSON.stringify(salas))
        };
    } catch (error) {
        return { eventos: [], salas: [] };
    }
}

export const actions = {
    eliminar: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        try {
            await query('DELETE FROM Eventos_Sala WHERE id_eventos = ?', [id]);
            await query('DELETE FROM Preco_Evento_Zona WHERE id_eventos = ?', [id]);
            await query('DELETE FROM Eventos WHERE id_eventos = ?', [id]);
            return { success: true };
        } catch (err) { return { success: false }; }
    },

    editar: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        const nome = formData.get('nome');
        const desc = formData.get('descricao');
        const tipo = formData.get('tipo');
        const imagem = formData.get('nova-imagem');
        const sessoesRaw = formData.get('sessoes_data');
        
        let sessoesParsed = [];
        try { sessoesParsed = JSON.parse(sessoesRaw || '[]'); } catch (e) { sessoesParsed = []; }

        try {
            await query(
                'UPDATE Eventos SET nome_evento = ?, descricao = ?, tipo_espectaculo = ?, imagem_cartaz = ? WHERE id_eventos = ?',
                [nome, desc, tipo, imagem, id]
            );

            await query('DELETE FROM Eventos_Sala WHERE id_eventos = ?', [id]);
            for (const s of sessoesParsed) {
                await query(
                    'INSERT INTO Eventos_Sala (id_eventos, id_sala, hora_inicio, data_espectaculo, duracao) VALUES (?, ?, ?, ?, ?)',
                    [id, s.id_sala, s.hora_inicio, s.data_espectaculo, s.duracao]
                );
            }

            await query('DELETE FROM Preco_Evento_Zona WHERE id_eventos = ?', [id]);
            const precoObj = sessoesParsed[0]?.precos;
            if (precoObj) {
                for (const [idZona, valor] of Object.entries(precoObj)) {
                    await query(
                        'INSERT INTO Preco_Evento_Zona (id_eventos, id_zona, preco, disponibilidade) VALUES (?, ?, ?, ?)',
                        [id, idZona, valor, 'SIM']
                    );
                }
            }
            return { success: true };
        } catch (error) { 
            console.error(error);
            return fail(500, { success: false }); 
        }
    }
};