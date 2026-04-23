const { Pool } = require('pg');
const translate = require('translate-google');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function autoTranslate() {
    try {
        console.log("🚀 Iniciando processo de tradução automática...");

        // 1. ADICIONAR COLUNAS DE IDIOMA (Caso não existam)
        console.log("📌 Verificando colunas de idioma...");
        
        await pool.query(`
            ALTER TABLE perfil 
            ADD COLUMN IF NOT EXISTS titulo_en TEXT,
            ADD COLUMN IF NOT EXISTS titulo_es TEXT,
            ADD COLUMN IF NOT EXISTS resumo_curto_en TEXT,
            ADD COLUMN IF NOT EXISTS resumo_curto_es TEXT,
            ADD COLUMN IF NOT EXISTS bio_en TEXT,
            ADD COLUMN IF NOT EXISTS bio_es TEXT;

            ALTER TABLE experiencias 
            ADD COLUMN IF NOT EXISTS cargo_en TEXT,
            ADD COLUMN IF NOT EXISTS cargo_es TEXT,
            ADD COLUMN IF NOT EXISTS descricao_en TEXT,
            ADD COLUMN IF NOT EXISTS descricao_es TEXT;

            ALTER TABLE formacao 
            ADD COLUMN IF NOT EXISTS curso_en TEXT,
            ADD COLUMN IF NOT EXISTS curso_es TEXT;

            ALTER TABLE projetos 
            ADD COLUMN IF NOT EXISTS titulo_en TEXT,
            ADD COLUMN IF NOT EXISTS titulo_es TEXT,
            ADD COLUMN IF NOT EXISTS descricao_en TEXT,
            ADD COLUMN IF NOT EXISTS descricao_es TEXT,
            ADD COLUMN IF NOT EXISTS desafio_en TEXT,
            ADD COLUMN IF NOT EXISTS desafio_es TEXT,
            ADD COLUMN IF NOT EXISTS engenharia_en TEXT,
            ADD COLUMN IF NOT EXISTS engenharia_es TEXT,
            ADD COLUMN IF NOT EXISTS diferencial_en TEXT,
            ADD COLUMN IF NOT EXISTS diferencial_es TEXT;
        `);

        // 2. TRADUZIR PERFIL
        console.log("👤 Traduzindo Perfil...");
        const perfis = await pool.query("SELECT * FROM perfil");
        for (let p of perfis.rows) {
            const titulo_en = await translate(p.titulo, { to: 'en' });
            const titulo_es = await translate(p.titulo, { to: 'es' });
            const resumo_en = await translate(p.resumo_curto, { to: 'en' });
            const resumo_es = await translate(p.resumo_curto, { to: 'es' });
            const bio_en = await translate(p.bio, { to: 'en' });
            const bio_es = await translate(p.bio, { to: 'es' });

            await pool.query(
                "UPDATE perfil SET titulo_en = $1, titulo_es = $2, resumo_curto_en = $3, resumo_curto_es = $4, bio_en = $5, bio_es = $6 WHERE id = $7",
                [titulo_en, titulo_es, resumo_en, resumo_es, bio_en, bio_es, p.id]
            );
        }

        // 3. TRADUZIR EXPERIÊNCIAS
        console.log("💼 Traduzindo Experiências...");
        const exps = await pool.query("SELECT * FROM experiencias");
        for (let e of exps.rows) {
            const cargo_en = await translate(e.cargo, { to: 'en' });
            const cargo_es = await translate(e.cargo, { to: 'es' });
            const desc_en = await translate(e.descricao, { to: 'en' });
            const desc_es = await translate(e.descricao, { to: 'es' });

            await pool.query(
                "UPDATE experiencias SET cargo_en = $1, cargo_es = $2, descricao_en = $3, descricao_es = $4 WHERE id = $5",
                [cargo_en, cargo_es, desc_en, desc_es, e.id]
            );
        }

        // 4. TRADUZIR FORMAÇÃO
        console.log("🎓 Traduzindo Formação...");
        const educs = await pool.query("SELECT * FROM formacao");
        for (let ed of educs.rows) {
            const curso_en = await translate(ed.curso, { to: 'en' });
            const curso_es = await translate(ed.curso, { to: 'es' });

            await pool.query(
                "UPDATE formacao SET curso_en = $1, curso_es = $2 WHERE id = $3",
                [curso_en, curso_es, ed.id]
            );
        }

        // 5. TRADUZIR PROJETOS
        console.log("🚀 Traduzindo Projetos...");
        const projs = await pool.query("SELECT * FROM projetos");
        for (let pr of projs.rows) {
            const tit_en = await translate(pr.titulo, { to: 'en' });
            const tit_es = await translate(pr.titulo, { to: 'es' });
            const desc_en = await translate(pr.descricao, { to: 'en' });
            const desc_es = await translate(pr.descricao, { to: 'es' });
            const desafio_en = await translate(pr.desafio, { to: 'en' });
            const desafio_es = await translate(pr.desafio, { to: 'es' });
            const eng_en = await translate(pr.engenharia, { to: 'en' });
            const eng_es = await translate(pr.engenharia, { to: 'es' });
            const dif_en = await translate(pr.diferencial, { to: 'en' });
            const dif_es = await translate(pr.diferencial, { to: 'es' });

            await pool.query(
                "UPDATE projetos SET titulo_en = $1, titulo_es = $2, descricao_en = $3, descricao_es = $4, desafio_en = $5, desafio_es = $6, engenharia_en = $7, engenharia_es = $8, diferencial_en = $9, diferencial_es = $10 WHERE id = $11",
                [tit_en, tit_es, desc_en, desc_es, desafio_en, desafio_es, eng_en, eng_es, dif_en, dif_es, pr.id]
            );
        }

        console.log("✅ Tradução automática concluída com sucesso!");

    } catch (err) {
        console.error("❌ Erro durante a tradução:", err.message);
    } finally {
        await pool.end();
    }
}

autoTranslate();
