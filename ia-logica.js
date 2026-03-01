const API_KEY = "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";

// Função para gerenciar as abas (Esconde uma, mostra a outra)
function aba(n) {
    const pSimulado = document.getElementById('painel-simulado');
    const pChat = document.getElementById('painel-chat');
    
    if(n === 'simulado') {
        pSimulado.style.display = 'block';
        pChat.style.display = 'none';
        document.getElementById('tab-simulado').classList.add('active');
        document.getElementById('tab-chat').classList.remove('active');
    } else {
        pSimulado.style.display = 'none';
        pChat.style.display = 'block';
        document.getElementById('tab-chat').classList.add('active');
        document.getElementById('tab-simulado').classList.remove('active');
    }
}

// Modal de aviso
function aviso(msg) {
    const m = document.getElementById('custom-modal');
    document.getElementById('modal-text').innerText = msg;
    m.style.display = 'flex';
}

function fecharModal() { document.getElementById('custom-modal').style.display = 'none'; }

// Limpar Histórico
function limparTudo() {
    if(confirm("Deseja apagar o histórico do Chat?")) {
        localStorage.removeItem('dt_chat_data');
        document.getElementById('chat-box').innerHTML = "";
    }
}

async function gerar() {
    const tema = document.getElementById('tema').value;
    if(!tema) return aviso("Digite o assunto do simulado!");
    
    const lista = document.getElementById('questoes');
    lista.innerHTML = "<div class='dt-card' style='text-align:center'>⏳ Criando questões e mini aula...</div>";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "user", content: `Gere 10 questões sobre ${tema}. Retorne APENAS JSON: [{"p":"pergunta","o":["a","b","c","d"],"c":0,"e":"EXPLICAÇÃO DIDÁTICA DA RESPOSTA"}]`}]
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
                        btn.style.background = "#1b4d2e !important"; // Verde Escuro
                        btn.style.borderColor = "#2ecc71 !important";
                    } else {
                        btn.style.background = "#4d1b1b !important"; // Vermelho Escuro
                        btn.style.borderColor = "#e74c3c !important";
                        card.querySelectorAll('.dt-opt-btn')[q.c].style.border = "1px solid #2ecc71";
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
    } catch(e) { lista.innerHTML = "<div class='dt-card'>Erro ao gerar simulado.</div>"; }
}

async function enviar() {
    const input = document.getElementById('msg-in');
    const box = document.getElementById('chat-box');
    if(!input.value) return;

    const texto = input.value;
    input.value = "";
    box.innerHTML += `<div class="dt-bolha user">${texto}</div>`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{role: "system", content: "Você é um tutor acadêmico. Responda apenas sobre estudos, de forma concisa e em tópicos."}, {role: "user", content: texto}]
        })
    });
    const d = await res.json();
    box.innerHTML += `<div class="dt-bolha ia">${d.choices[0].message.content.replace(/\n/g, '<br>')}</div>`;
        }
