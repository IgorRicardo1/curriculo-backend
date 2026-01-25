async function testarLogin() {
    const dados = {
        email: 'email',      
        senha: 'senha'    // Senha REAL não o hash
    };

    const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    const resultado = await response.json();
    console.log('--- Resposta do Servidor ---');
    console.log(resultado);
}

testarLogin();