import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBh3wsAGXY-03HtT47TFlAZGWrusNtjTrc",
  authDomain: "dt-scho0l.firebaseapp.com",
  projectId: "dt-scho0l",
  storageBucket: "dt-scho0l.firebasestorage.app",
  messagingSenderId: "78578509391",
  appId: "1:78578509391:web:7f5ede4f967ca8ce292c3a",
  measurementId: "G-F7TG23TBTL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userPhone = localStorage.getItem('dt_user_phone');
const userType = localStorage.getItem('dt_user_type');

let mesExibido = new Date();
let dataSelecionada = "";
let imagemBase64 = "";
let agendaGlobal = [];

document.addEventListener('DOMContentLoaded', () => {
    window.carregarMateriasNoSelect();
    window.buscarDadosNuvem();
});

window.buscarDadosNuvem = async function() {
    if (userType === 'local') {
        agendaGlobal = JSON.parse(localStorage.getItem('dt_agenda') || '[]');
    } else {
        try {
            const q = query(collection(db, "agenda"), where("usuario", "==", userPhone));
            const snap = await getDocs(q);
            agendaGlobal = [];
            snap.forEach(d => agendaGlobal.push({ id_firebase: d.id, ...d.data() }));
        } catch (e) { console.error("Erro Google:", e); }
    }
    window.renderizarCalendario();
    window.carregarTarefas(dataSelecionada);
};

window.carregarMateriasNoSelect = function() {
    const select = document.getElementById('tarefa-materia');
    if(!select) return;
    const materiasSalvas = localStorage.getItem('materias_db') || localStorage.getItem('materias');
    const materiasDB = JSON.parse(materiasSalvas || '[]');
    select.innerHTML = '<option value="Geral">Geral / Outros</option>';
    materiasDB.forEach(m => {
        if(m.nome) {
            const opt = document.createElement('option');
            opt.value = m.nome; opt.textContent = m.nome;
            select.appendChild(opt);
        }
    });
};

window.renderizarCalendario = function() {
    const grid = document.getElementById('calendar-grid');
    const topoMes = document.getElementById('mes-topo');
    if(!grid || !topoMes) return;
    grid.innerHTML = "";
    
    const nomesDias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    nomesDias.forEach(d => grid.innerHTML += `<div class="dia-semana">${d}</div>`);

    const ano = mesExibido.getFullYear();
    const mes = mesExibido.getMonth();
    topoMes.innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesExibido);

    const primeiroDiaMes = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaMes; i++) grid.innerHTML += `<div></div>`;

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const temTarefa = agendaGlobal.some(t => dataStr >= t.dataInicio && dataStr <= t.dataFim);
        const hoje = new Date().toISOString().split('T')[0] === dataStr ? 'hoje' : '';
        const sel = dataSelecionada === dataStr ? 'selecionado' : '';
        
        grid.innerHTML += `
            <div class="dia-numero ${hoje} ${sel}" onclick="selecionarDia('${dataStr}')">
                ${dia}
                ${temTarefa ? '<div class="dot"></div>' : ''}
            </div>`;
    }
    lucide.createIcons();
};

window.selecionarDia = (data) => {
    dataSelecionada = (dataSelecionada === data) ? "" : data;
    window.renderizarCalendario();
    window.carregarTarefas(dataSelecionada);
};

window.mudarMes = (valor) => {
    mesExibido.setMonth(mesExibido.getMonth() + valor);
    window.renderizarCalendario();
};

window.abrirModalAgendaHoje = () => {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('tarefa-data-inicio').value = dataSelecionada || hoje;
    document.getElementById('tarefa-data-fim').value = dataSelecionada || hoje;
    document.getElementById('modal-agenda').style.display = 'flex';
};

window.fecharModalAgenda = () => {
    document.getElementById('modal-agenda').style.display = 'none';
    document.getElementById('preview-container').innerHTML = "";
    imagemBase64 = "";
    document.getElementById('tarefa-nome').value = "";
    document.getElementById('tarefa-desc').value = "";
};

