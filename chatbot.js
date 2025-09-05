function toggleChatbox() {
  const popup = document.getElementById("chatPopup");
  popup.classList.toggle("hidden");
}

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chatMessages");

  // رسالة المستخدم
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = message;
  chatBox.appendChild(userMsg);

  // رسالة البوت (مؤقت)
  const botMsg = document.createElement("div");
  botMsg.className = "message bot";
  botMsg.textContent = "يكتب...";
  chatBox.appendChild(botMsg);

  chatBox.scrollTop = chatBox.scrollHeight;
  input.value = "";

  // الرد بعد ثانية
  setTimeout(() => {
    botMsg.textContent = getBotResponse(message);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 1000);
}

// ردود بسيطة
function getBotResponse(msg) {
  msg = msg.toLowerCase();
  if (msg.includes("تبرع")) return "💉 يمكنك التبرع عبر صفحة التبرع.";
  if (msg.includes("تسجيل")) return "📝 قم بالتسجيل من هنا.";
  if (msg.includes("مرحبا") || msg.includes("السلام")) return "🤖 أهلاً بك! كيف أقدر أساعدك؟";
  return "🤖 لم أفهم قصدك، حاول بطريقة أخرى.";
}

// إرسال بالإنتر
document.getElementById("chatInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendChatMessage();
  }
});
