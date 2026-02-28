let materias = JSON.parse(localStorage.getItem('materias')) || [];

function toggleMenu() {
    document.getElementById('menu-lateral').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

function navegar(aba) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('aba-' + aba).style.display = 'block';
    document.getElementById('btn-nav-' + aba).classList.add('active');
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
                        <label style="font-size:10px; color:#666; display:block; text-align:center;">B${n}</label>
                        <input type="number" class="bimestre-input" value="${m['n'+n] || 0}" 
                            onchange="editarNota(${m.id}, ${n}, this.value)">
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    // Atualiza Stats
    const total = materias.length;
    document.getElementById('media-geral-val').innerText = total > 0 ? (materias.reduce((acc, m) => acc + ((m.n1+m.n2+m.n3+m.n4)/4), 0) / total).toFixed(1) : "0.0";
    document.getElementById('aprovadas-val').innerText = `${materias.filter(m => ((m.n1+m.n2+m.n3+m.n4)/4) >= 6).length}/${total}`;
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
        document.getElementById('modal-materia').style.display = 'none';
        atualizarLista();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    atualizarLista();
    if(window.lucide) lucide.createIcons();
});
