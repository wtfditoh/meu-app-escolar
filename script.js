let materias = JSON.parse(localStorage.getItem('dt_materias')) || [];

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    renderizarMaterias();
});

function mudarAba(aba) {
    document.querySelectorAll('.tab-content').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('aba-' + aba).classList.add('active');
    document.getElementById('nav-' + aba).classList.add('active');
}

/* Lógica do Modal */
function adicionarMateria() {
    const modal = document.getElementById('modal-materia');
    modal.style.display = 'flex'; // Isso ativa o alinhamento centralizado
    document.getElementById('nome-materia-input').focus();
}

function fecharModal() {
    document.getElementById('modal-materia').style.display = 'none';
    document.getElementById('nome-materia-input').value = '';
}

function confirmarNovaMateria() {
    const nome = document.getElementById('nome-materia-input').value.trim();
    if (nome) {
        materias.push({ id: Date.now(), nome: nome, notas: [0, 0, 0, 0] });
        localStorage.setItem('dt_materias', JSON.stringify(materias));
        renderizarMaterias();
        fecharModal();
    }
}

function removerMateria(id) {
    if(confirm("Excluir esta matéria?")) {
        materias = materias.filter(m => m.id !== id);
        localStorage.setItem('dt_materias', JSON.stringify(materias));
        renderizarMaterias();
    }
}

function atualizarNota(id, index, valor) {
    const mat = materias.find(m => m.id === id);
    if (mat) {
        mat.notas[index] = parseFloat(valor) || 0;
        localStorage.setItem('dt_materias', JSON.stringify(materias));
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

    document.getElementById('media-geral').innerText = mediaGeral;
    document.getElementById('materias-aprovadas').innerText = `${aprovadas}/${total}`;
}
