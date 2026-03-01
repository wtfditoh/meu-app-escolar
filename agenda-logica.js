let mesExibido = new Date();
let dataSelecionada = "";
let imagemBase64 = "";

document.addEventListener('DOMContentLoaded', () => {
    carregarMateriasNoSelect();
    renderizarCalendario();
    carregarTarefas();
});

function carregarMateriasNoSelect() {
    const select = document.getElementById('tarefa-materia');
    const materiasSalvas = localStorage.getItem('materias_db') || localStorage.getItem('materias');
    const materiasDB = JSON.parse(materiasSalvas || '[]');
    select.innerHTML = '<option value="Geral">Geral / Outros</option>';
    if (materiasDB.length > 0) {
        materiasDB.forEach(m => {
            if(m.nome) {
                const opt = document.createElement('option');
                opt.value = m.nome; opt.textContent = m.nome;
                select.appendChild(opt);
            }
        });
    }
}

function renderizarCalendario() {
    const grid = document.getElementById('calendar-grid');
    const topoMes = document.getElementById('mes-topo');
    grid.innerHTML = "";
    const nomesDias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    nomesDias.forEach(d => grid.innerHTML += `<div class="dia-semana">${d}</div>`);

    const ano = mesExibido.getFullYear();
    const mes = mesExibido.getMonth();
    topoMes.innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesExibido);

    const primeiroDiaMes = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const agenda = JSON.parse(localStorage.getItem('dt_agenda') || '[]');

    for (let i = 0; i < primeiroDiaMes; i++) grid.innerHTML += `<div></div>`;

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const temTarefa = agenda.some(t => dataStr >= t.dataInicio && dataStr <= t.dataFim);
        const hoje = new Date().toISOString().split('T')[0] === dataStr ? 'hoje' : '';
        const sel = dataSelecionada === dataStr ? 'selecionado' : '';
        
        grid.innerHTML += `
            <div class="dia-numero ${hoje} ${sel}" onclick="selecionarDia('${dataStr}')">
                ${dia}
                ${temTarefa ? '<div class="dot"></div>' : ''}
            </div>`;
    }
    lucide.createIcons();
}

function selecionarDia(data) {
    dataSelecionada = (dataSelecionada === data) ? "" : data;
    renderizarCalendario();
    carregarTarefas(dataSelecionada);
}

function mudarMes(valor) {
    mesExibido.setMonth(mesExibido.getMonth() + valor);
    renderizarCalendario();
}

function abrirModalAgendaHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('tarefa-data-inicio').value = dataSelecionada || hoje;
    document.getElementById('tarefa-data-fim').value = dataSelecionada || hoje;
    carregarMateriasNoSelect();
    document.getElementById('modal-agenda').style.display = 'flex';
}

function fecharModalAgenda() {
    document.getElementById('modal-agenda').style.display = 'none';
    document.getElementById('preview-container').innerHTML = "";
    imagemBase64 = "";
    document.getElementById('tarefa-nome').value = "";
    document.getElementById('tarefa-desc').value = "";
}

