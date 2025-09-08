// حالة بسيطة للذاكرة داخل الجلسة
const CHAT_STATE = {
  userName: sessionStorage.getItem("chat_user_name") || null,
  lastIntent: null
};

function toggleChatbox() {
  const popup = document.getElementById("chatPopup");
  popup.classList.toggle("hidden");
}

function ensureSuggestionsContainer() {
  const popup = document.getElementById("chatPopup");
  let suggestions = document.getElementById("chatSuggestions");
  if (!suggestions) {
    suggestions = document.createElement("div");
    suggestions.id = "chatSuggestions";
    suggestions.style.display = "flex";
    suggestions.style.flexWrap = "wrap";
    suggestions.style.gap = "6px";
    suggestions.style.margin = "6px 0";
    const input = document.getElementById("chatInput");
    popup.insertBefore(suggestions, input);
  }
  return suggestions;
}

function setSuggestions(labels) {
  const container = ensureSuggestionsContainer();
  container.innerHTML = "";
  if (!labels || !labels.length) return;
  labels.slice(0, 6).forEach(label => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.style.background = "#f1f1f1";
    btn.style.color = "#333";
    btn.style.border = "1px solid #ddd";
    btn.style.borderRadius = "16px";
    btn.style.padding = "6px 10px";
    btn.style.cursor = "pointer";
    btn.onclick = () => {
      const input = document.getElementById("chatInput");
      input.value = label;
      sendChatMessage();
    };
    container.appendChild(btn);
  });
}

