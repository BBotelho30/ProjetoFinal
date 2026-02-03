// @ts-nocheck
import { query } from '$lib/db';
import { fail, redirect } from '@sveltejs/kit';
import PDFDocument from 'pdfkit';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

export const actions = {
  finalizarReserva: async ({ request }) => {

    const resend = new Resend(env.RESEND_API_KEY);

    const formData = await request.formData();
    const itensRaw = formData.get('itens');
    const nome = formData.get('nome');
    const apelido = formData.get('apelido');
    const email = formData.get('email');

    if (!email || !itensRaw) {
      return fail(400, { message: 'Dados em falta.' });
    }

    const itens = JSON.parse(itensRaw);

    let utilizador = await query(
      'SELECT id_utilizador FROM Utilizadores WHERE email = ?',
      [email]
    );

    if (!utilizador.length) {
      await query(
        'INSERT INTO Utilizadores (email, nome) VALUES (?, ?)',
        [email, nome]
      );

      utilizador = await query(
        'SELECT id_utilizador FROM Utilizadores WHERE email = ?',
        [email]
      );
    }

    const id_utilizador = utilizador[0].id_utilizador;

    let total = 0;

    try {
      for (const item of itens) {
        total += Number(item.preco) || 0;

        await query(
          `INSERT INTO Reserva
           (id_utilizador, id_evento, id_lugar, data_reserva, estado_reserva)
           VALUES (?, ?, ?, NOW(), 'confirmada')`,
          [id_utilizador, item.id_evento, item.id_lugar]
        );
      }

      // PDF
      const pdfBuffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40 });
        const chunks = [];

        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(20).text('Bilhetes QuickSeat', { align: 'center' });
        doc.moveDown();

        doc.text(`Cliente: ${nome} ${apelido}`);
        doc.text(`Email: ${email}`);
        doc.moveDown();

        itens.forEach((item, i) => {
          doc.text(`Bilhete ${i + 1}`);
          doc.text(`Evento: ${item.nome_evento}`);
          doc.text(`Lugar: ${item.fila}${item.num}`);
          doc.text(`Preço: ${item.preco}€`);
          doc.moveDown();
        });

        doc.end();
      });

      await resend.emails.send({
        from: env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: '🎟️ Compra confirmada - QuickSeat',
        html: `
          <h2>Obrigado pela sua compra, ${nome}!</h2>
          <p>Os seus bilhetes seguem em anexo.</p>
          <p>Total pago: <strong>${total.toFixed(2)}€</strong></p>
        `,
        attachments: [
          {
            filename: 'bilhetes.pdf',
            content: pdfBuffer
          }
        ]
      });

    } catch (err) {
      console.error(err);
      return fail(500, { message: 'Erro ao finalizar a compra.' });
    }

    throw redirect(303, '/compra_concluida');
  }
};
