import { createClient } from '@supabase/supabase-js'

// Lee las variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ¡IMPORTANTE!
// Crea un archivo .env.local en la raíz de tu proyecto y añade tus claves de Supabase:
// VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
// VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
