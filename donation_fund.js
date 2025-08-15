import { supabase } from "./supabase.js";

// 🔹 التحقق من تسجيل الدخول
async function checkUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("خطأ أثناء التحقق من الجلسة:", error.message);
    return;
  }

  if (!session) {
    alert("من فضلك سجل دخول أولاً");
    window.location.href = "login.html";
  } else {
    console.log("المستخدم الحالي:", session.user.email);
    await setupProfile(session.user.id);
    await setupRequestsLink(session.user.id);
  }
}

// 🔹 فتح / إغلاق القائمة الجانبية
window.openMenu = function () {
  document.getElementById("sideMenu")?.classList.add("open");
};
window.closeMenu = function () {
  document.getElementById("sideMenu")?.classList.remove("open");
};

// 🔹 نموذج التبرع المالي
document.getElementById("moneyDonationForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  alert("شكرًا لدعمك الإنساني ❤️ سيتم التواصل معك إن لزم الأمر.");
  this.reset();
});

// 🔹 إعداد رابط الطلبات حسب نوع المستخدم
async function setupRequestsLink(userId) {
  const { data: profile, error } = await supabase
    .from('login')
    .select('account_type') // عدل الاسم حسب جدولك
    .eq('id', userId)
    .maybeSingle(); // بدل single() لتجنب الخطأ

  if (error) {
    console.error("خطأ في جلب بيانات المستخدم:", error.message);
    return;
  }

  if (!profile) return;

  const userType = profile.account_type; // استخدم الاسم الصحيح للعمود
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
    if (placeholder) placeholder.outerHTML = linkHTML;
  });
}

// 🔹 عرض الملف الشخصي وإخفاء أزرار تسجيل الدخول
async function setupProfile(userId) {
  const { data: profile, error } = await supabase
    .from('login')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error("خطأ في جلب بيانات الملف الشخصي:", error.message);
    return;
  }

  if (!profile) return;

  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

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

// 🔹 بدء التحقق
checkUser();
 // تغيير صفحة الطلبات علي نوع المستخدم
document.addEventListener("DOMContentLoaded", () => {
  const userType = localStorage.getItem("userType"); // "donor", "hospital", "bloodbank"

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
});
