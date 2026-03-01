const CONFIG = {
    API_KEY: "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",
    MODEL: "llama-3.3-70b-versatile"
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa ícones do Lucide
    if (window.lucide) lucide.createIcons();
    
    // Recupera histórico do chat para não perder a conversa ao recarregar
    const historico = localStorage.getItem('dt_chat_data');
    if (historico) {
        document.getElementById('chat-box').innerHTML = historico;
        rolarParaFinal();
    }
});

// --- NAVEGAÇÃO ENTRE ABAS ---
function showAba(nome) {
    const abas = ['aba-simulado', 'aba-chat'];
    const botoes = { 'aba-simulado': 'btn-sim', 'aba-chat': 'btn-chat' };

    abas.forEach(id => {
        const elemento = document.getElementById(id);
        const botao = document.getElementById(botoes[id]);
        
        if (id === `aba-${nome}`) {
            elemento.style.display = 'block';
            botao.classList.add('active');
        } else {
            elemento.style.display = 'none';
            botao.classList.remove('active');
        }
    });

    if (nome === 'chat') rolarParaFinal();
}

// --- UTILITÁRIOS ---
function rolarParaFinal() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

async function consultarIA(prompt) {
    try {
        const conexao = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${CONFIG.API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.6
            })
        });
        const dados = await conexao.json();
        return dados.choices[0].message.content;
    } catch (erro) {
        console.error("Erro na IA:", erro);
        return null;
    }
}

// --- LÓGICA DO SIMULADO ---
async function gerarSimulado() {
    const assunto = document.getElementById('assunto').value;
    const nivel = document.getElementById('nivel').value;
    const lista = document.getElementById('questoes-lista');

    if (!assunto) {
        alert("Por favor, digite o assunto do simulado!");
        return;
    }

    lista.innerHTML = `<div class="card-ia"><p>⏳ Criando questões de ${assunto}...</p></div>`;

    const promptQuestao = `Gere 10 questões de múltipla escolha para ${nivel} sobre o tema: ${assunto}. 
    Retorne APENAS um JSON no formato: [{"p":"pergunta","o":["opção1","opção2","opção3","opção4"],"c":index_correta,"e":"mini aula explicando a resposta"}]`;

    const respostaIA = await consultarIA(promptQuestao);
    
    if (!respostaIA) {
        lista.innerHTML = "<p>Erro ao conectar. Verifique sua internet.</p>";
        return;
    }

    try {
        const questoes = JSON.parse(respostaIA.replace(/```json|```/g, ""));
        lista.innerHTML = `<h2 style="margin: 20px 0; color: #a066ff;">Simulado: ${assunto}</h2>`;

        questoes.forEach((q, i) => {
            const card = document.createElement('div');
            card.className = "card-questao"; // Classe definida no seu CSS
            
            // Estilo forçado para garantir que o card não fique branco
            card.style.background = "rgba(20, 10, 30, 0.6)";
            card.style.padding = "20px";
            card.style.borderRadius = "20px";
            card.style.border = "1px solid rgba(138, 43, 226, 0.3)";
            card.style.marginBottom = "20px";

            card.innerHTML = `<p style="margin-bottom:15px;"><b>${i+1}.</b> ${q.p}</p>`;

            q.o.forEach((opcao, index) => {
                const btn = document.createElement('button');
                btn.innerText = opcao;
                
                // Estilo do botão para matar o fundo branco feio
                btn.style = `
                    width: 100%; text-align: left; padding: 16px; margin-top: 10px;
                    background: rgba(255, 255, 255, 0.05); color: white;
                    border: 1px solid rgba(138, 43, 226, 0.2); border-radius: 12px;
                    cursor: pointer; font-size: 15px; transition: 0.3s;
                `;

                btn.onclick = () => {
                    // Bloqueia outros cliques
                    const todos = card.querySelectorAll('button');
                    todos.forEach(b => b.disabled = true);

                    // Validação visual
                    if (index === q.c) {
                        btn.style.background = "#28a745"; // Verde
                        btn.style.borderColor = "#28a745";
                    } else {
                        btn.style.background = "#dc3545"; // Vermelho
                        btn.style.borderColor = "#dc3545";
                        todos[q.c].style.background = "#28a745"; // Mostra a correta
                    }

                    // Inserção da Mini Aula
                    const aula = document.createElement('div');
                    aula.style = "margin-top:15px; padding:15px; background:rgba(138,43,226,0.1); border-left:4px solid #8a2be2; font-size:14px; color:#ddd;";
                    aula.innerHTML = `<strong>🎓 Mini Aula:</strong> ${q.e}`;
                    card.appendChild(aula);
                };

                card.appendChild(btn);
            });
            lista.appendChild(card);
        });
    } catch (e) {
        lista.innerHTML = "<p>Erro ao processar o simulado. Tente gerar novamente.</p>";
    }
}

// --- LÓGICA DO TIRA-DÚVIDAS ---
async function enviarMsg() {
    const input = document.getElementById('chat-in');
    const box = document.getElementById('chat-box');
    const texto = input.value.trim();

    if (!texto) return;

    // Mensagem do Usuário
    input.value = "";
    box.innerHTML += `<div class="bolha user">${texto}</div>`;
    rolarParaFinal();

    // Resposta da IA
    const resposta = await consultarIA(`Explique de forma didática e curta para um estudante: ${texto}`);
    
    if (resposta) {
        box.innerHTML += `<div class="bolha ia">${resposta}</div>`;
        localStorage.setItem('dt_chat_data', box.innerHTML);
    } else {
        box.innerHTML += `<div class="bolha ia" style="color:#ff4444;">Ops, tive um problema. Pode repetir?</div>`;
    }
    
    rolarParaFinal();
}
