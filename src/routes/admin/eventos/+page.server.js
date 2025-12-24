// @ts-nocheck
import { query } from '$lib/db';

export async function load() {
    try {
        const lista = await query('SELECT * FROM Eventos ORDER BY id_eventos DESC');
        return { eventos: JSON.parse(JSON.stringify(lista)) };
    } catch (error) {
        return { eventos: [] };
    }
}

export const actions = {
    eliminar: async ({ request }) => {
        const data = await request.formData();
        await query('DELETE FROM Eventos WHERE id_eventos = ?', [data.get('id')]);
        return { success: true };
    },

    editar: async ({ request }) => {
        const data = await request.formData();
        
        const id = data.get('id');
        const nome = data.get('nome');
        const desc = data.get('descricao');
        const tipo = data.get('tipo');
        const imagem = data.get('nova-imagem'); 

        // Verifica se os dados chegaram corretamente
        console.log("A atualizar evento:", id, nome);

        try {
            await query(
                'UPDATE Eventos SET nome_evento = ?, descricao = ?, tipo_espectaculo = ?, imagem_cartaz = ? WHERE id_eventos = ?',
                [nome, desc, tipo, imagem, id]
            );
            return { success: true };
        } catch (error) {
            console.error("ERRO NO SQL:", error);
            return { success: false };
        }
    }
};