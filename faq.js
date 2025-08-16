// ✅ استيراد supabase
import { supabase } from './supabase.js';

// --- فتح وإغلاق القائمة الجانبية ---
window.openMenu = function () {
  document.getElementById("sideMenu")?.classList.add("open");
}
window.closeMenu = function () {
  document.getElementById("sideMenu")?.classList.remove("open");
}

// --- تغيير صفحة الطلبات على حسب نوع المستخدم ---
document.addEventListener("DOMContentLoaded", async () => {
  // 🟢 تحقق من الجلسة الحالية
  const { data: { session } } = await supabase.auth.getSession();

  let userType = localStorage.getItem("userType"); 

  // 🟢 لو مفيش userType في localStorage هجيبه من قاعدة البيانات
  if (session && !userType) {
    const userId = session.user.id;
    const { data: profile, error } = await supabase
      .from("login") // جدول المستخدمين
      .select("user_type") // تأكد أن العمود اسمه user_type
      .eq("id", userId)
      .single();

    if (profile && profile.user_type) {
      userType = profile.user_type;
      localStorage.setItem("userType", userType);
    }
  }

  const linkText = (userType === "hospital" || userType === "bloodbank")
    ? "طلبات المتبرعين"
    : "الطلبات العاجلة";

  const linkHref = (userType === "hospital" || userType === "bloodbank")
    ? "donate_card.html"
    : "emergency_card.html";

  const linkHTML = `<a href="${linkHref}">${linkText}</a>`;

  // تعويض أماكن الروابط
  const placeholders = [
    document.getElementById("requestsLinkPlaceholder"),
    document.getElementById("requestsLinkDesktop"),
    document.getElementById("requestsLinkMobile")
  ];

  placeholders.forEach(placeholder => {
    if (placeholder) {
      placeholder.outerHTML = linkHTML;
    }
  });

  // --- إظهار/إخفاء أزرار تسجيل الدخول حسب الحالة ---
  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (session) {
    if (authButtons) authButtons.style.display = "none";
    if (sideAuthButtons) sideAuthButtons.style.display = "none";

    if (profileLink) {
      profileLink.style.display = "inline-block";
      profileLink.textContent = "ملفي";
    }
    if (profileLinkMobile) {
      profileLinkMobile.style.display = "inline-block";
      profileLinkMobile.textContent = "ملفي";
    }
  }
});

// --- FAQ accordion functionality ---
document.addEventListener("DOMContentLoaded", () => {
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach(question => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      const isOpen = answer.style.display === "block";
      // Close all answers
      document.querySelectorAll(".faq-answer").forEach(ans => {
        ans.style.display = "none";
      });
      // Toggle current answer
      answer.style.display = isOpen ? "none" : "block";
    });
  });
});
