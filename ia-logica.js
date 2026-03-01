const API_KEY = "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";

document.addEventListener('DOMContentLoaded', () => lucide.createIcons());

// FUNÇÃO DO AVISO ROXO (SUBSTITUI O ALERT)
function customAlert(msg, confirmMode = false, callback = null) {
    const modal = document.getElementById('custom-modal');
    const text = document.getElementById('modal-text');
    const btnOk = document.getElementById('btn-modal-ok');
    const btnCancel = document.getElementById('btn-modal-cancel');

    text.innerText = msg;
    modal.style.display = 'flex';
    btnCancel.style.display = confirmMode ? 'block' : 'none';

    btnOk.onclick = () => { modal.style.display = 'none'; if(callback) callback(); };
    btnCancel.onclick = () => { modal.style.display = 'none'; };
}

function perguntarLimpar() {
    customAlert("Apagar todo o histórico do chat?", true, () => {
        localStorage.clear();
        location.reload();
    });
}

function validarEGerar() {
    const sub = document.getElementById('assunto').value;
    if(!sub) return customAlert("⚠️ Digite um assunto primeiro!");
    gerarSimulado();
}

function showAba(n) {
    document.querySelectorAll('.aba-painel').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('aba-' + n).classList.add('active');
    document.getElementById('btn-' + (n == 'simulado' ? 'sim' : 'chat')).classList.add('active');
}

async function gerarSimulado() {
    const sub = document.getElementById('assunto').value;
    const lista = document.getElementById('questoes-lista');
    lista.innerHTML = "<div class='card-ia'>⏳ Criando questões...</div>";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "user", content: `Gere 10 questões sobre ${sub}. Retorne APENAS JSON puro: [{"p":"p","o":["a","b","c","d"],"c":0,"e":"ex"}]`}]
            })
        });
        const d = await res.json();
        const qts = JSON.parse(d.choices[0].message.content.replace(/```json|```/g, ""));
        
        lista.innerHTML = "";
        qts.forEach((q, i) => {
            const card = document.createElement('div');
            card.className = "card-ia";
            card.innerHTML = `<p style="margin-bottom:10px"><b>${i+1}.</b> ${q.p}</p>`;
            q.o.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = "opt-btn";
                btn.innerText = opt;
                btn.onclick = () => {
                    card.querySelectorAll('button').forEach(b => b.disabled = true);
                    btn.style.setProperty('background', idx === q.c ? '#28a745' : '#dc3545', 'important');
                    const aula = document.createElement('div');
                    aula.style = "margin-top:10px; padding:12px; background:rgba(255,255,255,0.05); border-left:3px solid #8a2be2; font-size:14px;";
                    aula.innerHTML = `<b>🎓 Aula:</b> ${q.e}`;
                    card.appendChild(aula);
                };
                card.appendChild(btn);
            });
            lista.appendChild(card);
        });
    } catch(e) { lista.innerHTML = "<div class='card-ia'>Erro ao gerar simulado.</div>"; }
}

async function enviarMsg() {
    const input = document.getElementById('chat-in');
    const box = document.getElementById('chat-box');
    if(!input.value) return;
    const v = input.value; input.value = "";
    box.innerHTML += `<div class="bolha user">${v}</div>`;
    
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role:"user", content:v}] })
    });
    const d = await res.json();
    box.innerHTML += `<div class="bolha ia">${d.choices[0].message.content}</div>`;
}
