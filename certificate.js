// قائمة الشات في الهاتف
window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};

// استخراج اسم المتبرع من الرابط
const params = new URLSearchParams(window.location.search);
const name = params.get("name") || "متبرع كريم";

// عرض الاسم والتاريخ على الشهادة (إن وُجدت العناصر)
const donorNameEl = document.getElementById("donorName");
if (donorNameEl) donorNameEl.textContent = name;

const dateEl = document.getElementById("currentDate");
if (dateEl) dateEl.textContent = new Date().toLocaleDateString("ar-EG");

// تحميل الشهادة كـ PDF
window.downloadPDF = function () {
  const element = document.getElementById("certificate");

  const options = {
    margin:       0.5,
    filename:     `شهادة شكر - ${name}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
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
//وقت تسجيل الدخول يظهر ملفي ويختفي تسجيل الدخول
 document.addEventListener("DOMContentLoaded", function () {
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
  });
