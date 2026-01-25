const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

// Rotas

//teste perfil
app.get('/perfil', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM perfil');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao conectar no banco de dados' });
    }
})

//rota login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = result.rows[0];

        if (!usuario) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        // A LINHA QUE FALTAVA:
        const senhaBate = await bcrypt.compare(senha, usuario.senha);

        if (!senhaBate) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            auth: true,
            token: token,
            usuario: { email: usuario.email }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
});