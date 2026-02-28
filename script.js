let materias = JSON.parse(localStorage.getItem('materias')) || [];

function toggleMenu() {
    document.getElementById('menu-lateral').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

function navegar(pagina) {
    if(pagina === 'agenda') alert("Agenda em desenvolvimento!");
    if(pagina === 'desempenho') alert("Gráficos detalhados em breve!");
    toggleMenu();
}

function abrirModal() { document.getElementById('modal-materia').style.display = 'flex'; }
function fecharModal() { document.getElementById('modal-materia').style.display = 'none'; }

function atualizarLista() {
    const lista = document.getElementById('lista-materias');
    lista.innerHTML = materias.map(m => {
        const media = (m.n1 + m.n2 + m.n3 + m.n4) / 4;
        const status = media >= 6 ? 'Aprovado' : 'Em curso';
        const falta = media < 6 ? (24 - (m.n1 + m.n2 + m.n3 + m.n4)).toFixed(1) : 0;
        const progresso = (media / 10) * 100;

        return `
        <div class="materia-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <h3 style="color:white; margin-bottom:4px;">${m.nome}</h3>
                    <span class="status-badge ${media >= 6 ? 'status-aprovado' : 'status-reprovado'}">${status}</span>
                </div>
                <button onclick="excluirMateria(${m.id})" class="btn-icon" style="color:#ff3d00;">
                    <i data-lucide="trash-2" style="width:18px;"></i>
                </button>
            </div>

            <div class="progress-container">
                <div class="progress-bar" style="width: ${progresso}%"></div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:11px; color:#666;">
                <span>Média: ${media.toFixed(1)}</span>
                <span>${falta > 0 ? 'Faltam ' + falta + ' pts' : 'Meta batida!'}</span>
            </div>

            <div class="bimestres-grid">
                ${[1,2,3,4].map(n => `
                    <div>
                        <input type="number" class="bimestre-input" value="${m['n'+n]}" 
                            onchange="salvarNota(${m.id}, ${n}, this.value)">
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }).join('');
    
    calcularGeral();
    lucide.createIcons(); // Isso faz a lixeira aparecer
}

function salvarNota(id, b, val) {
    const i = materias.findIndex(m => m.id === id);
    materias[i]['n'+b] = parseFloat(val) || 0;
    localStorage.setItem('materias', JSON.stringify(materias));
    atualizarLista();
}

function confirmarNovaMateria() {
    const name = document.getElementById('nome-materia-input').value;
    if(name) {
        materias.push({ id: Date.now(), nome: name, n1:0, n2:0, n3:0, n4:0 });
        localStorage.setItem('materias', JSON.stringify(materias));
        document.getElementById('nome-materia-input').value = '';
        fecharModal();
        atualizarLista();
    }
}

function excluirMateria(id) {
    if(confirm("Excluir esta disciplina?")) {
        materias = materias.filter(m => m.id !== id);
        localStorage.setItem('materias', JSON.stringify(materias));
        atualizarLista();
    }
}

function calcularGeral() {
    const total = materias.length;
    const mediaGeral = total > 0 ? (materias.reduce((acc, m) => acc + (m.n1+m.n2+m.n3+m.n4)/4, 0) / total) : 0;
    document.getElementById('media-geral').innerText = mediaGeral.toFixed(1);
    document.getElementById('aprovadas-count').innerText = `${materias.filter(m => (m.n1+m.n2+m.n3+m.n4)/4 >= 6).length}/${total}`;
}

document.addEventListener('DOMContentLoaded', atualizarLista);
