const API_KEY = "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";

// Função para garantir que os ícones e o histórico carregam sempre
window.onload = () => {
    try {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        const salvo = localStorage.getItem('dt_chat_hist');
        if(salvo && document.getElementById('chat-box')) {
            document.getElementById('chat-box').innerHTML = salvo;
        }
    } catch (e) { console.error("Erro ao carregar início:", e); }
};

// 1. MENU LATERAL
function abrirSeuMenuLateral() {
    const menu = document.querySelector('.dt-sidebar') || document.getElementById('menu-lateral');
    if(menu) menu.classList.toggle('open');
}

// 2. NAVEGAÇÃO
function trocarAba(aba) {
    const paineis = document.querySelectorAll('.dt-aba');
    const botoes = document.querySelectorAll('.dt-tab-button');
    
    paineis.forEach(p => p.classList.remove('active'));
    botoes.forEach(b => b.classList.remove('active'));
    
    const alvoPainel = document.getElementById('painel-' + aba);
    const alvoBotao = document.getElementById('tab-' + aba);
    
    if(alvoPainel) alvoPainel.classList.add('active');
    if(alvoBotao) alvoBotao.classList.add('active');
    
    const titulo = document.getElementById('header-titulo');
    if(titulo) titulo.innerText = aba === 'simulado' ? 'Simulado IA' : 'Tira-Dúvidas';
}

// 3. LIXEIRA E MODAIS
function abrirModalLixeira() { 
    const m = document.getElementById('modal-lixeira');
    if(m) m.style.display = 'flex'; 
}

function fecharModalLixeira() { 
    const m = document.getElementById('modal-lixeira');
    if(m) m.style.display = 'none'; 
}

function confirmarLimpeza() {
    localStorage.removeItem('dt_chat_hist');
    const container = document.getElementById('container-questoes');
    const chat = document.getElementById('chat-box');
    if(container) container.innerHTML = "";
    if(chat) chat.innerHTML = '<div class="dt-bolha ia">Histórico limpo!</div>';
    fecharModalLixeira();
}

function mostrarAviso(txt) {
    const m = document.getElementById('modal-aviso');
    const t = document.getElementById('txt-aviso');
    if(m && t) {
        t.innerText = txt;
        m.style.display = 'flex';
    }
}

function fecharAviso() { 
    const m = document.getElementById('modal-aviso');
    if(m) m.style.display = 'none'; 
}

// 4. SIMULADO (CORES VERDE/VERMELHO)
async function gerarSimulado() {
    const campo = document.getElementById('campo-tema');
    if(!campo || !campo.value) return mostrarAviso("⚠️ Digita um tema!");
    
    const tema = campo.value;
    const container = document.getElementById('container-questoes');
    container.innerHTML = "<div class='dt-questao-card' style='text-align:center'>⏳ A preparar questões...</div>";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "user", content: `Gere 5 questões sobre ${tema}. Retorne apenas JSON: [{"p":"pergunta","o":["a","b","c","d"],"c":0,"e":"EXPLICAÇÃO"}]`}]
            })
        });

        const d = await res.json();
        const textoLimpo = d.choices[0].message.content.match(/\[.*\]/s)[0];
        const json = JSON.parse(textoLimpo);
        container.innerHTML = "";

        json.forEach((q, i) => {
            const div = document.createElement('div');
            div.className = "dt-questao-card";
            div.innerHTML = `<p style="margin-bottom:12px"><b>${i+1}.</b> ${q.p}</p>`;
            
            q.o.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = "dt-opt-btn";
                btn.innerText = opt;
                btn.onclick = () => {
                    const botoesQuestao = div.querySelectorAll('.dt-opt-btn');
                    botoesQuestao.forEach(b => b.disabled = true);

                    if (idx === q.c) {
                        btn.style.setProperty('background-color', '#1b4d2e', 'important');
                        btn.style.setProperty('border-color', '#2ecc71', 'important');
                    } else {
                        btn.style.setProperty('background-color', '#4d1b1b', 'important');
                        btn.style.setProperty('border-color', '#e74c3c', 'important');
                        botoesQuestao[q.c].style.setProperty('border', '2px solid #2ecc71', 'important');
                    }
                    
                    const aula = document.createElement('div');
                    aula.className = "dt
                        
