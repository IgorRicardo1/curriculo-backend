const bcrypt = require('bcryptjs');

async function criarHash() {
    const senha = 'sua_senha_aqui'; // Altere para a senha que deseja usar
    const hash = await bcrypt.hash(senha, 10);
    console.log('--- COPIE O HASH ABAIXO PARA O BANCO DE DADOS ---');
    console.log(hash);
}

criarHash();
