const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const app = express();

app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'https://curriculo-frontend.vercel.app',
  'https://www.igorricardo.dev',
  'https://igorricardo.dev'
];

app.use(cors({
  origin: function (origin, callback) {
    // Em produção, remova '!origin' para não aceitar requisições de ferramentas fora do browser (como curl)
    if (allowedOrigins.indexOf(origin) !== -1 || (!origin && process.env.NODE_ENV !== 'production')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS: Acesso não autorizado.'));
    }
  }
}));

app.use(express.json());

// Evitar que o processo caia sem fechar o banco
process.on('SIGINT', () => {
    pool.end().then(() => {
        console.log('Pool de conexões fechado. Encerrando servidor...');
        process.exit(0);
    });
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Muitas tentativas de login. Tente novamente após 15 minutos." }
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado: Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado' });
        }
        req.usuario = usuario;
        next();
    });
};

app.get('/', (req, res) => {
    res.json({
        status: "Online",
        api: "Igor Portfolio API v1.0"
    });
});

app.get('/health', async (req, res) => {
    try {
        // Tenta o banco, mas não trava o health se o banco estiver apenas 'dormindo'
        pool.query('SELECT 1').catch(err => console.error("Database sleep/error:", err.message));
        res.status(200).json({ status: 'ok', message: 'Servidor ativo' });
    } catch (err) {
        res.status(200).json({ status: 'warning', message: 'Servidor ok, erro interno ao processar' });
    }
});

app.get('/perfil', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*, 
                COALESCE((SELECT json_agg(e.* ORDER BY e.id DESC) FROM experiencias e WHERE e.perfil_id = p.id), '[]') AS experiencias,
                COALESCE((SELECT json_agg(f.* ORDER BY f.id DESC) FROM formacao f WHERE f.perfil_id = p.id), '[]') AS formacao,
                COALESCE((SELECT json_agg(proj.* ORDER BY proj.id DESC) FROM projetos proj WHERE proj.perfil_id = p.id), '[]') AS projetos
            FROM perfil p
            LIMIT 1; 
        `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("Erro ao buscar perfil:", err.message);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

app.post('/login', loginLimiter, async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = result.rows[0];

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const senhaBate = await bcrypt.compare(senha, usuario.senha);

        if (!senhaBate) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            auth: true,
            token: token,
            usuario: { email: usuario.email }
        });
    } catch (err) {
        console.error("Erro no login:", err.message);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

app.delete('/projetos/:id', autenticarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM projetos WHERE id = $1 RETURNING *', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Projeto não encontrado" });
        }
        
        res.json({ message: "Projeto removido com sucesso" });
    } catch (err) {
        console.error("Erro ao deletar projeto:", err.message);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

app.post('/projetos', autenticarToken, async (req, res) => {
    const { titulo, descricao, imagem_url, link_repo, link_demo, tags } = req.body;

    if (!titulo || !descricao) {
        return res.status(400).json({ error: "Título e descrição são obrigatórios" });
    }

    const perfil_id = 1; 
    try {
        const querySQL = `
            INSERT INTO projetos (perfil_id, titulo, descricao, imagem_url, link_repo, link_demo, tags) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
        `;
        const valores = [perfil_id, titulo, descricao, imagem_url, link_repo, link_demo, tags];
        const resultado = await pool.query(querySQL, valores);
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error("Erro ao criar projeto:", err.message);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});
