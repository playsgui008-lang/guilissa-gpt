 let ENDPOINT, API_KEY, DEPLOYMENT,apiVersion;

// carregar config
async function carregarConfig() {
  const response = await fetch("chaves.json");
  const config = await response.json();

  ENDPOINT = config.ENDPOINT;
  API_KEY = config.API_KEY;
  DEPLOYMENT = config.DEPLOYMENT;
  apiVersion = config.apiVersion;
}

// elementos
const input = document.getElementById("input");
const button = document.getElementById("btn");
const chat = document.getElementById("chat");

// criar mensagem
function criarMensagem(texto, tipo) {
  const msg = document.createElement("div");
  msg.className = "mensagem " + tipo;
  msg.textContent = texto;

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

// responder
async function responder(pergunta) {

  if (!ENDPOINT) {
    await carregarConfig();
  }

  const typing = criarMensagem("Digitando...", "bot");

  try {
    const response = await fetch(
      `${ENDPOINT}openai/responses?api-version=${apiVersion}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": API_KEY
        },
        body: JSON.stringify({
          input: [
            { role: "user", content: pergunta }
          ],
          max_output_tokens: 500,
          model: DEPLOYMENT,
        })
      }
    );

    const data = await response.json();

    console.log(data);

    // remove "digitando..."
    chat.lastChild.remove();

    const resposta =
      data?.output?.find(o => o.type === "message")
        ?.content?.find(c => c.type === "output_text")
        ?.text
      || "Sem resposta 😢";

    criarMensagem(resposta, "bot");

  } catch (error) {
    chat.lastChild.remove();
    criarMensagem("Erro ao conectar 😢", "bot");
  }
}

// enviar
function enviar() {
  const texto = input.value.trim();
  if (!texto) return;

  criarMensagem(texto, "usuario");
  input.value = "";

  responder(texto);
}

// eventos
button.addEventListener("click", enviar);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") enviar();
});

