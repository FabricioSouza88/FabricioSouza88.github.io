document.addEventListener("DOMContentLoaded", function () {
  const chatbotApiUrl = getAttributeValue("data-api-url");
  const apiKeyName = getAttributeValue("data-api-key-name");
  const apiKeyValue = getAttributeValue("data-api-key-value");
  const chatbotWelcomeMessage = getAttributeValue("data-welcome-message");
  const chatModalTitle = getAttributeValue("data-modal-title") || "Chatbot";
  const externalopenListener = getAttributeValue("data-external-open-listener");

  createChatContainer(chatModalTitle);
  loadScript("https://cdn.jsdelivr.net/npm/marked/marked.min.js", () => { console.log("Markdown Script loaded!"); });

  const chatbot = document.getElementById("chatbot");
  const chatbotButton = document.getElementById("chatbot-button");
  const closeChat = document.getElementById("close-chat");
  const sendButton = document.getElementById("chatbot-send");
  const inputField = document.getElementById("chatbot-input");
  const messageContainer = document.getElementById("chatbot-messages");
  const externalopenElement = document.getElementById(externalopenListener);

  closeChatbotModal();

  chatbotButton.addEventListener("click", toggleChatbot);
  closeChat.addEventListener("click", closeChatbotModal);
  if (externalopenElement) {
    externalopenElement.addEventListener("click", openChatbotModal);
  }

  sendButton.addEventListener("click", sendMessage);
  inputField.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  function getAttributeValue(attribute) {
    return document.getElementById("chatbot-script")?.getAttribute(attribute);
  }

  function createChatContainer(title) {
    const chatContainer = document.createElement("div");
    chatContainer.id = "chatbot-container";
    chatContainer.innerHTML = `
      <div id="chatbot">
        <div id="chatbot-header">
          <span>${title}</span>
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
  }

  function toggleChatbot() {
    chatbot.style.display = chatbot.style.display === "none" ? openChatbotModal() : closeChatbotModal();
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

  function appendMessage(message, isBot = true, customStyle = "") { 
    const messageItem = document.createElement("div");
    messageItem.classList.add(isBot ? "bot-message" : "user-message");
    if (customStyle) {
      messageItem.classList.add(customStyle);
    }
    if (!isBot) {
      messageItem.textContent = message;
    } else {
      const messageHTML = marked.parse(message);
      typeWriterEffect(messageItem, messageHTML, 30);
    }
    messageItem.appendChild(getMessageTime());
    messageContainer.appendChild(messageItem);
  }

  function typeWriterEffect(element, htmlText, speed = 50) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlText;
    const nodes = Array.from(tempDiv.childNodes);
    element.innerHTML = "";

    function typeNode(parent, node, callback) {
      if (!node) {
        callback();
        return;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent;
        let span = document.createElement("span");
        parent.appendChild(span);
        let i = 0;
        const typeCharacter = () => {
          if (i < text.length) {
            span.textContent += text.charAt(i);
            updateScrollTop();
            i++;
            setTimeout(typeCharacter, speed);
          } else {
            callback();
          }
        }
        typeCharacter();
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        let clonedNode = document.createElement(node.nodeName.toLowerCase());
        [...node.attributes].forEach(attr => clonedNode.setAttribute(attr.name, attr.value));
        parent.appendChild(clonedNode);
        typeNodes(clonedNode, node.childNodes, callback);
      }
    }

    function typeNodes(parent, nodes, callback, index = 0) {
      if (index < nodes.length) {
        typeNode(parent, nodes[index], () => {
          typeNodes(parent, nodes, callback, index + 1);
        });
      } else {
        callback();
      }
    }

    typeNodes(element, nodes, () => {});
  }

  function updateScrollTop() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  function getMessageTime() {
    const messageTime = document.createElement("span");
    messageTime.classList.add("message-time");
    messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return messageTime;
  }

  function sendMessage(time = 1000) {
    const inputText = inputField.value.trim();
    if (!inputText) return;

    appendMessage(inputText, false);
    inputField.value = "";

    setTimeout(() => processRequest(inputText), time);
  }

  function processRequest(inputText) {
    const loadingMessage = document.createElement("div");
    loadingMessage.classList.add("bot-message", "loading", "blink");
    loadingMessage.textContent = "Processando...";
    messageContainer.appendChild(loadingMessage);

    fetch(chatbotApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [apiKeyName]: apiKeyValue,
      },
      body: JSON.stringify({ question: inputText }),
    })
    .then(response => {
      if (response.status === 429) {
        const error = new Error("Rate Limit Excedido! Aguardando...");
        appendMessage(error.message, true, "chat-error-message");
        throw error;
      }
      return response.json();
    })
    .then((data) => {
      messageContainer.removeChild(loadingMessage);
      appendMessage(data.response, true);
    })
    .catch(() => {
      messageContainer.removeChild(loadingMessage);
      appendMessage("Infelizmente não consigo te responder agora. Tente novamente mais tarde!", true, "chat-error-message");
    })
    .finally(() => {
      updateScrollTop();
    });
  }

  function loadScript(src, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }
});
