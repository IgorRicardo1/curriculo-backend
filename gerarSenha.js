const bcrypt = require('bcrypt');

async function criarHash() {
    const senha = 'senha aqui';
    const hash = await bcrypt.hash(senha, 10);
    console.log('--- COPIE O HASH ABAIXO ---');
    console.log(hash);
}

criarHash();