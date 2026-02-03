import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

console.log('ENV DEBUG 👉', {
  url: env.SUPABASE_URL,
  service: env.SUPABASE_SERVICE_ROLE_KEY
});

export const supabaseServer = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);
