const GROQ_API_KEY = "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";

async function enviarPergunta() {
    const input = document.getElementById('user-input'); // Nome do seu campo de texto
    const chatContainer = document.getElementById('chat-container');
    const texto = input.value;

    if (!texto) return;

    // Adiciona sua pergunta na tela
    chatContainer.innerHTML += `<div class="user-msg">${texto}</div>`;
    input.value = "";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Modelo rápido e grátis
                messages: [
                    { role: "system", content: "Você é o assistente do DT School, focado em ajudar alunos com simulados e notas." },
                    { role: "user", content: texto }
                ]
            })
        });

        const data = await response.json();
        const respostaIA = data.choices[0].message.content;

        // Adiciona a resposta da IA na tela
        chatContainer.innerHTML += `<div class="ai-msg">${respostaIA}</div>`;
        
    } catch (error) {
        console.error("Erro na IA:", error);
        alert("Ops, deu erro na conexão com a IA!");
    }
}