function appendMessage(role, text, isHTML) {
  const chatBox = document.getElementById("chatMessages");
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  if (isHTML) {
    msg.innerHTML = text;
  } else {
    msg.textContent = text;
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

function typingIndicator() {
  return appendMessage("bot", "يكتب...", false);
}

function normalize(text) {
  return (text || "").toLowerCase().trim();
}

function tryExtractName(arabicText) {
  // أمثلة: "اسمي أحمد", "انا سارة", "أنا محمد"
  const patterns = [
    /اسمي\s+([\u0600-\u06FFA-Za-z]+)\b/,
    /أنا\s+([\u0600-\u06FFA-Za-z]+)\b/,
    /انا\s+([\u0600-\u06FFA-Za-z]+)\b/
  ];
  for (const p of patterns) {
    const m = arabicText.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

function smartReply(rawMsg) {
  const msg = normalize(rawMsg);

  // التقاط الاسم وتخزينه
  const possibleName = tryExtractName(rawMsg);
  if (possibleName) {
    CHAT_STATE.userName = possibleName;
    sessionStorage.setItem("chat_user_name", possibleName);
  }

  // نوايا شائعة
  const intents = [
    {
      name: "greet",
      test: () => /(مرحبا|السلام|اهلا|أهلا|هاي|hi|hello)/i.test(rawMsg),
      reply: () => {
        const name = CHAT_STATE.userName ? ` يا ${CHAT_STATE.userName}` : "";
        return {
          html: `🤖 أهلاً بك${name}! كيف أقدر أساعدك اليوم؟`,
          suggestions: ["التبرع بالدم", "طريقة التسجيل", "شروط التبرع", "الأسئلة الشائعة"]
        };
      }
    },
    {
      name: "donate",
      test: () => /(تبرع|التبرع|donat)/i.test(rawMsg),
      reply: () => ({
        html: `💉 جميل! يمكنك البدء من صفحة <a href="donate.html" target="_blank">التبرع</a>.` ,
        suggestions: ["شروط التبرع", "تتبع تبرعي", "طريقة الدفع"]
      })
    },
    {
      name: "register",
      test: () => /(تسجيل|سجل|انشاء حساب|حساب جديد|register|signup)/i.test(rawMsg),
      reply: () => ({
        html: `📝 قم بإنشاء حساب من صفحة <a href="register.html" target="_blank">التسجيل</a>. إذا لديك حساب فادخل من <a href="login.html" target="_blank">تسجيل الدخول</a>.`,
        suggestions: ["تسجيل الدخول", "تعديل الملف", "الأسئلة الشائعة"]
      })
    },
    {
      name: "login",
      test: () => /(تسجيل الدخول|تسجيل|دخول|login|signin)/i.test(rawMsg),
      reply: () => ({
        html: `🔐 انتقل إلى <a href="login.html" target="_blank">تسجيل الدخول</a>.`,
        suggestions: ["نسيت كلمة المرور", "إنشاء حساب"]
      })
    },
    {
      name: "reset_password",
      test: () => /(نسيت كلمة المرور|اعادة تعيين|إعادة تعيين|استرجاع كلمة المرور|reset)/i.test(rawMsg),
      reply: () => ({
        html: `🔁 يمكنك إعادة التعيين من <a href="reset_passowrd.html" target="_blank">إعادة كلمة المرور</a>.`,
        suggestions: ["تسجيل الدخول", "الدعم"]
      })
    },
    {
      name: "eligibility",
      test: () => /(شروط|مؤهل|ينفع اتبرع|eligib|age|وزن)/i.test(rawMsg),
      reply: () => ({
        html: `📋 الشروط العامة للتبرع بالدم: العمر 18-65، الوزن ≥ 50 كجم، صحة جيدة وعدم تناول أدوية مؤثرة قبل التبرع. للمزيد راجع <a href="faq.html" target="_blank">الأسئلة الشائعة</a>.`,
        suggestions: ["التبرع بالدم", "الأسئلة الشائعة", "حجز موعد"]
      })
    },
    {
      name: "faq",
      test: () => /(faq|أسئلة|الأسئلة الشائعة|معلومات)/i.test(rawMsg),
      reply: () => ({
        html: `❓ ستجد إجابات كثيرة في <a href="faq.html" target="_blank">الأسئلة الشائعة</a>.`,
        suggestions: ["شروط التبرع", "التبرع بالدم", "التواصل"]
      })
    },
    {
      name: "track",
      test: () => /(تتبع|تتبُّع|تتبع تبرعي|track)/i.test(rawMsg),
      reply: () => ({
        html: `📦 يمكنك متابعة تبرعاتك من <a href="track_donate.html" target="_blank">تتبع التبرع</a>.`,
        suggestions: ["شروط التبرع", "الشهادة"]
      })
    },
    {
      name: "certificate",
      test: () => /(شهادة|certificate)/i.test(rawMsg),
      reply: () => ({
        html: `📄 احصل على شهادتك من <a href="certificate.html" target="_blank">الشهادة</a>.`,
        suggestions: ["تتبع تبرعي", "التبرع بالدم"]
      })
    },
    {
      name: "profile",
      test: () => /(الملف|ملفي|profile|تعديل الملف)/i.test(rawMsg),
      reply: () => ({
        html: `👤 يمكنك إدارة بياناتك من <a href="profile.html" target="_blank">ملفي</a> أو <a href="edit_profile.html" target="_blank">تعديل الملف</a>.`,
        suggestions: ["الإشعارات", "الخصوصية"]
      })
    },
    {
      name: "notifications",
      test: () => /(تنبيهات|إشعارات|notifications)/i.test(rawMsg),
      reply: () => ({
        html: `🔔 راجع <a href="notifications.html" target="_blank">الإشعارات</a> لمعرفة آخر المستجدات.`,
        suggestions: ["التبرع بالدم", "الأسئلة الشائعة"]
      })
    },
    {
      name: "payment",
      test: () => /(دفع|تبرع مالي|payment|donation fund|تبرعات مالية)/i.test(rawMsg),
      reply: () => ({
        html: `💳 للتبرع المالي، انتقل إلى <a href="donation_fund.html" target="_blank">صندوق التبرع</a> أو راجع <a href="payment.html" target="_blank">طرق الدفع</a>.`,
        suggestions: ["التبرع بالدم", "الأسئلة الشائعة"]
      })
    },
    {
      name: "volunteer",
      test: () => /(تطوع|متطوع|volunteer)/i.test(rawMsg),
      reply: () => ({
        html: `🙌 فرص التطوع متاحة عبر <a href="volunteer.html" target="_blank">التطوع</a>.`,
        suggestions: ["التبرع بالدم", "التواصل"]
      })
    },
    {
      name: "emergency",
      test: () => /(طوارئ|مساعدة عاجلة|emergency|اسعاف)/i.test(rawMsg),
      reply: () => ({
        html: `🚑 في الحالات العاجلة، توجه إلى أقرب مستشفى، ويمكنك أيضاً مراجعة <a href="emergency.html" target="_blank">الطوارئ</a>.`,
        suggestions: ["التبرع بالدم", "التواصل"]
      })
    },
    {
      name: "privacy",
      test: () => /(خصوصية|سياسة|privacy)/i.test(rawMsg),
      reply: () => ({
        html: `🔒 اطلع على سياسة <a href="privacy.html" target="_blank">الخصوصية</a>.`,
        suggestions: ["الأسئلة الشائعة", "التواصل"]
      })
    },
    {
      name: "contact",
      test: () => /(تواصل|اتصال|contact|الدعم|support)/i.test(rawMsg),
      reply: () => ({
        html: `📬 يسعدنا تواصلك. اكتب مشكلتك بالتفصيل هنا، أو راسلنا عبر صفحة <a href="index.html" target="_blank">الرئيسية</a>.`,
        suggestions: ["تسجيل الدخول", "التبرع بالدم"]
      })
    },
    {
      name: "thanks",
      test: () => /(شكرا|شكرًا|thx|thanks)/i.test(rawMsg),
      reply: () => ({
        html: `🙏 على الرحب والسعة!`,
        suggestions: ["التبرع بالدم", "الأسئلة الشائعة"]
      })
    }
  ];

  for (const it of intents) {
    if (it.test()) {
      CHAT_STATE.lastIntent = it.name;
      return it.reply();
    }
  }

  // رد افتراضي ذكي بسيط
  const name = CHAT_STATE.userName ? ` يا ${CHAT_STATE.userName}` : "";
  return {
    html: `🤖 لم أفهم قصدك${name}. جرب استخدام كلمات مفتاحية مثل: "التبرع", "تسجيل", "الأسئلة الشائعة".`,
    suggestions: ["التبرع بالدم", "طريقة التسجيل", "الأسئلة الشائعة"]
  };
}

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", message, false);
  const typing = typingIndicator();
  input.value = "";

  const { html, suggestions } = smartReply(message);

  setTimeout(() => {
    typing.innerHTML = html;
    setSuggestions(suggestions || []);
    const chatBox = document.getElementById("chatMessages");
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 500);
}

// إرسال بالإنتر
document.getElementById("chatInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendChatMessage();
  }
});
