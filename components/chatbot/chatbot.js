document.addEventListener("DOMContentLoaded", function () {
  // Captura a URL da API e a mensagem inicial da página principal
  const chatbotApiUrl = document.getElementById("chatbot-script")?.getAttribute("data-api-url");
  const apiKeyName = document.getElementById("chatbot-script")?.getAttribute("data-api-key-name");
  const apiKeyValue = document.getElementById("chatbot-script")?.getAttribute("data-api-key-value");
  const chatbotWelcomeMessage = document.getElementById("chatbot-script")?.getAttribute("data-welcome-message");
  const chatModalTitle = document.getElementById("chatbot-script")?.getAttribute("data-modal-title") || "Chatbot";
  const externalopenListener = document.getElementById("chatbot-script")?.getAttribute("data-external-open-listener");

  const chatContainer = document.createElement("div");
  chatContainer.id = "chatbot-container";
  chatContainer.innerHTML = `
    <div id="chatbot">
      <div id="chatbot-header">
        <span>${chatModalTitle}</span>
        <button id="close-chat">✖</button>
      </div>
      <div id="chatbot-messages"></div>
      <div id="chatbot-input-container">
        <input type="text" id="chatbot-input" placeholder="Digite sua pergunta..." />
        <button id="chatbot-send">➤</button>
      </div>
    </div>
    <button id="chatbot-button">
      <span id="chat-btn-icon" class="iconify" data-icon="mdi:chat" data-inline="false"></span>
    </button>
  `;

  document.body.appendChild(chatContainer);

  const chatbot = document.getElementById("chatbot");
  const chatbotButton = document.getElementById("chatbot-button");
  const closeChat = document.getElementById("close-chat");
  const sendButton = document.getElementById("chatbot-send");
  const inputField = document.getElementById("chatbot-input");
  const messageContainer = document.getElementById("chatbot-messages");
  const externalopenElement = document.getElementById(externalopenListener);

  closeChatbotModal();

  // Exibir/Ocultar chat
  chatbotButton.addEventListener("click", function () {
    chatbot.style.display = chatbot.style.display === "none" ? openChatbotModal() : closeChatbotModal();
  });

  closeChat.addEventListener("click", function () {
    closeChatbotModal();
  });

  if (externalopenElement) {
    externalopenElement.addEventListener("click", function () {
      openChatbotModal();
    });
  }

  function closeChatbotModal() {
    chatbot.style.display = "none";
  }

  function openChatbotModal() {
    messageContainer.innerHTML = "";
    chatbot.style.display = "block";
    if (chatbotWelcomeMessage) {
      appendMessage(chatbotWelcomeMessage, true);
    }
  }

  function appendMessage(message, isBot = true) {
    const messageItem = document.createElement("div");
    messageItem.classList.add(isBot? "bot-message" : "user-message");
    if (!isBot) {
      messageItem.textContent = message;
    }
    else {
      typeWriterEffect(messageItem, message, 30);
    }
    messageItem.appendChild(getMessageTime());
    messageContainer.appendChild(messageItem);
  }

  function typeWriterEffect(element, text, speed = 100) {
    let i = 0;
    function typing() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(typing, speed);
      }
    }
    typing();
  }

  function getMessageTime() {
    const messageTime = document.createElement("span");
    messageTime.classList.add("message-time");
    messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return messageTime;
  }

  // Enviar mensagem para a API
  function sendMessage() {
    const inputText = inputField.value.trim();
    if (!inputText) return;

    // Adicionar mensagem do usuário
    appendMessage(inputText, false);
    inputField.value = "";

    // Adicionar indicador de carregamento
    const loadingMessage = document.createElement("div");
    loadingMessage.classList.add("bot-message", "loading", "blink");
    loadingMessage.textContent = "Digitando...";
    setTimeout(() => {
      messageContainer.appendChild(loadingMessage);
    }, 700);

    // Fazer requisição à API
    fetch(chatbotApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [apiKeyName]: apiKeyValue,
      },
      body: JSON.stringify({ question: inputText }),
    })
      .then((response) => response.json())
      .then((data) => {
        messageContainer.removeChild(loadingMessage);
        console.log(data);
        appendMessage(data.response, true);
      })
      .catch(() => {
        messageContainer.removeChild(loadingMessage);
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("bot-message");
        errorMessage.textContent = "Erro ao obter resposta.";
        messageContainer.appendChild(errorMessage);
      });

    // Rolar para baixo automaticamente
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  sendButton.addEventListener("click", sendMessage);
  inputField.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });
});
