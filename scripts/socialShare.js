async function share() {
    if (navigator.share) {
        try {
          await navigator.share({
            title: document.title,
            text: "Confira este site incrível!",
            url: window.location.href
          });
          console.log("Conteúdo compartilhado com sucesso!");
        } catch (error) {
          console.error("Erro ao compartilhar:", error);
        }
      } else {
        alert("Compartilhamento não suportado neste navegador.");
      }
}