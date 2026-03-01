// --- MÁSCARA DE TELEFONE ---
const inputPhone = document.getElementById('login-phone');

inputPhone.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    
    if (v.length > 0) {
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2"); // Coloca parênteses no DDD
    }
    if (v.length > 9) {
        v = v.replace(/(\d)(\d{4})$/, "$1-$2"); // Coloca o hífen no final
    }
    
    e.target.value = v;
});

// --- FUNÇÃO DE LOGIN ---
function mostrarErro(msg) {
    const status = document.getElementById('login-status');
    status.innerText = msg;
    setTimeout(() => { status.innerText = ""; }, 3000);
}

function tentarLogar() {
    const phone = inputPhone.value;
    
    // Validação simples de tamanho (DDD + 9 dígitos)
    if (phone.length < 14) {
        mostrarErro("Insira um número válido!");
        return;
    }

    // Limpa o número para salvar apenas dígitos no banco
    const phoneClean = phone.replace(/\D/g, '');

    // Salva as informações que a sua Agenda e Notas já esperam
    localStorage.setItem('dt_user_phone', phoneClean);
    localStorage.setItem('dt_user_type', 'cloud'); // Define que é usuário da nuvem

    // Redireciona para a home (index.html)
    window.location.href = 'index.html';
}

function entrarComoVisitante() {
    localStorage.setItem('dt_user_phone', 'visitante');
    localStorage.setItem('dt_user_type', 'local');
    window.location.href = 'index.html';
}
