// @ts-nocheck
import { query } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        
        // Captura os dados
        const ficheiro = data.get('imagem_ficheiro');
        const nome = data.get('nome');
        const descricao = data.get('descricao');
        const tipo = data.get('tipo');
        const id_utilizador = 1; 

        let caminhoImagem = '';

        // Verifica se o ficheiro existe e tem conteúdo
        if (ficheiro instanceof Object && ficheiro.name) {
            const nomeFicheiro = `${Date.now()}-${ficheiro.name}`;
            
            // Usamos process.cwd() para encontrar a raiz do projeto
            const pastaUploads = path.join(process.cwd(), 'static', 'uploads');
            const caminhoLocal = path.join(pastaUploads, nomeFicheiro);

            // Garante que a pasta existe
            if (!fs.existsSync(pastaUploads)) {
                fs.mkdirSync(pastaUploads, { recursive: true });
            }

            // Converte o ficheiro para Buffer para o Node conseguir gravar
            const arrayBuffer = await ficheiro.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(caminhoLocal, buffer);
            
            caminhoImagem = `/uploads/${nomeFicheiro}`;
        }

        try {
            await query(
                'INSERT INTO Eventos (nome_evento, descricao, tipo_espectaculo, imagem_cartaz, id_utilizador) VALUES (?, ?, ?, ?, ?)',
                [nome, descricao, tipo, caminhoImagem, id_utilizador]
            );
        } catch (err) {
            console.error('Erro na BD:', err);
            return { error: 'Falha ao gravar no banco de dados.' };
        }

        throw redirect(303, '/admin/eventos');
    }
};