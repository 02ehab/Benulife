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
  console.log("Displaying user data:", userData);
  
  const userNameEl = document.getElementById("userName");
  const userCityEl = document.getElementById("userCity");
  const bloodTypeEl = document.querySelector(".blood-type-badge");

  if (userNameEl) userNameEl.textContent = userData.name || "اسم المستخدم";
  if (userCityEl) userCityEl.textContent = userData.city || "غير محددة";
  if (bloodTypeEl) bloodTypeEl.textContent = userData.blood_type || "N/A";

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
  const dropdownContent = document.querySelector(".dropdown-content");

  if (!dropdown || !dropdownBtn) return;

  dropdownBtn.addEventListener("click", e => {
    e.stopPropagation(); // يمنع إغلاق القائمة عند الضغط على الزر
    dropdownContent.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdownContent.classList.remove("show"); // إغلاق القائمة عند الضغط خارجها
    }
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

  // التحقق من معلمة التحديث في URL
  const urlParams = new URLSearchParams(window.location.search);
  const isUpdated = urlParams.get('updated');
  
  if (isUpdated) {
    // إزالة المعلمة من URL بعد التحديث
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // إظهار رسالة تأكيد
    setTimeout(() => {
      const successMsg = document.createElement('div');
      successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:15px;border-radius:5px;z-index:1000';
      successMsg.textContent = 'تم تحديث الملف الشخصي بنجاح!';
      document.body.appendChild(successMsg);
      
      setTimeout(() => successMsg.remove(), 3000);
    }, 500);
  }

  // جلب بيانات المستخدم من جدول profiles (استخدام maybeSingle لتجنب أخطاء JSON)
  const { data: userData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("خطأ في جلب بيانات المستخدم:", error);
    alert("خطأ في تحميل بيانات الملف الشخصي: " + error.message);
    return;
  }

  if (!userData) {
    console.warn("المستخدم غير موجود في جدول profiles");
    // إنشاء سجل افتراضي إذا لم يكن موجوداً
    const defaultProfile = {
      user_id: userId,
      name: "مستخدم جديد",
      blood_type: "غير محدد",
      city: "غير محددة",
      account_type: "user",
      donation_count: 0,
      created_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([defaultProfile]);
      
    if (!insertError) {
      displayUserData(defaultProfile);
    }
  } else {
    displayUserData(userData);
    updateRequestsLink(userData.account_type);
  }
});
