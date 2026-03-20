const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necessário para conexões seguras com Supabase/AWS
    }
});

async function testar() {
    console.log("Tentando conectar ao Supabase...");
    try {
        const res = await pool.query('SELECT NOW()');
        console.log("CONECTADO COM SUCESSO! Hora no banco:", res.rows[0].now);
        process.exit(0);
    } catch (err) {
        console.error("ERRO DE CONEXÃO:");
        console.error(err.message);
        process.exit(1);
    }
}

testar();
