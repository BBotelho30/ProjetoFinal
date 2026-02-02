// @ts-nocheck
import { json } from '@sveltejs/kit';
import { query } from '$lib/db';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

export async function GET({ request }) {
  const auth = request.headers.get('authorization');
  if (!auth) return json({ error: 'No token' }, { status: 401 });

  const token = auth.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return json({ error: 'Invalid token' }, { status: 401 });
  }

  const rows = await query(
    'SELECT tipo FROM Utilizadores WHERE email = ?',
    [user.email]
  );

  if (!rows.length) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  return json({ tipo: rows[0].tipo });
}
