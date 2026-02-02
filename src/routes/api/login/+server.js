/*// @ts-nocheck
import { json } from '@sveltejs/kit';
import { query } from '$lib/db';

export async function POST({ request }) {
    try {
        const { email, password } = await request.json();

        const users = await query(
            `SELECT id_utilizador, nome, apelido, email, tipo, email_verificado 
             FROM Utilizadores 
             WHERE email = ? AND password = ?`,
            [email, password]
        );

        if (!users || users.length === 0) {
            return json(
                { success: false, message: 'Email ou palavra-passe incorretos.' },
                { status: 401 }
            );
        }

        const user = users[0];

        // 🚨 PASSO 3 — BLOQUEAR SE EMAIL NÃO CONFIRMADO
        if (!user.email_verificado) {
            return json(
                {
                    success: false,
                    message: 'Confirma o teu email antes de iniciares sessão.'
                },
                { status: 403 }
            );
        }

        return json({
            success: true,
            user
        });

    } catch (error) {
        console.error('ERRO NO LOGIN:', error);

        return json(
            { success: false, message: 'Erro interno ao processar o login.' },
            { status: 500 }
        );
    }
}
*/
