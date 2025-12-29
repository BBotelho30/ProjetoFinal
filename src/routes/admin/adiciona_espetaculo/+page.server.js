// @ts-nocheck
import { query } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';

export const load = async () => {
    try {
        // Carrega as salas para o utilizador escolher no formulário
        const salas = await query('SELECT id_sala, nome_sala FROM Sala');
        return { salas };
    } catch (err) {
        console.error('Erro ao carregar salas:', err);
        return { salas: [] };
    }
};

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        
        // Dados do Evento
        const nome = data.get('nome');
        const descricao = data.get('descricao');
        const tipo = data.get('tipo');
        const ficheiro = data.get('imagem_ficheiro');
        const id_utilizador = 1; // ID do admin logado

        // Dados das Sessões (JSON vindo do frontend)
        const sessoesRaw = data.get('sessoes_data');
        const sessoes = JSON.parse(sessoesRaw || '[]');

        let caminhoImagem = '';

        // Processamento da Imagem
        if (ficheiro instanceof Object && ficheiro.name) {
            const nomeFicheiro = `${Date.now()}-${ficheiro.name}`;
            const pastaUploads = path.join(process.cwd(), 'static', 'uploads');
            const caminhoLocal = path.join(pastaUploads, nomeFicheiro);

            if (!fs.existsSync(pastaUploads)) {
                fs.mkdirSync(pastaUploads, { recursive: true });
            }

            const buffer = Buffer.from(await ficheiro.arrayBuffer());
            fs.writeFileSync(caminhoLocal, buffer);
            caminhoImagem = `/uploads/${nomeFicheiro}`;
        }

        try {
            // 1. Inserir na tabela Eventos
            const resEvento = await query(
                'INSERT INTO Eventos (nome_evento, descricao, tipo_espectaculo, imagem_cartaz, id_utilizador) VALUES (?, ?, ?, ?, ?)',
                [nome, descricao, tipo, caminhoImagem, id_utilizador]
            );

            const id_novo_evento = resEvento.insertId;

            // 2. Inserir múltiplas sessões na tabela Eventos_Sala
            if (sessoes.length > 0) {
                for (const sessao of sessoes) {
                    await query(
                        'INSERT INTO Eventos_Sala (id_eventos, id_sala, hora_inicio, data_espectaculo, duracao) VALUES (?, ?, ?, ?, ?)',
                        [id_novo_evento, sessao.id_sala, sessao.hora, sessao.data, sessao.duracao]
                    );
                }
            }
        } catch (err) {
            console.error('Erro na BD:', err);
            return { error: 'Falha ao gravar o espetáculo e sessões.' };
        }

        throw redirect(303, '/admin/eventos');
    }
};