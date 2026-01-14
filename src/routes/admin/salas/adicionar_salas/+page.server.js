// @ts-nocheck
import { query } from '$lib/db';
import { fail } from '@sveltejs/kit';

export const actions = {
    criarSala: async (event) => {
        const request = event.request;
        
        try {
            const formData = await request.formData();
            const nome = formData.get('nome');
            const descricao = formData.get('descricao') || '';
            const svg_code = formData.get('svg_code');

            if (!nome || !svg_code) {
                return fail(400, { 
                    message: 'O nome da sala e o mapa são obrigatórios.' 
                });
            }

            await query(
                'INSERT INTO Sala (nome_sala, descricao, svg_code) VALUES (?, ?, ?)',
                [nome.toString(), descricao.toString(), svg_code.toString().trim()]
            );

            return { success: true };

        } catch (err) {
            console.error('ERRO AO CRIAR SALA:', err);
            return fail(500, { message: 'Erro ao guardar na base de dados.' });
        }
    }
};