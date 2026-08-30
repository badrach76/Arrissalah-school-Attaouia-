import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'sb_publishable_HnxeYpiIqU7BXYJ5EfCTtQ_Xtom-SXC'
const SUPABASE_ANON_KEY = 'sb_secret_Eajp8
••••••••••••••••-SXC-SXC'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
