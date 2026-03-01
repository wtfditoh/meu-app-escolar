const API_KEY = "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";

// Regra de comportamento da IA
const ROLE_ESTUDOS = "Você é um professor particular da DT Escola. Ajude APENAS com temas escolares/acadêmicos. Seja curto e use tópicos claros. Se fugirem do tema, recuse educadamente.";

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const save = localStorage.getItem('dt_chat_data');
    if(save) document.getElementById('chat-box').innerHTML = save;
});

// MODAL SEGURO
function aviso(msg, confirmMode = false, acao = null) {
    const m = document.getElementById('custom-modal');
    document.getElementById('modal-text').innerText = msg;
    m.style.display = 'flex';
    
    const bC = document.getElementById('btn-modal-cancel');
    const bO = document.getElementById('btn-modal-ok');
    
    bC.style.display = confirmMode ? 'block' : 'none';
    bO.onclick = () => { m.style.display = 'none'; if(acao) acao(); };
    bC.onclick = () => { m.style.display = 'none'; };
}

function limparTudo() {
    aviso("Apagar conversa?", true, () => {
        localStorage.removeItem('dt_chat_data');
        location.reload();
    });
}

function aba(n) {
    document.querySelectorAll('.dt-painel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.dt-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('painel-' + n).classList.add('active');
    document.getElementById('tab-' + n).classList.add('active');
}

async function chamarIA(prompt, isChat = true) {
    const corpo = {
        model: "llama-3.3-70b-versatile",
        messages: [
            {role: "system", content: isChat ? ROLE_ESTUDOS : "Gere JSON puro de 10 questões: [{'p':'?','o':['a','b','c','d'],'c':0,'e':'aula'}]"},
            {role: "user", content: prompt}
        ],
        temperature: 0.4
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    });
    const d = await res.json();
    return d.choices[0].message.content;
}

async function gerar() {
    const tema = document.getElementById('tema').value;
    if(!tema) return aviso("Digite o assunto!");
    
    const lista = document.getElementById('questoes');
    lista.innerHTML = "<div class='dt-card'>⌛ Criando simulado...</div>";

    try {
        const r = await chamarIA(`Simulado de ${tema}`, false);
        const qts = JSON.parse(r.match(/\[.*\]/s)[0]);
        lista.innerHTML = "";

        qts.forEach((q, i) => {
            const div = document.createElement('div');
            div.className = "dt-card";
            div.innerHTML = `<p><b>${i+1}.</b> ${q.p}</p>`;
            q.o.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = "dt-btn-gerar"; 
                btn.style.marginTop = "10px";
                btn.style.background = "#333";
                btn.innerText = opt;
                btn.onclick = () => {
                    div.querySelectorAll('button').forEach(b => b.disabled = true);
                    btn.style.background = idx === q.c ? "#28a745" : "#dc3545";
                    const aula = document.createElement('div');
                    aula.style = "margin-top:10px; font-size:13px; color:#aaa;";
                    aula.innerHTML = `<b>🎓 Aula:</b> ${q.e}`;
                    div.appendChild(aula);
                };
                div.appendChild(btn);
            });
            lista.appendChild(div);
        });
    } catch(e) { lista.innerHTML = "<div class='dt-card'>Erro ao gerar. Tente outro tema.</div>"; }
}

async function enviar() {
    const input = document.getElementById('msg-in');
    const box = document.getElementById('chat-box');
    if(!input.value) return;
    
    const txt = input.value;
    input.value = "";
    box.innerHTML += `<div class="dt-bolha user">${txt}</div>`;
    
    const r = await chamarIA(txt);
    // Formata tópicos da IA para não ficar tudo grudado
    const formatado = r.replace(/\d\./g, '<br><b>$&</b>').replace(/\*\*/g, '');
    
    box.innerHTML += `<div class="dt-bolha ia">${formatado}</div>`;
    localStorage.setItem('dt_chat_data', box.innerHTML);
    window.scrollTo(0, document.body.scrollHeight);
}
