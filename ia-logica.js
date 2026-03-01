const API_KEY = "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";

// Carregar histórico e ícones
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const salvo = localStorage.getItem('dt_chat_history');
    if(salvo) document.getElementById('chat-box').innerHTML = salvo;
    aba('simulado');
});

// FUNÇÃO DE LIMPAR (LIXEIRA)
function limparTudo() {
    if(confirm("Deseja apagar todo o histórico de estudos?")) {
        localStorage.removeItem('dt_chat_history');
        location.reload();
    }
}

// TROCA DE ABAS SEM VAZAR
function aba(n) {
    document.querySelectorAll('.dt-painel').forEach(p => p.style.display = 'none');
    document.getElementById('painel-' + n).style.display = 'block';
    
    document.querySelectorAll('.dt-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + n).classList.add('active');
}

function aviso(msg) {
    const m = document.getElementById('custom-modal');
    document.getElementById('modal-text').innerText = msg;
    m.style.setProperty('display', 'flex', 'important');
}

async function gerar() {
    const tema = document.getElementById('tema').value;
    if(!tema) return aviso("⚠️ Digite um assunto primeiro!");
    
    const lista = document.getElementById('questoes');
    lista.innerHTML = "<div class='dt-card'>⏳ Preparando sua aula personalizada...</div>";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "user", content: `Gere 10 questões sobre ${tema}. Retorne APENAS o JSON puro: [{"p":"pergunta","o":["a","b","c","d"],"c":0,"e":"EXPLICAÇÃO DA MATÉRIA"}]`}]
            })
        });
        
        const d = await res.json();
        const qts = JSON.parse(d.choices[0].message.content.match(/\[.*\]/s)[0]);
        lista.innerHTML = "";

        qts.forEach((q, i) => {
            const card = document.createElement('div');
            card.className = "dt-card";
            card.innerHTML = `<p><b>${i+1}.</b> ${q.p}</p>`;
            
            q.o.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = "dt-opt-btn";
                btn.innerText = opt;
                btn.onclick = () => {
                    card.querySelectorAll('.dt-opt-btn').forEach(b => b.disabled = true);
                    if(idx === q.c) {
                        btn.style.setProperty('background-color', '#28a745', 'important');
                    } else {
                        btn.style.setProperty('background-color', '#dc3545', 'important');
                        card.querySelectorAll('.dt-opt-btn')[q.c].style.border = "2px solid #28a745";
                    }
                    const aula = document.createElement('div');
                    aula.className = "dt-mini-aula";
                    aula.innerHTML = `<b>🎓 Mini Aula:</b><br>${q.e}`;
                    card.appendChild(aula);
                };
                card.appendChild(btn);
            });
            lista.appendChild(card);
        });
    } catch(e) { lista.innerHTML = "<div class='dt-card'>Erro na conexão. Tente novamente.</div>"; }
}

async function enviar() {
    const input = document.getElementById('msg-in');
    const box = document.getElementById('chat-box');
    if(!input.value) return;

    const txt = input.value;
    input.value = "";
    box.innerHTML += `<div class="dt-bolha user">${txt}</div>`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{role: "system", content: "Tutor acadêmico. Responda em tópicos curtos sobre estudos."}, {role: "user", content: txt}]
        })
    });
    const d = await res.json();
    box.innerHTML += `<div class="dt-bolha ia">${d.choices[0].message.content.replace(/\n/g, '<br>')}</div>`;
    localStorage.setItem('dt_chat_history', box.innerHTML);
}