window.previewImg = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            imagemBase64 = e.target.result;
            document.getElementById('preview-container').innerHTML = `<img src="${imagemBase64}" style="width:100%; border-radius:15px; margin-top:15px;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.adicionarTarefa = async function() {
    const nome = document.getElementById('tarefa-nome').value.trim();
    const desc = document.getElementById('tarefa-desc').value.trim();
    const dataInicio = document.getElementById('tarefa-data-inicio').value;
    const dataFim = document.getElementById('tarefa-data-fim').value;
    const materia = document.getElementById('tarefa-materia').value;

    if (!nome || !dataInicio || !dataFim) return alert("Preencha os campos!");

    const nova = { 
        nome, descricao: desc, dataInicio, dataFim, materia, 
        imagem: imagemBase64, concluida: false,
        usuario: userPhone, criadoEm: Date.now()
    };

    if (userType === 'local') {
        agendaGlobal.push(nova);
        localStorage.setItem('dt_agenda', JSON.stringify(agendaGlobal));
    } else {
        await addDoc(collection(db, "agenda"), nova);
    }

    window.fecharModalAgenda();
    window.buscarDadosNuvem();
};

window.alternarConcluida = async function(idFirebase, idLocal) {
    if (userType === 'local') {
        const index = agendaGlobal.findIndex(t => t.criadoEm === idLocal);
        if (index !== -1) {
            agendaGlobal[index].concluida = !agendaGlobal[index].concluida;
            localStorage.setItem('dt_agenda', JSON.stringify(agendaGlobal));
        }
    } else {
        const tarefa = agendaGlobal.find(t => t.id_firebase === idFirebase);
        await updateDoc(doc(db, "agenda", idFirebase), { concluida: !tarefa.concluida });
    }
    window.buscarDadosNuvem();
};

window.removerTarefa = async function(idFirebase, idLocal) {
    if (!confirm("Excluir?")) return;
    if (userType === 'local') {
        agendaGlobal = agendaGlobal.filter(t => t.criadoEm !== idLocal);
        localStorage.setItem('dt_agenda', JSON.stringify(agendaGlobal));
    } else {
        await deleteDoc(doc(db, "agenda", idFirebase));
    }
    window.buscarDadosNuvem();
};

window.carregarTarefas = (filtroData = null) => {
    const lista = document.getElementById('lista-agenda');
    const titulo = document.getElementById('titulo-lista');
    if(!lista) return;

    let tarefas = [...agendaGlobal];
    const hojeStr = new Date().toISOString().split('T')[0];
    
    if (filtroData) {
        tarefas = tarefas.filter(t => filtroData >= t.dataInicio && filtroData <= t.dataFim);
        titulo.innerText = "Atividades em " + filtroData.split('-').reverse().join('/');
    } else {
        titulo.innerText = "Todas as Atividades";
    }

    if (tarefas.length === 0) {
        lista.innerHTML = "<p style='color:#666; text-align:center; padding:30px;'>Nada agendado.</p>";
        return;
    }

    lista.innerHTML = tarefas.map(t => {
        const diffDays = Math.ceil((new Date(t.dataFim + "T00:00:00") - new Date(hojeStr + "T00:00:00")) / (1000 * 60 * 60 * 24));
        let corStatus = t.concluida ? "#00d2ff" : (diffDays < 0 ? "#666" : (diffDays <= 3 ? "#ff4444" : "#00C851"));

        return `
        <div class="tarefa-item" style="border-left: 5px solid ${corStatus}; margin-bottom:15px; background:rgba(255,255,255,0.05); padding:15px; border-radius:15px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="flex:1">
                    <span style="background:var(--primary); font-size:10px; padding:3px 8px; border-radius:5px; color:white;">${t.materia}</span>
                    <b onclick="alternarConcluida('${t.id_firebase}', ${t.criadoEm})" style="display:block; margin-top:8px; font-size:18px; color:white; text-decoration:${t.concluida ? 'line-through' : 'none'}; cursor:pointer;">${t.nome}</b>
                    <p style="color:#aaa; font-size:13px; margin:5px 0;">${t.descricao || ''}</p>
                    <div style="color:${corStatus}; font-size:11px; font-weight:bold;">Prazo: ${t.dataFim.split('-').reverse().join('/')}</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="alternarConcluida('${t.id_firebase}', ${t.criadoEm})" style="background:none; border:none; color:#00d2ff;"><i data-lucide="check-circle"></i></button>
                    <button onclick="removerTarefa('${t.id_firebase}', ${t.criadoEm})" style="background:none; border:none; color:#ff4444;"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
            ${t.imagem ? `<img src="${t.imagem}" style="width:100%; border-radius:10px; margin-top:10px; border:1px solid rgba(255,255,255,0.1);">` : ''}
        </div>`;
    }).join('');
    lucide.createIcons();
};
