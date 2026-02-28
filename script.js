let materias = JSON.parse(localStorage.getItem('materias')) || [];
let graficoInstancia = null;

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    atualizarLista();
});

// MENU E NAVEGAÇÃO
function toggleMenu() {
    document.getElementById('menu-lateral').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

function navegar(aba) {
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    document.querySelectorAll('.nav-item-drawer').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById('aba-' + aba).style.display = 'block';
    document.getElementById('btn-nav-' + aba).classList.add('active');
    
    if(aba === 'desempenho') renderizarGrafico();
    toggleMenu();
}

// LÓGICA DO GRÁFICO
function renderizarGrafico() {
    const ctx = document.getElementById('graficoDesempenho').getContext('2d');
    if(graficoInstancia) graficoInstancia.destroy();

    const labels = materias.length > 0 ? materias.map(m => m.nome) : ['Sem dados'];
    const notas = materias.length > 0 ? materias.map(m => parseFloat(m.nota || 0)) : [0];

    graficoInstancia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Suas Notas',
                data: notas,
                borderColor: '#8a2be2',
                backgroundColor: 'rgba(138, 43, 226, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 10, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// FUNÇÕES DE MATÉRIA (ADICIONAR/REMOVER) - Mantenha as que você já tem ou use essas simplificadas:
function adicionarMateria() { document.getElementById('modal-materia').style.display = 'flex'; }
function fecharModal() { document.getElementById('modal-materia').style.display = 'none'; }

function confirmarNovaMateria() {
    const nome = document.getElementById('nome-materia-input').value;
    if(nome) {
        materias.push({ id: Date.now(), nome: nome, nota: 0 });
        localStorage.setItem('materias', JSON.stringify(materias));
        atualizarLista();
        fecharModal();
        document.getElementById('nome-materia-input').value = '';
    }
}

function atualizarLista() {
    const lista = document.getElementById('lista-materias');
    lista.innerHTML = materias.map(m => `
        <div class="stat-item" style="margin-bottom:10px; text-align:left; display:flex; justify-content:space-between; align-items:center;">
            <span>${m.nome}</span>
            <input type="number" value="${m.nota}" onchange="atualizarNota(${m.id}, this.value)" style="width:50px; background:none; border:1px solid #444; color:white; text-align:center; border-radius:5px;">
        </div>
    `).join('');
    
    // Cálculos de média geral aqui...
    const media = materias.length ? (materias.reduce((a, b) => a + parseFloat(b.nota), 0) / materias.length).toFixed(1) : "0.0";
    document.getElementById('media-geral').innerText = media;
    document.getElementById('materias-aprovadas').innerText = `${materias.filter(m => m.nota >= 6).length}/${materias.length}`;
}

function atualizarNota(id, valor) {
    const index = materias.findIndex(m => m.id === id);
    materias[index].nota = valor;
    localStorage.setItem('materias', JSON.stringify(materias));
    atualizarLista();
}
