// @ts-nocheck
import { json } from '@sveltejs/kit';
import { query } from '$lib/db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const { email, password } = await request.json();

        // Usa-se o  SELECT * para garantir que vem todas as colunas (incluindo o 'tipo')
        // Certifica que a tabela se chama 'Utilizadores' no MySQL
        const sql = `SELECT * FROM Utilizadores WHERE email = ? AND password = ?`;
        
        const users = await query(sql, [email, password]);

        if (users && users.length > 0) {
            const user = users[0];
            
            // Remove a password antes de enviar a resposta
            delete user.password;

            return json({ 
                success: true, 
                user: user 
            });
        } else {
            return json({ 
                success: false, 
                message: 'Email ou palavra-passe incorretos.' 
            }, { status: 401 });
        }

    } catch (error) {
        // Este console.log vai aparecer no terminal do teu VS Code. 
        console.error('ERRO NO LOGIN:', error);
        
        return json({ 
            success: false, 
            message: 'Erro interno ao processar o login.' 
        }, { status: 500 });
    }
}