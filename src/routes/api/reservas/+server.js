// @ts-nocheck
import { json } from '@sveltejs/kit';
import { query } from '$lib/db';
import { supabase } from '$lib/supabaseClient';

export const GET = async ({ request }) => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');

  // 🔐 validar token no Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return json({ error: 'Invalid token' }, { status: 401 });
  }

  const supabaseId = data.user.id;

  // 🔗 ligar ao MySQL
  const users = await query(
    'SELECT id_utilizador FROM Utilizadores WHERE supabase_id = ?',
    [supabaseId]
  );

  if (!users.length) {
    return json([]);
  }

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
