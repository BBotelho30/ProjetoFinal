// @ts-nocheck
import { query } from '$lib/db';

export async function load() {
    try {
        const salas = await query('SELECT id_sala, nome_sala FROM Sala');
        const listaEventos = await query('SELECT * FROM Eventos ORDER BY id_eventos DESC');

        const eventosComSessoes = await Promise.all(listaEventos.map(async (evento) => {
            try {
                const sessoesBD = await query(
                    'SELECT * FROM Eventos_Sala WHERE id_eventos = ?', 
                    [evento.id_eventos]
                );

                const sessoes = sessoesBD.map(s => {
                    let dataFormatada = "";
                    if (s.data_espectaculo) {
                        const d = new Date(s.data_espectaculo);
                        if (!isNaN(d.getTime())) {
                            dataFormatada = d.toISOString().split('T')[0];
                        }
                    }
                    return {
                        ...s,
                        data_espectaculo: dataFormatada,
                        hora_inicio: s.hora_inicio ? s.hora_inicio.slice(0, 5) : "00:00",
                        duracao: s.duracao ? s.duracao.slice(0, 5) : '02:00'
                    };
                });

                return { ...evento, sessoes };
            } catch (errSessao) {
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
        const data = await request.formData();
        const id = data.get('id');
        try {
            await query('DELETE FROM Eventos_Sala WHERE id_eventos = ?', [id]);
            await query('DELETE FROM Eventos WHERE id_eventos = ?', [id]);
            return { success: true };
        } catch (err) { return { success: false }; }
    },

    editar: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id');
        const nome = data.get('nome');
        const desc = data.get('descricao');
        const tipo = data.get('tipo'); // Campo recuperado
        const imagem = data.get('nova-imagem');
        const sessoesRaw = data.get('sessoes_data');
        const sessoes = JSON.parse(sessoesRaw || '[]');

        try {
            await query(
                'UPDATE Eventos SET nome_evento = ?, descricao = ?, tipo_espectaculo = ?, imagem_cartaz = ? WHERE id_eventos = ?',
                [nome, desc, tipo, imagem, id]
            );

            await query('DELETE FROM Eventos_Sala WHERE id_eventos = ?', [id]);
            for (const s of sessoes) {
                await query(
                    'INSERT INTO Eventos_Sala (id_eventos, id_sala, hora_inicio, data_espectaculo, duracao) VALUES (?, ?, ?, ?, ?)',
                    [id, s.id_sala, s.hora_inicio, s.data_espectaculo, s.duracao]
                );
            }
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    }
};