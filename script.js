let materias = JSON.parse(localStorage.getItem('materias')) || [];

function toggleMenu() {
    document.getElementById('menu-lateral').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

function abrirModal() { document.getElementById('modal-materia').style.display = 'flex'; }
function fecharModal() { document.getElementById('modal-materia').style.display = 'none'; }

function navegar(aba) {
    // Aqui você pode adicionar lógica para esconder as notas e mostrar a agenda no futuro
    console.log("Navegando para: " + aba);
    toggleMenu();
}

function atualizarLista() {
    const lista = document.getElementById('lista-materias');
    if(!lista) return;
    
    lista.innerHTML = materias.map(m => `
        <div class="materia-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="color: #8a2be2;">${m.nome}</h3>
                <button onclick="excluirMateria(${m.id})" style="background:none; border:none; color:#ff4d4d; font-size:12px;">Excluir</button>
            </div>
            <div class="bimestres-grid">
                ${[1,2,3,4].map(n => `
                    <div>
                        <label style="font-size:10px; color:#555; display:block; text-align:center; margin-bottom:4px;">B${n}</label>
                        <input type="number" class="bimestre-input" value="${m['n'+n] || 0}" 
                            onchange="editarNota(${m.id}, ${n}, this.value)">
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    calcularStats();
    lucide.createIcons();
}

function editarNota(id, b, val) {
    const i = materias.findIndex(m => m.id === id);
    materias[i]['n'+b] = parseFloat(val) || 0;
    localStorage.setItem('materias', JSON.stringify(materias));
    atualizarLista();
}

function confirmarNovaMateria() {
    const input = document.getElementById('nome-materia-input');
    if(input.value) {
        materias.push({ id: Date.now(), nome: input.value, n1:0, n2:0, n3:0, n4:0 });
        localStorage.setItem('materias', JSON.stringify(materias));
        input.value = '';
        fecharModal();
        atualizarLista();
    }
}

function excluirMateria(id) {
    if(confirm("Deseja apagar?")) {
        materias = materias.filter(m => m.id !== id);
        localStorage.setItem('materias', JSON.stringify(materias));
        atualizarLista();
    }
}

function calcularStats() {
    const total = materias.length;
    let somaMedias = 0;
    let aprovadas = 0;

    materias.forEach(m => {
        const media = (m.n1 + m.n2 + m.n3 + m.n4) / 4;
        somaMedias += media;
        if(media >= 6) aprovadas++;
    });

    document.getElementById('media-geral').innerText = total > 0 ? (somaMedias / total).toFixed(1) : "0.0";
    document.getElementById('aprovadas-count').innerText = `${aprovadas}/${total}`;
}

document.addEventListener('DOMContentLoaded', atualizarLista);
