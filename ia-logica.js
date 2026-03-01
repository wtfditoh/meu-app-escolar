const GROQ_KEY = "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";

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const history = localStorage.getItem('dt_chat_history');
    if (history) document.getElementById('dt-chat-box').innerHTML = history;
});

function clearChat() {
    if(confirm("Limpar conversa?")) {
        localStorage.removeItem('dt_chat_history');
        document.getElementById('dt-chat-box').innerHTML = '<div class="dt-msg-ia">Conversa reiniciada.</div>';
    }
}

async function callIA(prompt) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role:"user", content:prompt}], temperature: 0.6 })
    });
    const data = await res.json();
    return data.choices[0].message.content;
}

async function generateSim() {
    const subj = document.getElementById('dt-subject').value;
    const lvl = document.getElementById('dt-level').value;
    if(!subj) return alert("Digite o assunto!");

    const btn = document.getElementById('btn-gen');
    btn.innerText = "Criando..."; btn.disabled = true;

    try {
        const prompt = `Gere 10 questões de ${lvl} sobre ${subj}. Retorne apenas JSON: [{"p":"pergunta","o":["a","b","c","d"],"c":0,"e":"explicação"}]`;
        const res = await callIA(prompt);
        const questions = JSON.parse(res.replace(/```json|```/g, ""));
        
        const cont = document.getElementById('dt-questions-container');
        cont.innerHTML = `<h3 style='color:#8a2be2; margin:20px 0;'>Simulado: ${subj}</h3>`;
        questions.forEach((q, i) => {
            const d = document.createElement('div');
            d.className = "dt-quest-card";
            d.innerHTML = `<p><b>${i+1}.</b> ${q.p}</p>` + 
                q.o.map((opt, idx) => `<button class="dt-opt-btn" onclick="validate(this,${idx},${q.c},'${q.e}')">${opt}</button>`).join('');
            cont.appendChild(d);
        });
    } catch(e) { alert("Erro ao gerar."); }
    finally { btn.innerText = "Gerar 10 Questões"; btn.disabled = false; }
}

function validate(btn, sel, cor, exp) {
    const btns = btn.parentElement.querySelectorAll('.dt-opt-btn');
    btns.forEach(b => b.disabled = true);
    btn.style.borderColor = (sel === cor) ? "#00ff7f" : "#ff4444";
    btns[cor].style.borderColor = "#00ff7f";
    const feedback = document.createElement('p');
    feedback.style = "font-size:12px; color:#888; margin-top:10px;";
    feedback.innerHTML = `<b>Resposta:</b> ${exp}`;
    btn.parentElement.appendChild(feedback);
}

async function sendToIA() {
    const input = document.getElementById('dt-chat-input');
    const box = document.getElementById('dt-chat-box');
    if(!input.value) return;

    const val = input.value;
    input.value = "";
    box.innerHTML += `<div class="dt-msg-user">${val}</div>`;
    box.scrollTop = box.scrollHeight;

    const res = await callIA(`Explique para um estudante: ${val}`);
    box.innerHTML += `<div class="dt-msg-ia">${res}</div>`;
    box.scrollTop = box.scrollHeight;
    localStorage.setItem('dt_chat_history', box.innerHTML);
}

function switchTab(aba) {
    document.getElementById('sec-sim').classList.toggle('active', aba === 'sim');
    document.getElementById('sec-chat').classList.toggle('active', aba === 'chat');
    document.getElementById('tab-sim').classList.toggle('active', aba === 'sim');
    document.getElementById('tab-chat').classList.toggle('active', aba === 'chat');
}
