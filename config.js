const config = {
  PORT: process.env.PORT || 1231,
  DATABASE: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
  }
};

module.exports = config;
