const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

// Teste de rota
app.get('/perfil', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM perfil');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Erro ao conectar no banco de dados'});
    }
})

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor Rodando em http://localhost:${PORT}`)
})
