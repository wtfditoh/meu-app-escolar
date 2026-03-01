const API_KEY = "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";

// Instruções para a IA ser organizada e acadêmica
const PROMPT_SISTEMA = "Você é um Tutor de Estudos. 1. Responda apenas sobre educação. 2. Use tópicos (•) e negrito. 3. Seja curto. 4. Se não for estudo, diga que não pode ajudar.";

document.addEventListener('DOMContentLoaded', () => lucide.createIcons());

function aviso(msg, confirm = false, acao = null) {
    const m = document.getElementById('custom-modal');
    document.getElementById('modal-text').innerText = msg;
    m.style.display = 'flex';
    
    document.getElementById('btn-modal-ok').onclick = () => { m.style.display = 'none'; if(acao) acao(); };
}

async function enviar() {
    const input = document.getElementById('msg-in');
    const box = document.getElementById('chat-box');
    if(!input.value) return;

    const msg = input.value;
    input.value = "";
    box.innerHTML += `<div class="dt-bolha user" style="background:#8a2be2; align-self:flex-end;">${msg}</div>`;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "system", content: PROMPT_SISTEMA}, {role: "user", content: msg}],
                temperature: 0.3
            })
        });
        const d = await res.json();
        let r = d.choices[0].message.content;

        // LIMPA O TEXTÃO: Formata negritos e quebras de linha
        r = r.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
        
        box.innerHTML += `<div class="dt-bolha ia">${r}</div>`;
        window.scrollTo(0, document.body.scrollHeight);
    } catch(e) { box.innerHTML += `<div class="dt-bolha ia">Erro ao responder.</div>`; }
}

// Funções de aba e gerar simulado continuam com os nomes dt-paineis
function aba(n) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById('painel-' + n).style.display = 'block';
}
