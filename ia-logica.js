const API_KEY = "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";

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const save = localStorage.getItem('chat_dt');
    if(save) document.getElementById('chat-box').innerHTML = save;
});

// FUNÇÃO QUE SEPARA AS TELAS E LIBERA O SCROLL
function showAba(nome) {
    // Esconde tudo
    document.getElementById('aba-simulado').classList.remove('active');
    document.getElementById('aba-chat').classList.remove('active');
    document.getElementById('btn-sim').classList.remove('active');
    document.getElementById('btn-chat').classList.remove('active');

    // Mostra só a escolhida
    if(nome === 'simulado') {
        document.getElementById('aba-simulado').classList.add('active');
        document.getElementById('btn-sim').classList.add('active');
    } else {
        document.getElementById('aba-chat').classList.add('active');
        document.getElementById('btn-chat').classList.add('active');
        window.scrollTo(0, document.body.scrollHeight);
    }
}

async function callIA(p) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role:"user", content:p}] })
    });
    const d = await res.json();
    return d.choices[0].message.content;
}

// SIMULADO
async function gerarSimulado() {
    const sub = document.getElementById('assunto').value;
    if(!sub) return alert("Digite o assunto!");
    
    const lista = document.getElementById('questoes-lista');
    lista.innerHTML = "<p>Gerando questões...</p>";

    const prompt = `Gere 10 questões sobre ${sub}. Retorne APENAS JSON: [{"p":"pergunta","o":["a","b","c","d"],"c":0,"e":"explicação"}]`;
    const texto = await callIA(prompt);
    
    try {
        const questoes = JSON.parse(texto.replace(/```json|```/g, ""));
        lista.innerHTML = "";
        questoes.forEach((q, i) => {
            const div = document.createElement('div');
            div.className = "card-ia";
            div.innerHTML = `<p><b>${i+1}.</b> ${q.p}</p>` + 
                q.o.map((opt, idx) => `<button onclick="this.style.background='${idx==q.c?'#00ff7f':'#ff4444'}'" style="width:100%; padding:15px; margin-top:10px; background:#1a1a25; color:white; border:1px solid #333; border-radius:8px; text-align:left;">${opt}</button>`).join('');
            lista.appendChild(div);
        });
    } catch(e) { lista.innerHTML = "Erro ao gerar. Tente novamente."; }
}

// CHAT
async function enviarMsg() {
    const input = document.getElementById('chat-in');
    const box = document.getElementById('chat-box');
    if(!input.value) return;

    const val = input.value;
    input.value = "";
    box.innerHTML += `<div class="bolha user">${val}</div>`;
    
    const r = await callIA(`Responda curto: ${val}`);
    box.innerHTML += `<div class="bolha ia">${r}</div>`;
    localStorage.setItem('chat_dt', box.innerHTML);
    window.scrollTo(0, document.body.scrollHeight);
}
