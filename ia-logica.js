const API_KEY = "Sk-proj-NwyJEi6rROyAtsohP1OIFY49XRnwVkv5Xr3axOjbVHRpiG4_zZ0iflMqlAdnFaDUbKX3XYKGJLT3BlbkFJqycayob3FeMHVp0q5bemTb7_tPcPvLDPfVRJi6rRMF0TQfpFtKaw2fhK5Oqph4X9EvGytbU_cA"; // Substitua pela chave que você me mandou

async function gerarQuestoes() {
    const assunto = document.getElementById('assunto-ia').value;
    const nivel = document.getElementById('nivel-ia').value;
    const container = document.getElementById('container-questoes');
    const btn = document.getElementById('btn-gerar');

    if(!assunto) return alert("Digita um assunto primeiro!");

    btn.innerText = "IA pensando...";
    btn.disabled = true;
    container.innerHTML = "";

    const prompt = `Gere 5 questões de múltipla escolha sobre ${assunto} para o nível ${nivel}. 
    Retorne APENAS um JSON no formato: 
    [{"pergunta": "...", "opcoes": ["A", "B", "C", "D"], "correta": 0}, ...] 
    onde "correta" é o índice do array de opcoes.`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{role: "user", content: prompt}]
            })
        });

        const data = await response.json();
        const questoes = JSON.parse(data.choices[0].message.content);
        
        questoes.forEach((q, i) => {
            const card = document.createElement('div');
            card.className = "questao-card";
            card.innerHTML = `
                <p style="margin-bottom:15px;"><strong>${i+1}.</strong> ${q.pergunta}</p>
                ${q.opcoes.map((opt, idx) => `
                    <button class="opcao-btn" onclick="verificar(this, ${idx}, ${q.correta})">${opt}</button>
                `).join('')}
            `;
            container.appendChild(card);
        });
    } catch (e) {
        alert("Erro ao chamar a IA. Verifique sua chave.");
    } finally {
        btn.innerText = "Gerar 5 Questões";
        btn.disabled = false;
    }
}

function verificar(btn, escolhida, correta) {
    const irmaos = btn.parentElement.querySelectorAll('.opcao-btn');
    irmaos.forEach(b => b.disabled = true);
    
    if(escolhida === correta) {
        btn.classList.add('correta');
    } else {
        btn.classList.add('errada');
        irmaos[correta].classList.add('correta');
    }
}
