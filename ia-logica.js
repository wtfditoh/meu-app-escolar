// Chave OpenRouter (sk-or-v1...)
const API_KEY = "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";

function trocarAba(aba) {
    const simulado = document.getElementById('secao-simulado');
    const chat = document.getElementById('secao-chat');
    const tabSim = document.getElementById('tab-simulado');
    const tabChat = document.getElementById('tab-chat');

    if (aba === 'simulado') {
        simulado.style.display = 'block';
        chat.style.display = 'none';
        tabSim.classList.add('active');
        tabChat.classList.remove('active');
    } else {
        simulado.style.display = 'none';
        chat.style.display = 'flex'; // Destrava o chat
        tabChat.classList.add('active');
        tabSim.classList.remove('active');
        
        // Scroll automático para o fim das mensagens
        const box = document.getElementById('chat-respostas');
        box.scrollTop = box.scrollHeight;
    }
}

async function chamarIA(prompt) {
    // URL alterada para OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY.trim()}`,
            "HTTP-Referer": window.location.href, // Necessário para OpenRouter
            "X-Title": "DT School"
        },
        body: JSON.stringify({
            model: "openai/gpt-3.5-turbo", // Modelo padrão estável
            messages: [{role: "user", content: prompt}]
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
}

async function gerarQuestoes() {
    const assunto = document.getElementById('assunto-ia').value;
    const nivel = document.getElementById('nivel-ia').value;
    const container = document.getElementById('container-questoes');
    const btn = document.getElementById('btn-gerar');

    if(!assunto) return alert("Escreva um assunto!");

    btn.innerText = "Criando...";
    btn.disabled = true;
    container.innerHTML = "";

    const prompt = `Gere 5 questões objetivas sobre ${assunto} para o nível ${nivel}. Retorne APENAS um JSON: [{"pergunta":"", "opcoes":["","","",""], "correta":0}]`;

    try {
        const data = await chamarIA(prompt);
        const conteudo = data.choices[0].message.content.replace(/```json|```/g, "").trim();
        const questoes = JSON.parse(conteudo);
        
        questoes.forEach((q, i) => {
            const div = document.createElement('div');
            div.className = "questao-card";
            div.innerHTML = `<p><b>${i+1}.</b> ${q.pergunta}</p>` + 
                q.opcoes.map((opt, idx) => `<button class="opcao-btn" onclick="verificar(this,${idx},${q.correta})">${opt}</button>`).join('');
            container.appendChild(div);
        });
    } catch (e) {
        alert("Erro: " + e.message);
    } finally {
        btn.innerText = "Gerar 5 Questões";
        btn.disabled = false;
    }
}

async function perguntarIA() {
    const input = document.getElementById('pergunta-ia');
    const chat = document.getElementById('chat-respostas');
    const btn = document.getElementById('btn-perguntar');
    
    if(!input.value.trim()) return;

    const msg = input.value;
    input.value = "";
    btn.disabled = true;
    chat.innerHTML += `<div class="msg-user">${msg}</div>`;
    chat.scrollTop = chat.scrollHeight;

    try {
        const data = await chamarIA(msg);
        const resposta = data.choices[0].message.content;
        chat.innerHTML += `<div class="msg-ia">${resposta}</div>`;
    } catch (e) {
        chat.innerHTML += `<div class="msg-ia" style="color:red">Erro ao responder.</div>`;
    } finally {
        btn.disabled = false;
        chat.scrollTop = chat.scrollHeight;
    }
}

function verificar(btn, escolhida, correta) {
    const botoes = btn.parentElement.querySelectorAll('.opcao-btn');
    botoes.forEach(b => b.disabled = true);
    if(escolhida === correta) {
        btn.style.background = "rgba(0, 255, 127, 0.2)";
        btn.style.borderColor = "#00ff7f";
    } else {
        btn.style.background = "rgba(255, 68, 68, 0.2)";
        botoes[correta].style.background = "rgba(0, 255, 127, 0.2)";
    }
}
