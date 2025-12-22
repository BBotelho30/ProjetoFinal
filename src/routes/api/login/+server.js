// @ts-nocheck
import { json } from '@sveltejs/kit';
import { query } from '$lib/db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const { email, password } = await request.json();

        // Procura o utilizador com o email e password fornecidos
        // Selecionamos o nome e apelido para poderes usar na mensagem de boas-vindas
        const sql = `
            SELECT id_utilizador, nome, apelido, tipo 
            FROM Utilizadores 
            WHERE email = ? AND password = ?
        `;
        
        const users = await query(sql, [email, password]);

        if (users && users.length > 0) {
            // Se encontrar o utilizador, enviamos os dados de volta
            return json({ 
                success: true, 
                user: users[0] 
            });
        } else {
            // Se não encontrar nada, as credenciais estão erradas
            return json({ 
                success: false, 
                message: 'Email ou palavra-passe incorretos.' 
            }, { status: 401 });
        }

    } catch (error) {
        console.error('Erro no servidor durante o Login:', error);
        return json({ 
            success: false, 
            message: 'Erro interno ao processar o login.' 
        }, { status: 500 });
    }
}