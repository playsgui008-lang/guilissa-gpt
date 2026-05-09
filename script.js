let ENDPOINT,
    API_KEY,
    DEPLOYMENT,
    apiVersion,
    SPEECH_KEY,
    SPEECH_REGION,
    VOICE;

// ==========================
// CARREGAR CONFIG
// ==========================
async function carregarConfig() {

  try {

    const response = await fetch("chaves.json");

    console.log("STATUS JSON:", response.status);

    const config = await response.json();

    console.log("CONFIG:", config);


    ENDPOINT = config.openai.ENDPOINT
    API_KEY = config.openai.API_KEY
    DEPLOYMENT = config.openai.DEPLOYMENT
    apiVersion = config.openai.apiVersion

    // verifica endpoint
    if (!ENDPOINT) {
      throw new Error("ENDPOINT não encontrado no JSON");
    }

    // remove "/" final
    if (ENDPOINT.endsWith("/")) {
      ENDPOINT = ENDPOINT.slice(0, -1);
    }

  } catch (erro) {

    console.error("ERRO CONFIG:", erro);

  }
}

// ==========================
// ELEMENTOS
// ==========================
const input = document.getElementById("input");
const button = document.getElementById("btn");
const chat = document.getElementById("chat");

// ==========================
// CRIAR MENSAGEM
// ==========================
function criarMensagem(texto, tipo) {

  const msg = document.createElement("div");

  msg.className = "mensagem " + tipo;
  msg.textContent = texto;

  chat.appendChild(msg);

  chat.scrollTop = chat.scrollHeight;

  return msg;
}

// ==========================
// FALAR TEXTO
// ==========================
// function falarTexto(texto) {

//   if (!SPEECH_KEY || !SPEECH_REGION) {
//     console.warn("Speech não configurado");
//     return;
//   }

//   const speechConfig =
//     SpeechSDK.SpeechConfig.fromSubscription(
//       SPEECH_KEY,
//       SPEECH_REGION
//     );

//   speechConfig.speechSynthesisVoiceName = VOICE;

//   const audioConfig =
//     SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();

//   const synthesizer =
//     new SpeechSDK.SpeechSynthesizer(
//       speechConfig,
//       audioConfig
//     );

//   synthesizer.speakTextAsync(

//     texto,

//     function () {
//       synthesizer.close();
//     },

//     function (err) {
//       console.error("Erro Speech:", err);
//       synthesizer.close();
//     }
//   );
// }

// ==========================
// RESPONDER
// ==========================
async function responder(pergunta) {

  try {

    // carregar config
    if (!ENDPOINT) {
      await carregarConfig();
    }

    // mensagem digitando
    const typing =
      criarMensagem("Digitando...", "bot");

    // URL
    const url =
      `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${apiVersion}`;

    console.log("URL:", url);

    // request
    const response = await fetch(url, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY
      },

      body: JSON.stringify({

        messages: [
          {
            role: "user",
            content: pergunta
          }
        ],

        max_completion_tokens: 5000

      })

    });

    // remove digitando
    typing.remove();

    // erro HTTP
    if (!response.ok) {

      const erroTexto = await response.text();

      console.error("Erro Azure:", erroTexto);

      criarMensagem(
        `Erro ${response.status}`,
        "bot"
      );

      return;
    }

    // json
    const data = await response.json();

    console.log(data);

    // resposta
    const resposta =
      data?.choices?.[0]?.message?.content
      || "Sem resposta 😢";

    // mostra no chat
    criarMensagem(resposta, "bot");

    // fala
    falarTexto(resposta);

  }
  catch (error) {

    console.error(error);

    criarMensagem();
  }
}

// ==========================
// ENVIAR
// ==========================
function enviar() {

  const texto = input.value.trim();

  if (!texto) return;

  criarMensagem(texto, "usuario");

  input.value = "";

  responder(texto);
}

// ==========================
// EVENTOS
// ==========================
button.addEventListener(
  "click",
  enviar
);

input.addEventListener(
  "keydown",
  function (e) {

    if (e.key === "Enter") {
      enviar();
    }

  }
);

// ==========================
// INICIAR CONFIG
// ==========================
carregarConfig();