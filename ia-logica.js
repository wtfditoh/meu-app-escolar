const API_KEY = "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";

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const save = localStorage.getItem('chat_dt');
    if(save) document.getElementById('chat-box').innerHTML = save;
});

function showAba(nome) {
    document.getElementById('aba-simulado').classList.remove('active');
    document.getElementById('aba-chat').classList.remove('active');
    document.getElementById('btn-sim').classList.remove('active');
    document.getElementById('btn-chat').classList.remove('active');

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
        body: JSON.stringify({ 
            model: "llama-3.3-70b-versatile", 
            messages: [{role:"user", content:p}],
            temperature: 0.5 
        })
    });
    const d = await res.json();
    return d.choices[0].message.content;
}

// --- SISTEMA DE SIMULADO CORRIGIDO ---
async function gerarSimulado() {
    const sub = document.getElementById('assunto').value;
    const niv = document.getElementById('nivel').value;
    if(!sub) return alert("Digite o assunto!");
    
    const lista = document.getElementById('questoes-lista');
    lista.innerHTML = "<div class='card-ia'><p>⏳ Elaborando questões e mini aulas...</p></div>";

    const prompt = `Aja como um professor. Gere 10 questões de múltipla escolha sobre ${sub} para o nível ${niv}. 
    Para cada questão, forneça uma mini explicação do porquê a resposta correta é aquela.
    Retorne APENAS um JSON puro: [{"p":"pergunta","o":["a","b","c","d"],"c":index_da_correta,"e":"mini aula explicativa"}]`;

    try {
        const texto = await callIA(prompt);
        const questoes = JSON.parse(texto.replace(/```json|```/g, ""));
        lista.innerHTML = `<h2 style="margin:20px 10px; font-size:18px;">Simulado: ${sub}</h2>`;

        questoes.forEach((q, i) => {
            const containerQuestao = document.createElement('div');
            containerQuestao.className = "card-ia";
            
            // Pergunta
            const p = document.createElement('p');
            p.innerHTML = `<strong>${i+1}.</strong> ${q.p}`;
            containerQuestao.appendChild(p);

            // Opções
            q.o.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.innerText = opt;
                btn.style = "width:100%; padding:15px; margin-top:10px; background:#1a1a25; color:white; border:1px solid #333; border-radius:8px; text-align:left; cursor:pointer; transition: 0.3s;";
                
                btn.onclick = () => {
                    // 1. Bloqueia todos os botões desta questão
                    const todosBtns = containerQuestao.querySelectorAll('button');
                    todosBtns.forEach(b => b.disabled = true);

                    // 2. Pinta de verde ou vermelho
                    if(idx === q.c) {
                        btn.style.background = "#00ff7f";
                        btn.style.color = "#000";
                    } else {
                        btn.style.background = "#ff4444";
                        todosBtns[q.c].style.background = "#00ff7f"; // Mostra a certa
                        todosBtns[q.c].style.color = "#000";
                    }

                    // 3. Adiciona a Mini Aula embaixo
                    const aula = document.createElement('div');
                    aula.style = "margin-top:15px; padding:12px; background:rgba(138,43,226,0.1); border-left:4px solid #8a2be2; font-size:14px; color:#ccc; animation: fadeIn 0.5s;";
                    aula.innerHTML = `<strong>Mini Aula:</strong> ${q.e}`;
                    containerQuestao.appendChild(aula);
                };
                
                containerQuestao.appendChild(btn);
            });

            lista.appendChild(containerQuestao);
        });
    } catch(e) { 
        lista.innerHTML = "<div class='card-ia'><p>❌ Erro ao gerar. Tente novamente.</p></div>"; 
    }
}

// --- SISTEMA DE CHAT ---
async function enviarMsg() {
    const input = document.getElementById('chat-in');
    const box = document.getElementById('chat-box');
    if(!input.value) return;

    const val = input.value;
    input.value = "";
    box.innerHTML += `<div class="bolha user">${val}</div>`;
    
    // Auto-scroll
    window.scrollTo(0, document.body.scrollHeight);

    const r = await callIA(`Responda de forma curta e didática: ${val}`);
    box.innerHTML += `<div class="bolha ia">${r}</div>`;
    
    localStorage.setItem('chat_dt', box.innerHTML);
    window.scrollTo(0, document.body.scrollHeight);
}
