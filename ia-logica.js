const API_KEY = "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";

// Inicialização: Carrega ícones e histórico do chat ao abrir
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    const salvo = localStorage.getItem('dt_chat_hist');
    if(salvo) document.getElementById('chat-box').innerHTML = salvo;
});

// 1. INTEGRAÇÃO COM SEU MENU LATERAL (3 TRAÇINHOS)
function abrirSeuMenuLateral() {
    // Tenta abrir o menu lateral que já existe no seu site
    // Geralmente funciona adicionando a classe 'open' ou 'active'
    const menu = document.querySelector('.dt-sidebar') || document.getElementById('menu-lateral');
    if(menu) {
        menu.classList.toggle('open');
    } else {
        console.log("Menu lateral não encontrado no HTML.");
    }
}

// 2. NAVEGAÇÃO ENTRE ABAS (Simulado / Tira-Dúvidas)
function trocarAba(aba) {
    document.querySelectorAll('.dt-aba').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.dt-tab-button').forEach(b => b.classList.remove('active'));
    
    document.getElementById('painel-' + aba).classList.add('active');
    document.getElementById('tab-' + aba).classList.add('active');
    
    const titulos = { 'simulado': 'Simulado IA', 'chat': 'Tira-Dúvidas' };
    document.getElementById('header-titulo').innerText = titulos[aba];
}

// 3. LIXEIRA CUSTOMIZADA (Sem o confirm feio do Chrome)
function abrirModalLixeira() {
    document.getElementById('modal-lixeira').style.display = 'flex';
}

function fecharModalLixeira() {
    document.getElementById('modal-lixeira').style.display = 'none';
}

function confirmarLimpeza() {
    localStorage.removeItem('dt_chat_hist');
    document.getElementById('container-questoes').innerHTML = "";
    document.getElementById('chat-box').innerHTML = '<div class="dt-bolha ia">Histórico limpo com sucesso!</div>';
    fecharModalLixeira();
}

// 4. MODAL DE AVISO (Para campos vazios)
function mostrarAviso(txt) {
    document.getElementById('txt-aviso').innerText = txt;
    document.getElementById('modal-aviso').style.display = 'flex';
}

function fecharAviso() {
    document.getElementById('modal-aviso').style.display = 'none';
}

// 5. GERADOR DE SIMULADO (LÓGICA DE CORES: VERDE E VERMELHO)
async function gerarSimulado() {
    const tema = document.getElementById('campo-tema').value;
    if(!tema) return mostrarAviso("⚠️ Por favor, digite um tema para o simulado!");
    
    const container = document.getElementById('container-questoes');
    container.innerHTML = "<div class='dt-questao-card' style='text-align:center'>⏳ O professor IA está preparando as questões...</div>";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${API_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "user", content: `Gere 5 questões sobre ${tema}. Retorne APENAS o JSON: [{"p":"pergunta","o":["op1","op2","op3","op4"],"c":0,"e":"EXPLICAÇÃO"}]`}],
                temperature: 0.6
            })
        });

        const d = await res.json();
        const json = JSON.parse(d.choices[0].message.content.match(/\[.*\]/s)[0]);
        container.innerHTML = "";

        json.forEach((q, i) => {
            const divQ = document.createElement('div');
            divQ.className = "dt-questao-card";
            divQ.innerHTML = `<p style="margin-bottom:15px"><b>${i+1}.</b> ${q.p}</p>`;
            
            q.o.forEach((opt, idx) => {
                const btn = document.createElement('button');
                
