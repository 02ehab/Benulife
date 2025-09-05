import { supabase } from './supabase.js';

// فتح/إغلاق القائمة الجانبية
window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

// ✅ التحقق من تسجيل الدخول عبر Supabase
document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (session) {
    const userId = session.user.id;

    // 📌 جلب بيانات المستخدم من جدول profiles (أو login حسب تسميتك)
    const { data: profile, error } = await supabase
      .from('profiles') // ⚠️ غيّرها لاسم جدولك (انت كاتب login، الأفضل يكون profiles)
      .select('id, userType, full_name')
      .eq('id', userId)
      .single();

    if (profile) {
      // إخفاء أزرار تسجيل الدخول / إنشاء حساب
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

      // ✅ ربط صفحة الطلبات حسب نوع الحساب من قاعدة البيانات
      const userType = profile.userType; // donor, hospital, bloodbank

      const linkText = (userType === "hospital" || userType === "bloodbank")
        ? "طلبات المتبرعين"
        : "الطلبات العاجلة";

      const linkHref = (userType === "hospital" || userType === "bloodbank")
        ? "donate_card.html"
        : "emergency_card.html";

      const linkHTML = `<a href="${linkHref}">${linkText}</a>`;

      // استبدال أماكن الروابط
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
    console.log("🚪 المستخدم غير مسجل دخول");
  }
});
