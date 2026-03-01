const API_KEY = "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";

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    // Tenta carregar o histórico de qualquer uma das chaves que usamos antes para garantir
    const save = localStorage.getItem('dt_chat') || localStorage.getItem('dt_chat_data') || localStorage.getItem('chat_dt');
    if(save) document.getElementById('chat-box').innerHTML = save;
});

// FUNÇÃO DA LIXEIRA CORRIGIDA
function limparHistorico() {
    if(confirm("Deseja apagar todo o histórico de conversas?")) {
        // Limpa todas as possíveis chaves de memória
        localStorage.removeItem('dt_chat');
        localStorage.removeItem('dt_chat_data');
        localStorage.removeItem('chat_dt');
        
        // Limpa visualmente a tela
        document.getElementById('chat-box').innerHTML = '<div class="bolha ia">Olá! Qual sua dúvida de hoje?</div>';
        
        // Força o recarregamento para limpar estados da IA
        window.location.reload();
    }
}

function showAba(nome) {
    document.querySelectorAll('.aba-painel').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('aba-' + nome).classList.add('active');
    document.getElementById('btn-' + (nome === 'simulado' ? 'sim' : 'chat')).classList.add('active');
    if(nome === 'chat') window.scrollTo(0, document.body.scrollHeight);
}

async function callIA(p) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role:"user", content:p}], temperature: 0.5 })
    });
    const d = await res.json();
    return d.choices[0].message.content;
}

async function gerarSimulado() {
    const sub = document.getElementById('assunto').value;
    if(!sub) return alert("Digite o assunto!");
    const lista = document.getElementById('questoes-lista');
    lista.innerHTML = "<div class='card-ia'>⏳ Elaborando questões e mini aulas...</div>";

    const prompt = `Gere 10 questões para ${document.getElementById('nivel').value} sobre ${sub}. Retorne APENAS JSON: [{"p":"pergunta","o":["a","b","c","d"],"c":0,"e":"mini aula explicativa"}]`;
    
    try {
        const texto = await callIA(prompt);
        const questoes = JSON.parse(texto.replace(/```json|```/g, ""));
        lista.innerHTML = "";
        
        questoes.forEach((q, i) => {
            const div = document.createElement('div');
            div.className = "card-ia";
            div.innerHTML = `<p style='margin-bottom:15px'><b>${i+1}.</b> ${q.p}</p>`;
            
            q.o.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = "opt-btn";
                btn.innerText = opt;
                btn.onclick = () => {
                    const todos = div.querySelectorAll('.opt-btn');
                    todos.forEach(b => b.disabled = true);
                    if(idx === q.c) {
                        btn.style.setProperty('background', '#28a745', 'important');
                    } else {
                        btn.style.setProperty('background', '#dc3545', 'important');
                        todos[q.c].style.setProperty('background', '#28a745', 'important');
                    }
                    const aula = document.createElement('div');
                    aula.style = "margin-top:15px; padding:12px; background:rgba(138,43,226,0.1); border-left:4px solid #8a2be2; font-size:14px;";
                    aula.innerHTML = `<b>🎓 Mini Aula:</b> ${q.e}`;
                    div.appendChild(aula);
                };
                div.appendChild(btn);
            });
            lista.appendChild(div);
        });
    } catch(e) { lista.innerHTML = "<div class='card-ia'>Erro ao carregar. Tente novamente.</div>"; }
}

async function enviarMsg() {
    const input = document.getElementById('chat-in');
    const box = document.getElementById('chat-box');
    if(!input.value) return;
    const val = input.value;
    input.value = "";
    box.innerHTML += `<div class="bolha user">${val}</div>`;
    window.scrollTo(0, document.body.scrollHeight);

    const r = await callIA(`Responda de forma didática e curta: ${val}`);
    box.innerHTML += `<div class="bolha ia">${r}</div>`;
    // Salva na chave principal
    localStorage.setItem('dt_chat', box.innerHTML);
    window.scrollTo(0, document.body.scrollHeight);
}
