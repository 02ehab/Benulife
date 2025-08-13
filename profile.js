// profile.js
import { supabase } from './supabase.js';

// فتح/إغلاق القائمة الجانبية
window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};

// تسجيل الخروج
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutBtn2 = document.getElementById("logoutBtn2");

  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (logoutBtn2) logoutBtn2.addEventListener("click", logout);

  // جلب المستخدم الحالي
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("خطأ في جلب المستخدم:", userError);
    return;
  }

  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (!user) {
    if (profileLink) profileLink.style.display = "none";
    if (profileLinkMobile) profileLinkMobile.style.display = "none";
    return;
  }

  // إظهار الملف الشخصي وإخفاء أزرار تسجيل الدخول
  if (profileLink) profileLink.style.display = "inline-block";
  if (profileLinkMobile) profileLinkMobile.style.display = "inline-block";
  if (authButtons) authButtons.style.display = "none";
  if (sideAuthButtons) sideAuthButtons.style.display = "none";

  // جلب بيانات المستخدم من جدول login
  const { data: userData, error } = await supabase
    .from("login")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("خطأ في جلب بيانات المستخدم:", error);
    return;
  }

  // عرض البيانات في الصفحة
  document.getElementById("userName").textContent = userData.name || "اسم المستخدم";
  document.getElementById("userCity").textContent = userData.city || "غير محددة";
  document.querySelector(".blood-type-badge").textContent = userData.blood_type || "N/A";

  const donationCount = userData.donation_count || 0;
  const points = donationCount * 50;

  const pointsSpan = document.getElementById("points");
  const badgeDiv = document.getElementById("badge");
  const badgeText = document.getElementById("badgeText");

  pointsSpan.textContent = points;
  if (points >= 200) {
    badgeDiv.style.display = "block";
    badgeText.textContent = "🥇 وسام المتبرع الذهبي";
  }

  // تحديث رابط الطلبات حسب نوع المستخدم
  const userType = userData.account_type;
  const linkText = (userType === "hospital" || userType === "bloodbank") ? "طلبات المتبرعين" : "الطلبات العاجلة";
  const linkHref = (userType === "hospital" || userType === "bloodbank") ? "donate_card.html" : "emergency_card.html";
  const linkHTML = `<a href="${linkHref}">${linkText}</a>`;

  const placeholders = [
    document.getElementById("requestsLinkPlaceholder"),
    document.getElementById("requestsLinkDesktop"),
    document.getElementById("requestsLinkMobile")
  ];

  placeholders.forEach(placeholder => {
    if (placeholder) placeholder.outerHTML = linkHTML;
  });

  // Dropdown زر تعديل البيانات + تسجيل الخروج
const dropdownBtn = document.querySelector(".dropdown-btn");
const dropdown = document.querySelector(".dropdown"); // العنصر الأب

if (dropdownBtn && dropdown) {
  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // منع إغلاق القائمة فورًا عند الضغط
    dropdown.classList.toggle("show"); // إضافة أو إزالة الكلاس على الأب
  });

  window.addEventListener("click", () => {
    dropdown.classList.remove("show"); // إخفاء عند الضغط خارج
  });
}
});
