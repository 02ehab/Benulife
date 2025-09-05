import { supabase } from './supabase.js';

// فتح/إغلاق القائمة الجانبية
window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}
  const { jsPDF } = window.jspdf;

  // زر تحميل الشهادة
  document.getElementById("downloadCert").addEventListener("click", () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("شهادة شكر وتقدير", 60, 40);
    doc.setFontSize(14);
    doc.text("تتقدم منصة حياة بخالص الشكر والتقدير", 20, 70);
    doc.text("للمتبرع الكريم على دعمه ومساهمته في الخير.", 20, 85);
    doc.text("تبرعك يساعد أطفال وأسر محتاجة في مصر.", 20, 105);
    doc.text("مع تحيات منصة حياة ❤", 20, 130);
    doc.save("donation_certificate.pdf");
  });

  // زر متابعة التتبع
  document.getElementById("goTracking").addEventListener("click", () => {
    window.location.href = "track_donate.html"; // غيّر الاسم حسب صفحتك
  });

    // تغيير روابط الصفحة حسب نوع المستخدم
  const userType = localStorage.getItem("userType");
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

  // عرض كلمة "ملفي" إذا المستخدم مسجل دخول
  const { data: { session } } = await supabase.auth.getSession();
  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (session) {
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
