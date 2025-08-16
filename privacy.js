// ✅ استيراد supabase
import { supabase } from './supabase.js';

// --- فتح وإغلاق القائمة الجانبية ---
window.openMenu = function () {
  document.getElementById("sideMenu")?.classList.add("open");
}
window.closeMenu = function () {
  document.getElementById("sideMenu")?.classList.remove("open");
}

// --- التحقق من تسجيل الدخول وعرض "ملفي" بدلاً من تسجيل الدخول ---
document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabase.auth.getSession();

  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (session) {
    const userId = session.user.id;

    // 🟢 جلب بيانات المستخدم من جدول login
    const { data: profile, error } = await supabase
      .from("login") // اسم الجدول عندك
      .select("user_type")
      .eq("id", userId)
      .single();

    if (profile) {
      // إخفاء أزرار تسجيل الدخول
      if (authButtons) authButtons.style.display = "none";
      if (sideAuthButtons) sideAuthButtons.style.display = "none";

      // إظهار كلمة "ملفي"
      if (profileLink) {
        profileLink.style.display = "inline-block";
        profileLink.textContent = "ملفي";
      }
      if (profileLinkMobile) {
        profileLinkMobile.style.display = "inline-block";
        profileLinkMobile.textContent = "ملفي";
      }

      // 🟢 تغيير صفحة الطلبات على حسب نوع المستخدم
      const userType = profile.user_type; // donor | hospital | bloodbank
      localStorage.setItem("userType", userType); // حفظ محلي كنسخة

      const linkText = (userType === "hospital" || userType === "bloodbank")
        ? "طلبات المتبرعين"
        : "الطلبات العاجلة";

      const linkHref = (userType === "hospital" || userType === "bloodbank")
        ? "donate_card.html"
        : "emergency_card.html";

      const linkHTML = `<a href="${linkHref}">${linkText}</a>`;

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
    }
  } else {
    // 🔴 لو مفيش جلسة: اعرض أزرار تسجيل الدخول
    if (authButtons) authButtons.style.display = "block";
    if (sideAuthButtons) sideAuthButtons.style.display = "block";

    if (profileLink) profileLink.style.display = "none";
    if (profileLinkMobile) profileLinkMobile.style.display = "none";
  }
});
