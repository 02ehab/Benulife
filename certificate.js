import { supabase } from "./supabase.js";

// ✅ التحقق من المستخدم وعرض اسمه والتاريخ
async function checkUserAndSetCertificate() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("من فضلك سجل دخول أولاً");
    window.location.href = "login.html";
    return;
  }

  // جلب الاسم من user_metadata أو البريد
  const donorName = user.user_metadata?.full_name || user.email || "متبرع كريم";

  // عرض الاسم
  const donorNameEl = document.getElementById("donorName");
  if (donorNameEl) donorNameEl.textContent = donorName;

  // عرض التاريخ الحالي بصيغة عربية
  const today = new Date();
  const formattedDate = today.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const dateEl = document.getElementById("currentDate");
  if (dateEl) dateEl.textContent = formattedDate;
}

// نشغل الدالة بعد تحميل الصفحة بالكامل
document.addEventListener("DOMContentLoaded", checkUserAndSetCertificate);

// فتح وإغلاق القائمة الجانبية
window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};
window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};

// تحميل الشهادة كـ PDF
window.downloadPDF = function () {
  const donorNameEl = document.getElementById("donorName");
  const name = donorNameEl ? donorNameEl.textContent : "متبرع كريم";

  const element = document.getElementById("certificate");
  const options = {
    margin: 0.5,
    filename: `شهادة شكر - ${name}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(options).from(element).save();
};
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
