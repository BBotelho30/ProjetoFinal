// @ts-nocheck
import { json } from '@sveltejs/kit';
import { query } from '$lib/db';
import { supabase } from '$lib/supabaseClient';

/* =======================
   GET – listar reservas
======================= */
export const GET = async ({ request }) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return json({ error: 'Invalid token' }, { status: 401 });
  }

  const supabaseId = data.user.id;

  const users = await query(
    'SELECT id_utilizador FROM Utilizadores WHERE supabase_id = ?',
    [supabaseId]
  );

  if (!users.length) return json([]);

  const reservas = await query(`
    SELECT 
      r.id_reserva,
      r.data_reserva,
      r.estado_reserva,
      r.id_lugar,
      e.nome_evento,
      s.nome_sala
    FROM Reserva r
    JOIN Eventos e ON e.id_evento = r.id_evento
    JOIN Sala s ON s.id_sala = e.id_sala
    WHERE r.id_utilizador = ?
    ORDER BY r.data_reserva DESC
  `, [users[0].id_utilizador]);

  return json(reservas);
};

/* =======================
   POST – criar reserva
======================= */
export const POST = async ({ request }) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return json({ error: 'Invalid token' }, { status: 401 });
  }

  const supabaseId = data.user.id;
  const { id_lugar, id_evento } = await request.json();

  // buscar utilizador
  const users = await query(
    'SELECT id_utilizador FROM Utilizadores WHERE supabase_id = ?',
    [supabaseId]
  );

  if (!users.length) {
    return json({ error: 'Utilizador não encontrado' }, { status: 404 });
  }

  const id_utilizador = users[0].id_utilizador;

  // verificar se já está ocupado
  const existe = await query(`
    SELECT 1 FROM Reserva
    WHERE id_lugar = ? AND id_evento = ?
    AND estado_reserva != 'cancelada'
  `, [id_lugar, id_evento]);

  if (existe.length) {
    return json({ error: 'Lugar já ocupado' }, { status: 409 });
  }

  // criar reserva
  await query(`
    INSERT INTO Reserva 
      (id_lugar, id_evento, id_utilizador, estado_reserva, data_reserva)
    VALUES (?, ?, ?, 'ocupado', NOW())
  `, [id_lugar, id_evento, id_utilizador]);

  return json({ success: true });
};
