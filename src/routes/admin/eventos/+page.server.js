// @ts-nocheck
import { query } from '$lib/db';

export async function load() {
    try {
        // 1. Carregar eventos
        const listaEventos = await query('SELECT * FROM Eventos ORDER BY id_eventos DESC');
        
        // 2. Carregar salas para o select do modal
        const salas = await query('SELECT id_sala, nome_sala FROM Sala');

        // 3. Para cada evento, carregar as sessões associadas
        const eventosComSessoes = await Promise.all(listaEventos.map(async (evento) => {
            const sessoes = await query(
                'SELECT * FROM Eventos_Sala WHERE id_eventos = ?', 
                [evento.id_eventos]
            );
            return { ...evento, sessoes };
        }));

        return { 
            eventos: JSON.parse(JSON.stringify(eventosComSessoes)),
            salas: JSON.parse(JSON.stringify(salas))
        };
    } catch (error) {
        console.error("Erro no load de eventos:", error);
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
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    editar: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id');
        const nome = data.get('nome');
        const desc = data.get('descricao');
        const tipo = data.get('tipo');
        const imagem = data.get('nova-imagem');
        const sessoesRaw = data.get('sessoes_data');
        const sessoes = JSON.parse(sessoesRaw || '[]');

        try {
            // Atualizar Evento
            await query(
                'UPDATE Eventos SET nome_evento = ?, descricao = ?, tipo_espectaculo = ?, imagem_cartaz = ? WHERE id_eventos = ?',
                [nome, desc, tipo, imagem, id]
            );

            // Atualizar Sessões (Sync)
            await query('DELETE FROM Eventos_Sala WHERE id_eventos = ?', [id]);
            for (const s of sessoes) {
                await query(
                    'INSERT INTO Eventos_Sala (id_eventos, id_sala, hora_inicio, data_espectaculo, duracao) VALUES (?, ?, ?, ?, ?)',
                    [id, s.id_sala, s.hora_inicio, s.data_espectaculo, s.duracao]
                );
            }
            return { success: true };
        } catch (error) {
            console.error("Erro ao editar:", error);
            return { success: false };
        }
    }
};