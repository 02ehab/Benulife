import { supabase } from './supabase.js';

// -------------------------
// فتح وإغلاق القائمة الجانبية
// -------------------------
window.openMenu = () => document.getElementById("sideMenu")?.classList.add("open");
window.closeMenu = () => document.getElementById("sideMenu")?.classList.remove("open");

// -------------------------
// تحديث واجهة المستخدم بناءً على نوع المستخدم (Hospital / Donor)
// -------------------------
async function updateDashboard() {
  const { data: { session } } = await supabase.auth.getSession();
  const userType = session?.user?.user_metadata?.account_type || localStorage.getItem("userType") || "donor";

  const dashboard = document.getElementById("dashboard");
  const donorProfile = document.getElementById("donorProfile");
  const badgeDiv = document.getElementById("badge");
  const badgeText = document.getElementById("badgeText");
  const pointsSpan = document.getElementById("points");

  if (userType === "hospital") {
    dashboard?.style.display = "block";
    donorProfile?.style.display = "none";

    const requestsHandled = 5; // مثال: عدد الطلبات المستلمة بنجاح
    if (requestsHandled >= 5) {
      badgeDiv.style.display = "block";
      badgeText.textContent = "🏥 وسام العطاء المجتمعي";
    }

    renderRequestsDashboard(); // تأكد أن هذه الدالة معرفة في مكان آخر
  } else {
    dashboard?.style.display = "none";
    donorProfile?.style.display = "block";

    const donationCount = 5;
    const points = donationCount * 50;
    pointsSpan && (pointsSpan.textContent = points);

    if (points >= 200) {
      badgeDiv.style.display = "block";
      badgeText.textContent = "🥇 وسام المتبرع الذهبي";
    }
  }

  // تحديث روابط الطلبات حسب نوع المستخدم
  const linkText = (userType === "hospital" || userType === "bloodbank") ? "طلبات المتبرعين" : "الطلبات العاجلة";
  const linkHref = (userType === "hospital" || userType === "bloodbank") ? "donate_card.html" : "emergency_card.html";
  const placeholders = [
    document.getElementById("requestsLinkPlaceholder"),
    document.getElementById("requestsLinkDesktop"),
    document.getElementById("requestsLinkMobile")
  ];

  placeholders.forEach(ph => {
    if (ph) ph.outerHTML = `<a href="${linkHref}">${linkText}</a>`;
  });
}

// -------------------------
// تعبئة وتعديل بيانات الملف الشخصي
// -------------------------
async function setupProfileForm() {
  const form = document.getElementById("editProfileForm");
  if (!form) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return alert("يجب تسجيل الدخول أولاً.");

  const userId = session.user.id;

  // جلب البيانات الحالية
  const { data: profile, error } = await supabase
    .from('login')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return console.error("خطأ في جلب البيانات:", error.message);

  // تعبئة الفورم
  form.name.value = profile?.name || "";
  form.bloodType.value = profile?.bloodType || "";
  form.city.value = profile?.city || "";

  // حفظ التعديلات
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const updates = {
      name: form.name.value,
      bloodType: form.bloodType.value,
      city: form.city.value,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('login')
      .update(updates)
      .eq('id', userId);

    if (updateError) return alert("حدث خطأ أثناء تحديث البيانات: " + updateError.message);

    alert("تم حفظ التعديلات بنجاح!");
    window.location.href = "profile.html";
  });
}

// -------------------------
// تحديث أزرار تسجيل الدخول وملفي
// -------------------------
async function updateAuthUI() {
  const { data: { session } } = await supabase.auth.getSession();

  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (session?.user) {
    const { data: profile } = await supabase
      .from('login')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      authButtons && (authButtons.style.display = "none");
      sideAuthButtons && (sideAuthButtons.style.display = "none");

      profileLink && (profileLink.style.display = "inline-block", profileLink.textContent = "ملفي");
      profileLinkMobile && (profileLinkMobile.style.display = "inline-block", profileLinkMobile.textContent = "ملفي");
    }
  } else {
    authButtons && (authButtons.style.display = "flex");
    sideAuthButtons && (sideAuthButtons.style.display = "flex");
    profileLink && (profileLink.style.display = "none");
    profileLinkMobile && (profileLinkMobile.style.display = "none");
  }
}

// -------------------------
// تشغيل كل الوظائف عند تحميل الصفحة
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();
  setupProfileForm();
  updateAuthUI();
});
