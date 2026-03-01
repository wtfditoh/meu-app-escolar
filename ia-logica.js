const API_KEY = "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";

// FUNÇÃO PARA TROCAR AS ABAS CORRETAMENTE
function aba(n) {
    // Esconde todos os painéis
    document.querySelectorAll('.dt-painel').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    
    // Mostra apenas o selecionado
    const painelAtivo = document.getElementById('painel-' + n);
    painelAtivo.classList.add('active');
    painelAtivo.style.display = 'block';

    // Ajusta a cor dos botões da aba
    document.querySelectorAll('.dt-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + n).classList.add('active');
}

// FUNÇÃO PARA O MODAL SÓ APARECER QUANDO CHAMADO
function aviso(msg) {
    const m = document.getElementById('custom-modal');
    document.getElementById('modal-text').innerText = msg;
    m.style.display = 'flex'; // Só aqui ele aparece
}

async function gerar() {
    const tema = document.getElementById('tema').value;
    if(!tema) return aviso("Por favor, digite o assunto!");
    
    const lista = document.getElementById('questoes');
    lista.innerHTML = "<div class='dt-card'>⏳ O professor está preparando as questões...</div>";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "user", content: `Gere 10 questões sobre ${tema}. Retorne APENAS JSON: [{"p":"pergunta","o":["a","b","c","d"],"c":0,"e":"explicação"}]`}]
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
                        btn.style.setProperty('background-color', '#28a745', 'important');
                    } else {
                        btn.style.setProperty('background-color', '#dc3545', 'important');
                        card.querySelectorAll('.dt-opt-btn')[q.c].style.border = "2px solid #28a745";
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
    } catch(e) { lista.innerHTML = "<div class='dt-card'>Erro ao carregar. Tente novamente.</div>"; }
}
