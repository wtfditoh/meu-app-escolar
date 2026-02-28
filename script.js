document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderizarMaterias();
});

let materias = JSON.parse(localStorage.getItem('dt_materias')) || [];

function adicionarMateria() {
    const nome = prompt("Nome da Disciplina:");
    if (!nome) return;
    materias.push({ id: Date.now(), nome: nome, notas: [0, 0, 0, 0] });
    salvar();
    renderizarMaterias();
}

function removerMateria(id) {
    if(confirm("Excluir matéria?")) {
        materias = materias.filter(m => m.id !== id);
        salvar();
        renderizarMaterias();
    }
}

function atualizarNota(id, index, valor) {
    const mat = materias.find(m => m.id === id);
    mat.notas[index] = parseFloat(valor) || 0;
    salvar();
    atualizarStats(); // Atualiza os números no topo sem recarregar tudo
}

function renderizarMaterias() {
    const container = document.getElementById('lista-materias');
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
    lucide.createIcons();
    atualizarStats();
}

function atualizarStats() {
    const totalMaterias = materias.length;
    const aprovadas = materias.filter(m => m.notas.reduce((a, b) => a + b, 0) >= 24).length;
    
    // Média Geral
    const somaNotas = materias.reduce((acc, m) => acc + m.notas.reduce((a, b) => a + b, 0), 0);
    const media = totalMaterias ? (somaNotas / (totalMaterias * 4)).toFixed(1) : "0.0";

    document.getElementById('media-geral').innerText = media;
    // MOSTRA "2/5" POR EXEMPLO
    document.getElementById('materias-aprovadas').innerText = `${aprovadas}/${totalMaterias}`;
}

function salvar() {
    localStorage.setItem('dt_materias', JSON.stringify(materias));
}