function previewImg(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            imagemBase64 = e.target.result;
            document.getElementById('preview-container').innerHTML = `<img src="${imagemBase64}" style="width:100%; border-radius:15px; margin-top:15px; border: 1px solid var(--primary);">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function adicionarTarefa() {
    const btnSalvar = document.getElementById('btn-salvar-agenda');
    const nome = document.getElementById('tarefa-nome').value.trim();
    const desc = document.getElementById('tarefa-desc').value.trim();
    const dataInicio = document.getElementById('tarefa-data-inicio').value;
    const dataFim = document.getElementById('tarefa-data-fim').value;
    const materia = document.getElementById('tarefa-materia').value;

    if (!nome || !dataInicio || !dataFim) {
        const txt = btnSalvar.innerText;
        btnSalvar.innerText = "Preencha tudo!";
        btnSalvar.style.backgroundColor = "#ff4444";
        setTimeout(() => { btnSalvar.innerText = txt; btnSalvar.style.backgroundColor = "#8a2be2"; }, 2000);
        return;
    }

    const nova = { id: Date.now(), nome, descricao: desc, dataInicio, dataFim, materia, imagem: imagemBase64, concluida: false };
    let agenda = JSON.parse(localStorage.getItem('dt_agenda') || '[]');
    agenda.push(nova);
    localStorage.setItem('dt_agenda', JSON.stringify(agenda));

    fecharModalAgenda();
    renderizarCalendario();
    carregarTarefas(dataFim);
}

function alternarConcluida(id) {
    let agenda = JSON.parse(localStorage.getItem('dt_agenda') || '[]');
    const index = agenda.findIndex(t => t.id === id);
    if (index !== -1) {
        agenda[index].concluida = !agenda[index].concluida;
        localStorage.setItem('dt_agenda', JSON.stringify(agenda));
        carregarTarefas(dataSelecionada);
    }
}

// FUNÇÃO PARA EXPANDIR O TEXTO CLICADO
function expandirTexto(el) {
    el.classList.toggle('expandido');
}

function carregarTarefas(filtroData = null) {
    const lista = document.getElementById('lista-agenda');
    const titulo = document.getElementById('titulo-lista');
    let agenda = JSON.parse(localStorage.getItem('dt_agenda') || '[]');
    const hojeStr = new Date().toISOString().split('T')[0];
    
    if (filtroData && filtroData !== "") {
        agenda = agenda.filter(t => filtroData >= t.dataInicio && filtroData <= t.dataFim);
        titulo.innerText = "Atividades em " + filtroData.split('-').reverse().join('/');
    } else {
        titulo.innerText = "Todas as Atividades";
    }

    if (agenda.length === 0) {
        lista.innerHTML = "<p style='color:#666; text-align:center; padding:30px;'>Nada agendado.</p>";
        return;
    }

    // ORDENAÇÃO: PENDENTES PRIMEIRO, CONCLUÍDAS POR ÚLTIMO
    agenda.sort((a, b) => {
        if (a.concluida !== b.concluida) return a.concluida ? 1 : -1; 
        return new Date(a.dataFim) - new Date(b.dataFim);
    });

    lista.innerHTML = agenda.map(t => {
        const fim = new Date(t.dataFim + "T00:00:00");
        const hoje = new Date(hojeStr + "T00:00:00");
        const diffTime = fim - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let corStatus = "#00C851"; 
        let textoStatus = `Faltam ${diffDays} dias`;

        if (t.concluida) {
            corStatus = "#00d2ff"; textoStatus = "CONCLUÍDO! 🎉";
        } else if (diffDays < 0) {
            corStatus = "#666"; textoStatus = "PRAZO ENCERRADO";
        } else if (diffDays <= 3) {
            corStatus = "#ff4444"; textoStatus = diffDays === 0 ? "ENTREGA HOJE!" : `URGENTE: Faltam ${diffDays} dias`;
        } else if (diffDays <= 7) {
            corStatus = "#ffbb33"; textoStatus = `ATENÇÃO: Faltam ${diffDays} dias`;
        }

        return `
        <div class="tarefa-item" style="border-left: 5px solid ${corStatus}; opacity: ${t.concluida ? '0.5' : '1'};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="flex: 1; min-width: 0;"> <span style="background:var(--primary); font-size:10px; padding:3px 8px; border-radius:5px; font-weight:bold; color:white;">${t.materia}</span>
                    <b onclick="alternarConcluida(${t.id})" style="display:block; margin-top:8px; font-size:18px; color:white; text-decoration: ${t.concluida ? 'line-through' : 'none'}; cursor:pointer;">
                        ${t.nome}
                    </b>
                    
                    ${t.descricao ? `
                        <p onclick="expandirTexto(this)" class="tarefa-desc-texto">${t.descricao}</p>
                    ` : ''}
                    
                    <div style="margin-top:5px; font-size:11px; color:#aaa;">Prazo: ${t.dataFim.split('-').reverse().join('/')}</div>
                    <div style="margin-top:5px; color:${corStatus}; font-weight:bold; font-size:12px;">${textoStatus}</div>
                </div>
                <div class="area-acoes">
                    <button onclick="alternarConcluida(${t.id})" style="background:rgba(0,210,255,0.1); border:none; color:#00d2ff; padding:8px; border-radius:10px;">
                        <i data-lucide="${t.concluida ? 'rotate-ccw' : 'check-circle'}" style="width:18px;"></i>
                    </button>
                    <button onclick="removerTarefa(${t.id})" style="background:rgba(255,68,68,0.1); border:none; color:#ff4444; padding:8px; border-radius:10px;">
                        <i data-lucide="trash-2" style="width:18px;"></i>
                    </button>
                </div>
            </div>
            ${t.imagem ? `<img src="${t.imagem}" style="width:100%; border-radius:15px; margin-top:15px; border: 1px solid rgba(255,255,255,0.1); filter: ${t.concluida ? 'grayscale(100%) brightness(0.5)' : 'none'};">` : ''}
        </div>`;
    }).join('');
    lucide.createIcons();
}

function removerTarefa(id) {
    let agenda = JSON.parse(localStorage.getItem('dt_agenda') || '[]');
    agenda = agenda.filter(t => t.id !== id);
    localStorage.setItem('dt_agenda', JSON.stringify(agenda));
    renderizarCalendario();
    carregarTarefas(dataSelecionada);
}
