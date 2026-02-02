// src/routes/api/sync-user/+server.js
// @ts-nocheck
import { json } from '@sveltejs/kit';
import { query } from '$lib/db';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

export async function POST({ request }) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }

    const existing = await query(
      'SELECT id_utilizador FROM Utilizadores WHERE email = ?',
      [user.email]
    );

    if (existing.length === 0) {
      await query(
        `INSERT INTO Utilizadores (email, tipo, data_registo)
         VALUES (?, 'cliente', CURDATE())`,
        [user.email]
      );
    }

    return json({ success: true });

  } catch (err) {
    console.error('SYNC ERROR:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
}
