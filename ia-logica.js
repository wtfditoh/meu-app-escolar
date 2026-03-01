// Sua nova chave do Groq
const API_KEY = "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";

// Função mestre para falar com a IA
async function chamarIA(prompt) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "Você é o assistente do DT School. Responda de forma clara e didática." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7
        })
    });
    return await response.json();
}

// Lógica para GERAR QUESTÕES
async function gerarQuestoes() {
    const assunto = document.getElementById('assunto-ia').value;
    const container = document.getElementById('container-questoes');
    const btn = document.getElementById('btn-gerar');

    if (!assunto) return alert("Digite um assunto primeiro!");

    btn.innerText = "Gerando...";
    btn.disabled = true;
    container.innerHTML = "";

    const prompt = `Gere 3 questões de múltipla escolha sobre ${assunto}. Retorne APENAS o JSON: [{"pergunta":"", "opcoes":["","","",""], "correta":0}]`;

    try {
        const data = await chamarIA(prompt);
        // Limpa o texto caso a IA mande markdown (```json)
        const textoLimpo = data.choices[0].message.content.replace(/```json|```/g, "");
        const questoes = JSON.parse(textoLimpo);
        
        questoes.forEach((q, i) => {
            const div = document.createElement('div');
            div.className = "questao-card";
            div.innerHTML = `<p><strong>${i+1}.</strong> ${q.pergunta}</p>` + 
                q.opcoes.map((opt, idx) => `<button class="opcao-btn" onclick="verificar(this,${idx},${q.correta})">${opt}</button>`).join('');
            container.appendChild(div);
        });
    } catch (e) {
        alert("Erro ao gerar: " + e.message);
    } finally {
        btn.innerText = "Gerar Questões";
        btn.disabled = false;
    }
}

// Lógica para o CHAT (Tira-Dúvidas)
async function perguntarIA() {
    const input = document.getElementById('pergunta-ia');
    const chat = document.getElementById('chat-respostas');
    const btn = document.getElementById('btn-perguntar');
    
    if (!input.value) return;

    const msg = input.value;
    input.value = "";
    btn.disabled = true;
    chat.innerHTML += `<div class="user-msg"><b>Você:</b> ${msg}</div>`;

    try {
        const data = await chamarIA(msg);
        const resposta = data.choices[0].message.content;
        chat.innerHTML += `<div class="ai-msg"><b>IA:</b> ${resposta}</div>`;
        chat.scrollTop = chat.scrollHeight;
    } catch (e) {
        chat.innerHTML += `<div style="color:red;">Erro ao responder.</div>`;
    } finally {
        btn.disabled = false;
    }
}

function verificar(btn, escolhida, correta) {
    const botoes = btn.parentElement.querySelectorAll('.opcao-btn');
    botoes.forEach(b => b.disabled = true);
    if (escolhida === correta) {
        btn.style.background = "#28a745"; // Verde sucesso
    } else {
        btn.style.background = "#dc3545"; // Vermelho erro
        botoes[correta].style.background = "#28a745";
    }
}
