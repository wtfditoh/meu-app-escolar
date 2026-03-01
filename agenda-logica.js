// FORÇA O CARREGAMENTO AO ABRIR A PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    carregarTarefas();
});

let imagemBase64 = "";

function previewImg(input) {
    const reader = new FileReader();
    reader.onload = function(e) {
        imagemBase64 = e.target.result;
        document.getElementById('preview-container').innerHTML = `<img src="${imagemBase64}" style="width:100%; border-radius:10px; margin-top:10px; border: 1px solid #8a2be2;">`;
    };
    reader.readAsDataURL(input.files[0]);
}

function adicionarTarefa() {
    const nome = document.getElementById('tarefa-nome').value;
    const data = document.getElementById('tarefa-data').value;
    const materia = document.getElementById('tarefa-materia').value;

    if (!nome || !data) {
        return alert("Preencha o título e a data!");
    }

    const tarefa = {
        id: Date.now(),
        nome,
        data,
        materia,
        imagem: imagemBase64
    };

    // Puxa o que já tem, adiciona a nova e salva de volta
    let agenda = JSON.parse(localStorage.getItem('dt_agenda') || '[]');
    agenda.push(tarefa);
    localStorage.setItem('dt_agenda', JSON.stringify(agenda));

    // Limpa os campos após salvar
    document.getElementById('tarefa-nome').value = "";
    document.getElementById('tarefa-data').value = "";
    imagemBase64 = "";
    document.getElementById('preview-container').innerHTML = "";
    
    // Atualiza a lista na tela na hora
    carregarTarefas();
}

function carregarTarefas() {
    const lista = document.getElementById('lista-agenda');
    const agenda = JSON.parse(localStorage.getItem('dt_agenda') || '[]');
    
    if (agenda.length === 0) {
        lista.innerHTML = `<p style="text-align:center; color:#666; margin-top:20px;">Nenhum compromisso agendado.</p>`;
        return;
    }

    // Ordena por data (mais próximas primeiro)
    agenda.sort((a, b) => new Date(a.data) - new Date(b.data));

    lista.innerHTML = agenda.map(t => `
        <div class="tarefa-item">
            <div class="tarefa-header">
                <div class="tarefa-info">
                    <span class="badge-materia">${t.materia}</span>
                    <b>${t.nome}</b>
                    <span><i data-lucide="calendar" style="width:12px"></i> ${t.data.split('-').reverse().join('/')}</span>
                </div>
                <button class="btn-delete" onclick="removerTarefa(${t.id})">
                    <i data-lucide="trash-2" style="width:18px"></i>
                </button>
            </div>
            ${t.imagem ? `<img src="${t.imagem}" class="img-anexo">` : ''}
        </div>
    `).join('');
    
    lucide.createIcons();
}

function removerTarefa(id) {
    let agenda = JSON.parse(localStorage.getItem('dt_agenda') || '[]');
    agenda = agenda.filter(t => t.id !== id);
    localStorage.setItem('dt_agenda', JSON.stringify(agenda));
    carregarTarefas();
}
