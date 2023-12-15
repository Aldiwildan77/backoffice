const { createClient } = require('@supabase/supabase-js');
const { DATABASE } = require('./config');

const supabaseUrl = DATABASE.SUPABASE_URL;
const supabaseKey = DATABASE.SUPABASE_KEY;
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
};

const supabase = createClient(supabaseUrl, supabaseKey, options);

console.log('info', `Supabase client is ready`);
console.log('info', `Supabase URL: ${supabaseUrl}`);

module.exports = supabase;
