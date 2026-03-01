const API_KEY = "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";

// Carregar histórico ao abrir
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const salvo = localStorage.getItem('dt_chat_data');
    if (salvo) document.getElementById('chat-respostas').innerHTML = salvo;
});

function mostrarToast(txt) {
    const t = document.getElementById('custom-toast');
    t.innerText = txt; t.style.top = "20px";
    setTimeout(() => { t.style.top = "-100px"; }, 3000);
}

function limparHistorico() {
    if(confirm("Apagar toda a conversa?")) {
        localStorage.removeItem('dt_chat_data');
        document.getElementById('chat-respostas').innerHTML = '<div class="msg-ia">Conversa reiniciada.</div>';
    }
}

async function chamarIA(p) {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role:"user", content:p}], temperature: 0.6 })
    });
    const d = await r.json();
    return d.choices[0].message.content;
}

// SIMULADO
async function gerarQuestoes() {
    const assunto = document.getElementById('assunto-ia').value;
    const nivel = document.getElementById('nivel-ia').value;
    if(!assunto) return mostrarToast("Por favor, digite o assunto!");

    const btn = document.getElementById('btn-gerar');
    btn.innerText = "Gerando..."; btn.disabled = true;

    try {
        const prompt = `Gere 10 questões de múltipla escolha para ${nivel} sobre ${assunto}. Retorne APENAS JSON: [{"p":"pergunta","o":["a","b","c","d"],"c":0,"e":"explicação"}]`;
        const res = await chamarIA(prompt);
        const questoes = JSON.parse(res.replace(/```json|```/g, ""));
        
        const cont = document.getElementById('container-questoes');
        cont.innerHTML = `<h3 style='color:var(--primary); margin:20px 0;'>Simulado: ${assunto}</h3>`;
        questoes.forEach((q, i) => {
            const d = document.createElement('div');
            d.innerHTML = `<div style='margin-bottom:20px;'><p><strong>${i+1}.</strong> ${q.p}</p>` + 
                q.o.map((opt, idx) => `<button class="opcao-btn" onclick="validar(this,${idx},${q.c},'${q.e}')">${opt}</button>`).join('') + `</div>`;
            cont.appendChild(d);
        });
    } catch(e) { mostrarToast("Erro na IA. Tente de novo."); }
    finally { btn.innerText = "Gerar 10 Questões"; btn.disabled = false; }
}

function validar(btn, sel, cor, exp) {
    const pai = btn.parentElement;
    const btns = pai.querySelectorAll('.opcao-btn');
    btns.forEach(b => b.disabled = true);
    btn.style.border = (sel === cor) ? "2px solid #00ff7f" : "2px solid #ff4444";
    btns[cor].style.border = "2px solid #00ff7f";
    const f = document.createElement('p');
    f.style = "font-size:12px; color:#888; margin-top:10px;";
    f.innerHTML = `<strong>Explicação:</strong> ${exp}`;
    pai.appendChild(f);
}

// CHAT COM SCROLL
async function perguntarIA() {
    const input = document.getElementById('pergunta-ia');
    const box = document.getElementById('chat-respostas');
    if(!input.value) return;

    const msg = input.value;
    input.value = "";
    box.innerHTML += `<div class="msg-user">${msg}</div>`;
    box.scrollTop = box.scrollHeight;

    const res = await chamarIA(`Responda de forma curta para um estudante: ${msg}`);
    box.innerHTML += `<div class="msg-ia">${res}</div>`;
    box.scrollTop = box.scrollHeight;
    localStorage.setItem('dt_chat_data', box.innerHTML);
}

function trocarAba(aba) {
    const isSim = aba === 'simulado';
    document.getElementById('secao-simulado').classList.toggle('active', isSim);
    document.getElementById('secao-chat').classList.toggle('active', !isSim);
    document.getElementById('t-sim').classList.toggle('active', isSim);
    document.getElementById('t-chat').classList.toggle('active', !isSim);
}
