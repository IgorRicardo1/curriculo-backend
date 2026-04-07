const { Pool } = require('pg');
require('dotenv').config({ path: './curriculo-backend/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrarBanco() {
    try {
        console.log("Iniciando migração de banco...");

        // 1. ADICIONAR NOVAS COLUNAS NA TABELA PROJETOS
        await pool.query(`
            ALTER TABLE projetos 
            ADD COLUMN IF NOT EXISTS desafio TEXT,
            ADD COLUMN IF NOT EXISTS engenharia TEXT,
            ADD COLUMN IF NOT EXISTS diferencial TEXT,
            ADD COLUMN IF NOT EXISTS galeria_urls TEXT[] 
        `);
        console.log("Colunas adicionadas com sucesso!");

        // 2. PREENCHER DADOS REAIS PARA OS PROJETOS EXISTENTES
        
        // Portfólio Full Stack
        await pool.query(`UPDATE projetos SET 
            desafio = 'Criar uma plataforma que demonstrasse competências técnicas profundas e um design de alta performance.',
            engenharia = 'Arquitetura REST com Node.js e PostgreSQL, integrando um frontend reativo com React 19 e animações premium do Framer Motion.',
            diferencial = 'Sistema totalmente editável via dashboard administrativo com segurança JWT.',
            galeria_urls = ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97']
            WHERE id = 4`);

        // DinoPyro
        await pool.query(`UPDATE projetos SET 
            desafio = 'Desenvolver um jogo 2D funcional para plataforma acadêmica com foco em performance e jogabilidade.',
            engenharia = 'Uso intensivo de GDScript para gerenciar sistemas de partículas, detecção de colisão e estados globais de jogo.',
            diferencial = 'Mecânicas de física customizadas sem depender totalmente de bibliotecas externas.',
            galeria_urls = ARRAY['https://images.unsplash.com/photo-1550745165-9bc0b252726f', 'https://images.unsplash.com/photo-1542751371-adc38448a05e']
            WHERE id = 3`);

        // Previsão de Aluguel
        await pool.query(`UPDATE projetos SET 
            desafio = 'Processar grandes volumes de dados reais de mercado para criar predições de valores de aluguel confiáveis.',
            engenharia = 'Pipeline de dados completo em Python, desde a limpeza inicial com Pandas até o treinamento de regressão linear.',
            diferencial = 'Análise exploratória de dados (EDA) visualmente rica para validar as decisões do modelo.',
            galeria_urls = ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f']
            WHERE id = 2`);

        // BattleShip
        await pool.query(`UPDATE projetos SET 
            desafio = 'Implementar uma lógica de jogo clássica e complexa utilizando apenas interface de console, focando em POO pura.',
            engenharia = 'Arquitetura baseada em herança, polimorfismo e interfaces em Java, com lógica de matrizes para o campo de batalha.',
            diferencial = 'Primeiro projeto a demonstrar domínio sólido sobre fundamentos de Ciência da Computação.',
            galeria_urls = ARRAY['https://images.unsplash.com/photo-1536104968055-4d61aa56f46a', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea']
            WHERE id = 1`);

        console.log("Migração concluída com sucesso!");
    } catch (err) {
        console.error("Erro na migração:", err.message);
    } finally {
        await pool.end();
    }
}

migrarBanco();
