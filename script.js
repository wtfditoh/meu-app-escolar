function mudarAba(aba) {
    document.querySelectorAll('.tab-content').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('aba-' + aba).classList.add('active');
    document.getElementById('nav-' + aba).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
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
    if(confirm("Excluir esta matéria?")) {
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
                            ${isAprovado ? 'APROVADO' : (24 - total).toFixed(1) + ' FALTAM'}
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
    if (window.lucide) lucide.createIcons();
    atualizarStats();
}

function atualizarStats() {
    const total = materias.length;
    const aprovadas = materias.filter(m => m.notas.reduce((a, b) => a + b, 0) >= 24).length;
    const somaGeral = materias.reduce((acc, m) => acc + m.notas.reduce((a, b) => a + b, 0), 0);
    const mediaGeral = total ? (somaGeral / (total * 4)).toFixed(1) : "0.0";

    if (document.getElementById('media-geral')) document.getElementById('media-geral').innerText = mediaGeral;
    if (document.getElementById('materias-aprovadas')) document.getElementById('materias-aprovadas').innerText = `${aprovadas}/${total}`;
}
