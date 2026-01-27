// @ts-nocheck
import { query } from '$lib/db';
import { redirect, fail } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';

export const load = async ({ url }) => {
    try {
        const salas = await query('SELECT id_sala, nome_sala FROM Sala');
        const id_editar = url.searchParams.get('id');
        let evento = null;

        if (id_editar) {
            // Carrega os dados do evento
            const resEvento = await query('SELECT * FROM Eventos WHERE id_eventos = ?', [id_editar]);
            
            if (resEvento.length > 0) {
                evento = resEvento[0];
                
                // Carrega as sessões associadas
                const sessoesDaBD = await query('SELECT * FROM Eventos_Sala WHERE id_eventos = ?', [id_editar]);

                evento.sessoes = sessoesDaBD.map(s => {
                    const d = new Date(s.data_espectaculo);
                    const ano = d.getFullYear();
                    const mes = String(d.getMonth() + 1).padStart(2, '0');
                    const dia = String(d.getDate()).padStart(2, '0');
                    
                    return {
                        id_sala: s.id_sala,
                        data: `${ano}-${mes}-${dia}`, // Formato YYYY-MM-DD
                        hora: s.hora_inicio.slice(0, 5),
                        duracao: s.duracao ? s.duracao.slice(0, 5) : '01:30',
                        limite_bilhetes: s.limite_bilhetes || 10
                    };
                });
            }
        }

        return { salas, evento };
    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        return { salas: [], evento: null };
    }
};

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        
        // Identificar se é Edição ou Criação
        const id_evento = data.get('id_evento'); 
        const nome = data.get('nome');
        const descricao = data.get('descricao');
        const tipo = data.get('tipo');
        const ficheiro = data.get('imagem_ficheiro');
        const imagem_atual = data.get('imagem_atual'); // Campo hidden que adicionámos no Svelte
        const id_utilizador = 1;
        

        const sessoesRaw = data.get('sessoes_data');
        const sessoes = JSON.parse(sessoesRaw || '[]');

        // Verificação de Conflitos de Agendamento
        for (const sessao of sessoes) {
            const conflito = await query(`
                SELECT e.nome_evento, es.hora_inicio, s.nome_sala
                FROM Eventos_Sala es
                JOIN Eventos e ON es.id_eventos = e.id_eventos
                JOIN Sala s ON es.id_sala = s.id_sala
                WHERE es.id_sala = ?
                AND es.data_espectaculo = ?
                AND es.id_eventos != ? 
                AND (
                    (? BETWEEN es.hora_inicio AND ADDTIME(es.hora_inicio, es.duracao))
                    OR
                    (es.hora_inicio BETWEEN ? AND ADDTIME(?, ?))
                )
            `, [sessao.id_sala, sessao.data, id_evento || 0, sessao.hora, sessao.hora, sessao.hora, sessao.duracao]);

            if (conflito.length > 0) {
                const c = conflito[0];
                return fail(400, {
                    message: `Ocupado: A Sala ${c.nome_sala} já tem o espetáculo "${c.nome_evento}" agendado para este horário.`
                });
            }
        }

        let caminhoImagem = imagem_atual || ''; // Se não mudar a foto, mantém a antiga

        if (ficheiro && ficheiro instanceof Object && ficheiro.name && ficheiro.size > 0) {
            const nomeFicheiro = `${Date.now()}-${ficheiro.name}`;
            const pastaUploads = path.join(process.cwd(), 'static', 'uploads');
            const caminhoLocal = path.join(pastaUploads, nomeFicheiro);

            if (!fs.existsSync(pastaUploads)) fs.mkdirSync(pastaUploads, { recursive: true });

            const buffer = Buffer.from(await ficheiro.arrayBuffer());
            fs.writeFileSync(caminhoLocal, buffer);
            caminhoImagem = `/uploads/${nomeFicheiro}`;
        }

        try {
            let id_final = id_evento;

            if (id_evento && id_evento !== '') {
                // MODO EDIÇÃO: Atualiza Evento
                await query(
                    'UPDATE Eventos SET nome_evento=?, descricao=?, tipo_espectaculo=?, imagem_cartaz=? WHERE id_eventos=?',
                    [nome, descricao, tipo, caminhoImagem, id_evento]
                );
                
                // Limpa sessões antigas para reinserir as novas
                await query('DELETE FROM Eventos_Sala WHERE id_eventos = ?', [id_evento]);
            } else {

                // MODO CRIAÇÃO: Insere Novo Evento
                const resEvento = await query(
                    'INSERT INTO Eventos (nome_evento, descricao, tipo_espectaculo, imagem_cartaz, id_utilizador) VALUES (?, ?, ?, ?, ?)',
                    [nome, descricao, tipo, caminhoImagem, id_utilizador]
                );
                id_final = resEvento.insertId;
            }

            // Insere Sessões (comum a ambos os modos)
            for (const sessao of sessoes) {
                await query(
                    'INSERT INTO Eventos_Sala (id_eventos, id_sala, hora_inicio, data_espectaculo, duracao, limite_bilhetes) VALUES (?, ?, ?, ?, ?, ?)',
                    [id_final, sessao.id_sala, sessao.hora, sessao.data, sessao.duracao, sessao.limite_bilhetes || 10]
                );
            }

        } catch (err) {
            console.error('Erro na BD:', err);
            return fail(500, { message: 'Falha ao gravar os dados na base de dados.' });
        }

        throw redirect(303, '/admin/eventos');
    }
};