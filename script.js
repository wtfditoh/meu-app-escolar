// 1. FUNÇÃO DE MUDAR ABA (Garante que os botões funcionem)
function mudarAba(aba) {
    // Seleciona todas as seções e botões
    const abas = document.querySelectorAll('.tab-content');
    const botoes = document.querySelectorAll('.nav-item');

    // Esconde tudo
    abas.forEach(a => a.classList.remove('active'));
    botoes.forEach(b => b.classList.remove('active'));

    // Mostra só o que foi clicado
    const abaAtiva = document.getElementById('aba-' + aba);
    const botaoAtivo = document.getElementById('nav-' + aba);
    
    if (abaAtiva && botaoAtivo) {
        abaAtiva.classList.add('active');
        botaoAtivo.classList.add('active');
    }
}

// 2. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    renderizarMaterias();
});

let materias = JSON.parse(localStorage.getItem('dt_materias')) || [];

function salvar() {
    localStorage.setItem('dt_materias', JSON.stringify(materias));
}

function adicionarMateria() {
    const nome = prompt("Nome da Disciplina:");
    if (!nome) return;
    materias.push({ id: Date.now(), nome: nome, notas: [0, 0, 0, 0] });
    salvar();
    renderizarMaterias();
}

function removerMateria(id) {
    if(confirm("Deseja excluir esta matéria?")) {
        materias = materias.filter(m => m.id !== id);
        salvar();
        renderizarMaterias();
    }
}

function atualizarNota(id, index, valor) {
    const mat = materias.find(m => m.id === id);
    if (mat) {
        mat.notas[index] = parseFloat(valor) || 0;
        salvar();
        atualizarStats();
    }
}

function renderizarMaterias() {
    const container = document.getElementById('lista-materias');
    if (!container) return;
    container.innerHTML = '';

    materias.forEach(m => {
        const total = m.notas.reduce((a, b) => a + b, 0);
        const isAprovado = total >= 24;
        
        container.innerHTML += `
            <div class="card-materia">
                <div class="materia-info">
                    <div>
                        <h3>${m.nome}</h3>
                        <span class="status-badge ${isAprovado ? 'aprovado' : 'pendente'}">
                            ${isAprovado ? 'APROVADO' : (24 - total).toFixed(1) + ' PTS FALTAM'}
                        </span>
                    </div>
                    <button onclick="removerMateria(${m.id})" class="btn-delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="notas-grid">
                    ${m.notas.map((n, i) => `
                        <div class="input-group">
                            <label>${i+1}ºB</label>
                            <input type="number" value="${n}" onchange="atualizarNota(${m.id}, ${i}, this.value)">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
    atualizarStats();
}

function atualizarStats() {
    const total = materias.length;
    const aprovadas = materias.filter(m => m.notas.reduce((a, b) => a + b, 0) >= 24).length;
    const somaGeral = materias.reduce((acc, m) => acc + m.notas.reduce((a, b) => a + b, 0), 0);
    const mediaGeral = total ? (somaGeral / (total * 4)).toFixed(1) : "0.0";

    const elMedia = document.getElementById('media-geral');
    const elAprovadas = document.getElementById('materias-aprovadas');
    
    if (elMedia) elMedia.innerText = mediaGeral;
    if (elAprovadas) elAprovadas.innerText = `${aprovadas}/${total}`;
}
