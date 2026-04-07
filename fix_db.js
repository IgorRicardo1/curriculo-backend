const { Pool } = require('pg');
require('dotenv').config({ path: './curriculo-backend/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function atualizar() {
    try {
        await pool.query(`
            UPDATE perfil 
            SET github_url = 'https://github.com/IgorRicardo1', 
                linkedin_url = 'https://www.linkedin.com/in/igor-ricardo/' 
            WHERE id = 1
        `);
        console.log("SUCESSO: Banco de dados atualizado com seus links reais!");
    } catch (err) {
        console.error("ERRO AO ATUALIZAR BANCO:", err.message);
    } finally {
        await pool.end();
    }
}

atualizar();
