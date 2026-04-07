const { Pool } = require('pg');
require('dotenv').config({ path: './curriculo-backend/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function tunarProjetos() {
    try {
        // 1. Portfólio Full Stack
        await pool.query(`UPDATE projetos SET 
            descricao = 'Desenvolvimento de uma plataforma completa para demonstração de competências Full-Stack, unindo gestão de dados robusta e interface premium.',
            tags = 'React 19, Node.js, PostgreSQL, Framer Motion, JWT'
            WHERE id = 4`);

        // 2. DinoPyro
        await pool.query(`UPDATE projetos SET 
            descricao = 'Projeto acadêmico de jogo 2D focado em mecânicas de física, sistemas de colisão e gerenciamento de estados dinâmicos.',
            tags = 'Godot, GDScript, Game Design, Lógica de Estados'
            WHERE id = 3`);

        // 3. Previsão de Aluguel
        await pool.query(`UPDATE projetos SET 
            descricao = 'Modelo preditivo de Machine Learning treinado para estimar valores de aluguel com base em análise exploratória de dados reais.',
            tags = 'Python, Scikit-Learn, Pandas, Machine Learning'
            WHERE id = 2`);

        // 4. BattleShip
        await pool.query(`UPDATE projetos SET 
            descricao = 'Simulação complexa de batalha naval via console, sendo o primeiro grande marco no domínio de arquitetura de software e POO.',
            tags = 'Java, POO, Algoritmos de Matriz, Lógica de Decisão'
            WHERE id = 1`);

        console.log("PROJETOS TURBINADOS NO BANCO!");
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await pool.end();
    }
}

tunarProjetos();
