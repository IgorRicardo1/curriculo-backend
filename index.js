const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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
app.get('/perfil', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*, 
                -- Busca as Experiências
                COALESCE((
                    SELECT json_agg(e.* ORDER BY e.id DESC) 
                    FROM experiencias e 
                    WHERE e.perfil_id = p.id
                ), '[]') AS experiencias,
                
                -- Busca a Formação
                COALESCE((
                    SELECT json_agg(f.* ORDER BY f.id DESC) 
                    FROM formacao f 
                    WHERE f.perfil_id = p.id
                ), '[]') AS formacao,

                -- NOVO: Busca os Projetos
                COALESCE((
                    SELECT json_agg(proj.* ORDER BY proj.id DESC) 
                    FROM projetos proj 
                    WHERE proj.perfil_id = p.id
                ), '[]') AS projetos

            FROM perfil p
            LIMIT 1; 
        `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar dados do perfil' });
    }
});

//rota login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = result.rows[0];

        if (!usuario) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

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
//delete
app.delete('/projetos/:id', async (req, res) => {

    try {
        const { id } = req.params;
        await pool.query('DELETE FROM projetos WHERE id = $1', [id]);
        res.json({ message: "Deletado!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao deletar" });
    }
})

//post
app.post('/projetos', async (req, res) => {
    const { titulo, descricao, imagem_url, link_repo, tags } = req.body;
    const perfil_id = 1;
    try {
        const querySQL = 'INSERT INTO projetos (perfil_id, titulo, descricao, imagem_url, link_repo, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';
        const valores = [perfil_id, titulo, descricao, imagem_url, link_repo, tags];
        const resultado = await pool.query(querySQL, valores);
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar projeto" });
    }
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
});

