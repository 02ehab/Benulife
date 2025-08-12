import { supabase } from './supabase.js';

window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};

document.addEventListener("DOMContentLoaded", () => {
  // تغيير صفحة الطلبات حسب نوع المستخدم
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

  // إظهار ملفي وإخفاء تسجيل الدخول إذا كان المستخدم مسجل دخول
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");

  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (isLoggedIn) {
    if (authButtons) authButtons.style.display = "none";
    if (sideAuthButtons) sideAuthButtons.style.display = "none";
    if (profileLink) profileLink.style.display = "inline-block";
    if (profileLinkMobile) profileLinkMobile.style.display = "inline-block";
  }

  // التعامل مع إرسال النموذج وحفظ البيانات في Supabase
  const donationForm = document.getElementById("donationForm");
  if (donationForm) {
    donationForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const data = {
        fullName: document.getElementById("fullName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        bloodType: document.getElementById("bloodType").value,
        city: document.getElementById("city").value.trim(),
        donatedBefore: document.querySelector('input[name="donatedBefore"]:checked')?.value || null,
        donationDate: document.getElementById("donationDate").value || null,
        notes: document.getElementById("notes").value.trim() || null,
        created_at: new Date().toISOString()
      };

      // تحقق من الحقول المطلوبة
      if (!data.fullName || !data.phone || !data.email || !data.bloodType || !data.city) {
        alert("يرجى ملء جميع الحقول المطلوبة");
        return;
      }

      // إرسال البيانات إلى Supabase
      const { error } = await supabase
        .from("donate")
        .insert([data]);

      if (error) {
        alert("حدث خطأ أثناء إرسال الطلب: " + error.message);
      } else {
        const successMessage = document.getElementById("successMessage");
        if (successMessage) successMessage.style.display = "block";
        this.reset();

        setTimeout(() => {
          window.location.href = "track_order.html";  // عدّل حسب اسم صفحة التتبع عندك
        }, 1500);
      }
    });
  } else {
    console.warn("عنصر النموذج donationForm غير موجود في الصفحة.");
  }
});
