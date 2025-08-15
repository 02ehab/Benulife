import { supabase } from './supabase.js';

// --- فتح/إغلاق القائمة الجانبية ---
window.openMenu = () => document.getElementById("sideMenu")?.classList.add("open");
window.closeMenu = () => document.getElementById("sideMenu")?.classList.remove("open");

// --- تسجيل الخروج ---
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

// --- عرض بيانات المستخدم ---
function displayUserData(userData) {
  document.getElementById("userName").textContent = userData.name || "اسم المستخدم";
  document.getElementById("userCity").textContent = userData.city || "غير محددة";
  document.querySelector(".blood-type-badge").textContent = userData.blood_type || "N/A";

  const donationCount = userData.donation_count || 0;
  const points = donationCount * 50;

  const pointsSpan = document.getElementById("points");
  const badgeDiv = document.getElementById("badge");
  const badgeText = document.getElementById("badgeText");

  if (pointsSpan) pointsSpan.textContent = points;
  if (badgeDiv && badgeText && points >= 200) {
    badgeDiv.style.display = "block";
    badgeText.textContent = "🥇 وسام المتبرع الذهبي";
  }
}

// --- تحديث رابط الطلبات حسب نوع المستخدم ---
function updateRequestsLink(userType) {
  const isHospital = userType === "hospital" || userType === "bloodbank";
  const linkText = isHospital ? "طلبات المتبرعين" : "الطلبات العاجلة";
  const linkHref = isHospital ? "donate_card.html" : "emergency_card.html";
  const linkHTML = `<a href="${linkHref}">${linkText}</a>`;

  const placeholders = [
    document.getElementById("requestsLinkPlaceholder"),
    document.getElementById("requestsLinkDesktop"),
    document.getElementById("requestsLinkMobile")
  ];

  placeholders.forEach(el => {
    if (el) el.outerHTML = linkHTML;
  });
}

// --- إعداد Dropdown ---
function setupDropdown() {
  const dropdown = document.querySelector(".dropdown");
  const dropdownBtn = document.querySelector(".dropdown-btn");

  if (!dropdown || !dropdownBtn) return;

  dropdownBtn.addEventListener("click", e => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("show");
  });
}

// --- تحميل الصفحة ---
document.addEventListener("DOMContentLoaded", async () => {
  // أزرار تسجيل الخروج
  ["logoutBtn", "logoutBtn2"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", logout);
  });

  // الجلسة الحالية
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return window.location.href = "login.html";

  const userId = session.user.id;

  // إخفاء أزرار تسجيل الدخول / إنشاء حساب
  ["authButtons", "sideAuthButtons"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  ["profileLink", "profileLinkMobile"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "inline-block";
      el.textContent = "ملفي";
    }
  });

  // جلب بيانات المستخدم من جدول profiles (استخدام maybeSingle لتجنب أخطاء JSON)
  const { data: userData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return console.error("خطأ في جلب بيانات المستخدم:", error);
  if (!userData) {
    console.warn("المستخدم غير موجود في جدول profiles");
    return;
  }

  displayUserData(userData);
  updateRequestsLink(userData.account_type);
  setupDropdown();
});
