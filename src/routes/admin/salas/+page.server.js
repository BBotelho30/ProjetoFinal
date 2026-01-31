// @ts-nocheck
import { query } from '$lib/db';
import { fail } from '@sveltejs/kit';

/**
 * Carrega as salas e os lugares guardados, recuperando a configuração técnica do modal.
 */
export const load = async () => {
    try {
        // 1. Carregar salas. Se a coluna config_zonas não existir, o catch faz o fallback para o básico.
        const salas = await query('SELECT id_sala, nome_sala, svg_code, config_zonas FROM Sala').catch(async () => {
            return await query('SELECT id_sala, nome_sala, svg_code FROM Sala');
        });

        // 2. Carregar lugares. Usamos INNER JOIN para garantir que só vêm lugares com zonas válidas.
        const lugaresBD = await query(`
            SELECT 
                l.coordenadas_x as x, 
                l.coordenadas_y as y, 
                z.nome_zona as zona, 
                l.nome_zona_tecnico as nomeZona,
                z.preco_base as preco,
                l.fila, 
                l.coluna as num, 
                l.id_sala
            FROM Lugar l
            INNER JOIN Zona z ON l.id_zona = z.id_zona
        `).catch(() => []);

        // 3. Preparar os dados para o frontend Svelte
        const salasComLugares = salas.map(s => ({
            ...s,
            // Converte a string JSON da BD para objeto JS. Se falhar, usa um objeto vazio.
            config_zonas: s.config_zonas 
                ? (typeof s.config_zonas === 'string' ? JSON.parse(s.config_zonas) : s.config_zonas) 
                : {},
            lugares_guardados: lugaresBD.filter(l => l.id_sala === s.id_sala).map(l => ({
                ...l,
                visivel: true // Lugares na BD são por definição visíveis neste modelo
            }))
        }));

        return { salas: salasComLugares };
    } catch (err) {
        console.error("Erro Crítico no Load:", err);
        return { salas: [] };
    }
};

/**
 * Ações do formulário: guardarLugares e criarSala.
 */
export const actions = {
    guardarLugares: async ({ request }) => {
        console.log("Ação 'guardarLugares' iniciada...");
        
        const data = await request.formData();
        const lugaresRaw = data.get('lugares');
        const configZonasRaw = data.get('config_zonas');
        const nomeSala = data.get('sala');

        if (!nomeSala) return fail(400, { message: 'Nenhuma sala selecionada.' });

        // Parse dos dados recebidos
        const todosLugares = JSON.parse(lugaresRaw || '[]');
        const configZonas = configZonasRaw || '{}';

        // Filtramos apenas os lugares que o Admin deixou visíveis (não apagados)
        const lugaresParaGuardar = todosLugares.filter(l => l.visivel === true);

        try {
            // 1. Verificar se a sala existe e obter o ID
            const salaRes = await query('SELECT id_sala FROM Sala WHERE nome_sala = ?', [nomeSala]);
            if (salaRes.length === 0) return fail(404, { message: 'Sala não encontrada no sistema.' });
            const id_sala = salaRes[0].id_sala;

            // 2. Guardar a configuração técnica (o "molde" do modal)
            await query('UPDATE Sala SET config_zonas = ? WHERE id_sala = ?', [configZonas, id_sala]).catch(() => {
                console.warn("Aviso: Falha ao guardar config_zonas. Verifica se a coluna existe na tabela Sala.");
            });

            // 3. Limpar lugares e zonas antigas para evitar duplicados
            await query('DELETE FROM Lugar WHERE id_sala = ?', [id_sala]);
            await query('DELETE FROM Zona WHERE id_sala = ?', [id_sala]);

            if (lugaresParaGuardar.length === 0) return { success: true, message: 'Mapa limpo.' };

            // 4. Inserir Zonas e Lugares
            const mapaZonas = {}; // Cache para IDs de zonas recém-criadas

            for (const l of lugaresParaGuardar) {
                // Criar a zona se ainda não existir para esta inserção
                if (!mapaZonas[l.zona]) {
                    const resZona = await query(
                        'INSERT INTO Zona (id_zona_tecnico, nome_zona, id_sala, preco_base) VALUES (?, ?, ?, ?)',
                        [l.zona, l.nomeZona || l.zona, id_sala, l.preco || 0]
                    ).catch(async () => {
                        // Fallback caso não tenhas a coluna id_zona_tecnico
                        return await query(
                            'INSERT INTO Zona (nome_zona, id_sala, preco_base) VALUES (?, ?, ?)',
                            [l.nomeZona || l.zona, id_sala, l.preco || 0]
                        );
                    });
                    mapaZonas[l.zona] = resZona.insertId;
                }
                
                const id_zona_final = mapaZonas[l.zona];

                // Inserir o lugar físico
                await query(
                    `INSERT INTO Lugar (fila, coluna, coordenadas_x, coordenadas_y, id_sala, id_zona, nome_zona_tecnico) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        l.fila, 
                        l.num, 
                        Math.round(l.x), 
                        Math.round(l.y), 
                        id_sala, 
                        id_zona_final,
                        l.nomeZona
                    ]
                ).catch(async () => {
                    // Fallback caso não tenhas a coluna nome_zona_tecnico na tabela Lugar
                    return await query(
                        `INSERT INTO Lugar (fila, coluna, coordenadas_x, coordenadas_y, id_sala, id_zona) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [l.fila, l.num, Math.round(l.x), Math.round(l.y), id_sala, id_zona_final]
                    );
                });
            }

            console.log(`Sucesso: ${lugaresParaGuardar.length} lugares guardados.`);
            return { success: true };

        } catch (err) {
            console.error("ERRO CRÍTICO AO GUARDAR:", err);
            return fail(500, { message: 'Erro interno ao processar base de dados: ' + err.message });
        }
    },

    criarSala: async ({ request }) => {
        const data = await request.formData();
        const nome = data.get('nome');
        const descricao = data.get('descricao');
        let svg_code = data.get('svg_code');

        if (!nome || !svg_code) return fail(400, { message: 'Nome e SVG são obrigatórios.' });

        try {
            const result = await query(
                'INSERT INTO Sala (nome_sala, descricao_sala, svg_code) VALUES (?, ?, ?)',
                [nome, descricao, svg_code.trim()]
            );
            return { success: true, id: result.insertId };
        } catch (err) {
            console.error('ERRO AO CRIAR SALA:', err);
            return fail(500, { message: 'Erro ao criar sala.' });
        }
    }
};