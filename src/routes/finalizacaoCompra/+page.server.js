// @ts-nocheck
import { query } from '$lib/db';
import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ url }) => {
    // Tentamos obter o ID do utilizador via parâmetro ou podes definir um padrão
    // Para o Load funcionar bem na primeira vez, idealmente o ID viria de um cookie ou locals
    const id_utilizador = url.searchParams.get('uid'); 

    if (!id_utilizador) {
        return { perfil: {} };
    }

    try {
        const utilizador = await query(
            'SELECT nome, email, telefone, pais, distrito, morada FROM Utilizadores WHERE id_utilizador = ?',
            [id_utilizador]
        );

        return {
            perfil: utilizador[0] || {}
        };
    } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        return { perfil: {} };
    }
};

/** @type {import('./$types').Actions} */
export const actions = {
    finalizarReserva: async ({ request }) => {
        const formData = await request.formData();
        
        // 1. Capturar Dados do Utilizador e Itens
        const id_utilizador = formData.get('id_utilizador');
        const itensRaw = formData.get('itens');
        
        if (!id_utilizador || !itensRaw) {
            return fail(400, { message: 'Dados insuficientes para finalizar a reserva.' });
        }

        const itens = JSON.parse(itensRaw);

        // 2. Capturar Dados de Perfil (Obrigatórios no formulário, mas validamos aqui)
        const nome = formData.get('nome');
        const apelido = formData.get('apelido');
        const telefone = formData.get('telefone');
        const pais = formData.get('pais');
        const distrito = formData.get('distrito');
        const morada = formData.get('morada') || null; // Opcional

        // 3. Capturar Dados de Faturação (Opcionais)
        const nome_fatura = formData.get('fatura_nome') || null;
        const nif_fatura = formData.get('fatura_nif') || null;
        const morada_fatura = formData.get('fatura_morada') || null;

        try {
            // PASSO A: Atualizar a tabela Utilizadores (Opção B)
            // Atualizamos o perfil para que na próxima compra os dados já lá estejam
            await query(
                `UPDATE Utilizadores 
                 SET telefone = ?, pais = ?, distrito = ?, morada = ? 
                 WHERE id_utilizador = ?`,
                [telefone, pais, distrito, morada, id_utilizador]
            );

            // PASSO B: Inserir cada bilhete na tabela Reserva
            // Usamos um loop para gravar todos os itens que estavam no carrinho
            for (const item of itens) {
                await query(
                    `INSERT INTO Reserva 
                    (id_utilizador, id_lugar, id_evento_sala, nome_fatura, nif_fatura, morada_fatura, preco_pago, data_reserva) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [
                        id_utilizador, 
                        item.id_lugar, 
                        item.id_sessao, 
                        nome_fatura, 
                        nif_fatura, 
                        morada_fatura, 
                        item.preco
                    ]
                );

                // Opcional: Se tiveres uma coluna 'estado' na tabela Lugar, deves marcar como ocupado
                // await query('UPDATE Lugar SET estado = "ocupado" WHERE id_lugar = ?', [item.id_lugar]);
            }

            return { success: true };

        } catch (err) {
            console.error("Erro Crítico na Reserva:", err);
            return fail(500, { message: 'Erro técnico ao gravar a sua reserva. Por favor, tente novamente.' });
        }
    }
};