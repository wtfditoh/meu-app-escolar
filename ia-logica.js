const API_KEY = "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";

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

// MENU LATERAL
function toggleMenu() {
    document.getElementById('menu-lateral').classList.toggle('open');
}

// TROCA DE ABAS
function alternarAba(aba) {
    document.querySelectorAll('.dt-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.dt-tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById('painel-' + aba).classList.add('active');
    document.getElementById('tab-' + aba).classList.add('active');
    document.getElementById('menu-lateral').classList.remove('open');
}

// LIXEIRA
function limparTudo() {
    if(confirm("Apagar histórico e questões?")) {
        localStorage.clear();
        location.reload();
    }
}

// MODAL
function exibirAviso(txt) {
    document.getElementById('modal-texto-msg').innerText = txt;
    document.getElementById('modal-aviso').style.display = 'flex';
}
function fecharModal() { document.getElementById('modal-aviso').style.display = 'none'; }

// IA SIMULADO
async function gerarSimulado() {
    const tema = document.getElementById('campo-tema').value;
    if(!tema) return exibirAviso("Digite um assunto!");
    
    const container = document.getElementById('container-questoes');
    container.innerHTML = "<div class='dt-questao-card'>⏳ Preparando questões...</div>";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "user", content: `Gere 5 questões sobre ${tema}. Retorne APENAS JSON: [{"p":"pergunta","o":["a","b","c","d"],"c":0,"e":"EXPLICAÇÃO"}]`}]
            })
        });
        const d = await res.json();
        const json = JSON.parse(d.choices[0].message.content.match(/\[.*\]/s)[0]);
        container.innerHTML = "";

        json.forEach((q, i) => {
            const card = document.createElement('div');
            card.className = "dt-questao-card";
            card.innerHTML = `<p><strong>${i+1}.</strong> ${q.p}</p>`;
            q.o.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = "dt-opt-btn";
                btn.innerText = opt;
                btn.onclick = () => {
                    card.querySelectorAll('.dt-opt-btn').forEach(b => b.disabled = true);
                    btn.style.background = (idx === q.c) ? "#1b4d2e" : "#4d1b1b";
                    const aula = document.createElement('div');
                    aula.className = "dt-mini-aula";
                    aula.innerHTML = `<strong>🎓 Mini Aula:</strong><br>${q.e}`;
                    card.appendChild(aula);
                };
                card.appendChild(btn);
            });
            container.appendChild(card);
        });
    } catch(e) { container.innerHTML = "<div class='dt-questao-card'>Erro ao conectar.</div>"; }
}

// CHAT
async function enviarMensagem() {
    const input = document.getElementById('chat-input');
    if(!input.value) return;
    const box = document.getElementById('chat-box');
    box.innerHTML += `<div style="background:#8a2be2; padding:10px; border-radius:10px; margin-bottom:10px; align-self:flex-end">${input.value}</div>`;
    input.value = "";
}
