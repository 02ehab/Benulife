import { supabase } from "./supabase.js";

// ✅ التحقق من المستخدم وعرض اسمه والتاريخ
async function checkUserAndSetCertificate() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("من فضلك سجل دخول أولاً");
    window.location.href = "login.html";
    return;
  }

  // جلب الاسم من جدول profiles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('name')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
  }

  const donorName = profile?.name || "متبرع كريم";

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

  // Generate QR code linking to donor profile or donation record
  generateQRCode(user.id);
}

// Generate QR code function
function generateQRCode(userId) {
  const qrCodeContainer = document.createElement("div");
  qrCodeContainer.id = "qrCode";
  qrCodeContainer.style.marginTop = "20px";
  qrCodeContainer.style.textAlign = "center";

  const certificateContainer = document.getElementById("certificate");
  if (certificateContainer) {
    certificateContainer.appendChild(qrCodeContainer);

    // Use QRCode library to generate QR code
    // The URL can be adjusted to the actual donor profile or donation record page
    const qrCodeUrl = `${window.location.origin}/profile.html?user=${userId}`;

    // Clear previous QR code if any
    qrCodeContainer.innerHTML = "";

    new QRCode(qrCodeContainer, {
      text: qrCodeUrl,
      width: 100,
      height: 100,
      colorDark : "#B22222",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
  }
}

// نشغل الدالة بعد تحميل الصفحة بالكامل
document.addEventListener("DOMContentLoaded", () => {
  checkUserAndSetCertificate();
  launchConfetti();
});

// Generate confetti animation on load
function launchConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#B22222', '#F4A261', '#E63946']
  });
}

// فتح وإغلاق القائمة الجانبية
window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};
window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};

window.downloadPDF = async function () {
  const donorNameEl = document.getElementById("donorName");
  const name = donorNameEl ? donorNameEl.textContent : "متبرع كريم";

  const element = document.getElementById("certificate");
  if (!element) {
    alert("لم يتم العثور على عنصر الشهادة للطباعة.");
    return;
  }

  // حفظ الأنماط الأصلية
  const originalStyles = {
    width: element.style.width,
    height: element.style.height,
    maxWidth: element.style.maxWidth,
    position: element.style.position,
    display: element.style.display,
    visibility: element.style.visibility,
    animation: element.style.animation
  };

  // تعيين أبعاد A4 (794px x 1123px at 96 DPI)
  element.style.width = '794px';
  element.style.height = '1123px';
  element.style.maxWidth = 'none';
  element.style.position = 'relative';
  element.style.display = "block";
  element.style.visibility = "visible";
  element.style.animation = "none";

  // انتظر تحميل الخطوط والصور
  await document.fonts.ready;
  await Promise.all(Array.from(element.querySelectorAll("img")).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => img.onload = img.onerror = resolve);
  }));

  const options = {
    margin: 0,
    filename: `شهادة شكر - ${name}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1, useCORS: true },
    jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' }
  };

  html2pdf().set(options).from(element).save().then(() => {
    // إعادة الأنماط الأصلية بعد التحميل
    element.style.width = originalStyles.width;
    element.style.height = originalStyles.height;
    element.style.maxWidth = originalStyles.maxWidth;
    element.style.position = originalStyles.position;
    element.style.display = originalStyles.display;
    element.style.visibility = originalStyles.visibility;
    element.style.animation = originalStyles.animation;
  }).catch((error) => {
    alert("حدث خطأ أثناء تحميل الشهادة: " + error);
    // إعادة الأنماط في حالة الخطأ أيضًا
    element.style.width = originalStyles.width;
    element.style.height = originalStyles.height;
    element.style.maxWidth = originalStyles.maxWidth;
    element.style.position = originalStyles.position;
    element.style.display = originalStyles.display;
    element.style.visibility = originalStyles.visibility;
    element.style.animation = originalStyles.animation;
  });
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
