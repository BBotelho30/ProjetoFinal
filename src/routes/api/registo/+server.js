// @ts-nocheck
import { json } from '@sveltejs/kit';
import { query } from '$lib/db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const { nome, apelido, email, password } = await request.json();

        // Verificar se o email já existe para evitar email duplicados
        const existing = await query('SELECT id_utilizador FROM Utilizadores WHERE email = ?', [email]);
        
        if (existing && existing.length > 0) {
            return json({ success: false, message: 'Este email já está registado.' }, { status: 400 });
        }

        // Insere na base de dados
        // O cliente é o tipo padrão conforme o script SQL
        const sql = `
            INSERT INTO Utilizadores (nome, apelido, email, password, tipo, data_registo)
            VALUES (?, ?, ?, ?, 'cliente', CURDATE())
        `;

        await query(sql, [nome, apelido, email, password]);

        return json({ success: true, message: 'Conta criada com sucesso!' });
    } catch (error) {
        console.error('Erro no Registo:', error);
        return json({ success: false, message: 'Erro ao ligar à base de dados.' }, { status: 500 });
    }
}