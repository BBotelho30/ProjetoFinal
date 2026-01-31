// @ts-nocheck
import { query } from '$lib/db';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    finalizar: async ({ request, locals }) => {
        const formData = await request.formData();
        const itens = JSON.parse(formData.get('itens'));
        const id_utilizador = formData.get('id_utilizador');

        if (!id_utilizador || id_utilizador === 'undefined') {
            return fail(400, { message: 'Precisa de iniciar sessão para comprar.' });
        }

        try {
            // insere cada lugar na tua tabela de Reservas/Bilhetes
            for (const item of itens) {
                await query(
                    `INSERT INTO Reserva (id_utilizador, id_lugar, id_evento_sala, data_reserva, preco_pago, estado) 
                     VALUES (?, ?, ?, NOW(), ?, 'Confirmado')`,
                    [id_utilizador, item.id_lugar, item.id_sessao, item.preco]
                );
                
            }

            return { success: true };
        } catch (err) {
            console.error(err);
            return fail(500, { message: 'Erro ao processar a reserva na base de dados.' });
        }
    }
};