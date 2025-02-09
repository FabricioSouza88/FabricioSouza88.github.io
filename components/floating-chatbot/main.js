async function loadChatbot(containerId) {
    const response = await fetch('./components/floating-chatbot/index.html');
    const text = await response.text();
    const container = document.getElementById(containerId);

    // Insert HTML
    container.innerHTML = text;

    // Execute scripts
    const scripts = container.querySelectorAll("script");
    scripts.forEach(script => {
        const newScript = document.createElement("script");
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
    });
}
