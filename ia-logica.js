// Chave atualizada (Final 2fEA)
const API_KEY = "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";

// Função para conectar com a OpenAI
async function chamarIA(prompt) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${API_KEY.trim()}` 
        },
        body: JSON.stringify({ 
            model: "gpt-4o-mini", 
            messages: [{role: "user", content: prompt}], 
            temperature: 0.7 
        })
    });

    const data = await response.json();
    
    // Alerta específico se a chave estiver sem saldo ou errada
    if (data.error) {
        if (data.error.code === "insufficient_quota") {
            throw new Error("A chave está sem saldo. Recarregue na OpenAI.");
        }
        throw new Error(data.error.message);
    }
    
    return data;
}

// Lógica do Simulado (Gerar Questões)
async function gerarQuestoes() {
    const assunto = document.getElementById('assunto-ia').value;
    const nivel = document.getElementById('nivel-ia').value;
    const container = document.getElementById('container-questoes');
    const btn = document.getElementById('btn-gerar');

    if(!assunto) return alert("Digite o assunto (ex: Egito) para gerar as questões.");

    btn.innerText = "IA Criando...";
    btn.disabled = true;
    container.innerHTML = "";

    const prompt = `Gere 5 questões objetivas sobre ${assunto} para o nível ${nivel}. 
    Retorne APENAS o JSON puro no formato: 
    [{"pergunta":"...", "opcoes":["A","B","C","D"], "correta":0}]`;

    try {
        const data = await chamarIA(prompt);
        const conteudo = data.choices[0].message.content.replace(/```json|```/g, "").trim();
        const questoes = JSON.parse(conteudo);
        
        questoes.forEach((q, i) => {
            const div = document.createElement('div');
            div.className = "questao-card";
            div.innerHTML = `
                <p style="margin-bottom:12px; font-weight:bold; color:#fff;">${i+1}. ${q.pergunta}</p>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${q.opcoes.map((opt, idx) => `
                        <button class="opcao-btn" onclick="verificar(this, ${idx}, ${q.correta})">${opt}</button>
                    `).join('')}
                </div>`;
            container.appendChild(div);
        });
    } catch (e) {
        alert("Erro: " + e.message);
    } finally {
        btn.innerText = "Gerar 5 Questões";
        btn.disabled = false;
    }
}

// Lógica do Chat (Tira-Dúvidas)
async function perguntarIA() {
    const input = document.getElementById('pergunta-ia');
    const chat = document.getElementById('chat-respostas');
    const btn = document.getElementById('btn-perguntar');
    
    if(!input.value) return;

    const msg = input.value;
    input.value = "";
    btn.disabled = true;

    // Adiciona sua mensagem no chat
    chat.innerHTML += `<div class="msg-user">${msg}</div>`;
    chat.scrollTop = chat.scrollHeight;

    try {
        const data = await chamarIA(`Responda de forma curta e didática como um professor: ${msg}`);
        const resposta = data.choices[0].message.content;
        
        // Adiciona resposta da IA
        chat.innerHTML += `<div class="msg-ia">${resposta}</div>`;
    } catch (e) {
        chat.innerHTML += `<div class="msg-ia" style="color:#ff4444;">Erro ao processar dúvida. Verifique sua chave.</div>`;
    } finally {
        btn.disabled = false;
        chat.scrollTop = chat.scrollHeight;
    }
}

// Verificação de acerto/erro nas questões
function verificar(btn, escolhida, correta) {
    const pai = btn.parentElement;
    const botoes = pai.querySelectorAll('.opcao-btn');
    
    botoes.forEach(b => b.disabled = true);
    
    if(escolhida === correta) {
        btn.style.background = "rgba(0, 255, 127, 0.2)";
        btn.style.borderColor = "#00ff7f";
    } else {
        btn.style.background = "rgba(255, 68, 68, 0.2)";
        btn.style.borderColor = "#ff4444";
        botoes[correta].style.background = "rgba(0, 255, 127, 0.2)";
        botoes[correta].style.borderColor = "#00ff7f";
    }
}
