/*// @ts-nocheck
import { json } from '@sveltejs/kit';
import { query } from '$lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { GMAIL_USER, GMAIL_PASS } from '$env/static/private';


export async function POST({ request }) {
    try {
        const { nome, apelido, email, password } = await request.json();

        const existing = await query(
            'SELECT id_utilizador FROM Utilizadores WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return json({ success: false, message: 'Este email já está registado.' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const token = uuidv4();
        const expira = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

        await query(`
            INSERT INTO Utilizadores 
            (nome, apelido, email, password, tipo, data_registo, email_verificado, email_token, token_expira)
            VALUES (?, ?, ?, ?, 'cliente', CURDATE(), 0, ?, ?)
        `, [nome, apelido, email, passwordHash, token, expira]);

        // enviar email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_PASS
            }
        });

        const link = `http://localhost:5173/verificar-email?token=${token}`;

        await transporter.sendMail({
            from: '"TicketLine" <teuemail@gmail.com>',
            to: email,
            subject: 'Confirma o teu email',
            html: `
                <h2>Bem-vindo ${nome} 👋</h2>
                <p>Clica no botão para confirmar o teu email:</p>
                <a href="${link}" style="padding:10px 20px;background:#ff0000;color:white;text-decoration:none;border-radius:6px">
                    Confirmar Email
                </a>
                <p>Este link expira em 24h.</p>
            `
        });

        return json({
            success: true,
            message: 'Conta criada! Verifica o teu email.'
        });

    } catch (err) {
        console.error(err);
        return json({ success: false, message: 'Erro no registo.' }, { status: 500 });
    }
}

*/
