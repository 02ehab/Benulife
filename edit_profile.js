 window.openMenu = function () {
      document.getElementById("sideMenu").classList.add("open");
    };

    window.closeMenu = function () {
      document.getElementById("sideMenu").classList.remove("open");
    };

        //وسام المتبرع الذهبي
    document.addEventListener("DOMContentLoaded", () => {
  const userType = localStorage.getItem("userType");
  const dashboard = document.getElementById("dashboard");
  const donorProfile = document.getElementById("donorProfile");

  if (userType === "hospital") {
    dashboard.style.display = "block";
    donorProfile.style.display = "none";

    // وسام المستشفى
    const badgeDiv = document.getElementById("badge");
    const badgeText = document.getElementById("badgeText");
    const requestsHandled = 5; // عدد الطلبات المستلمة الناجحة كمثال

    if (requestsHandled >= 5) {
      badgeDiv.style.display = "block";
      badgeText.textContent = "🏥 وسام العطاء المجتمعي";
    }

    renderRequestsDashboard();
  } else {
    dashboard.style.display = "none";
    donorProfile.style.display = "block";

    // وسام المتبرع
    const donationCount = 5; // عدد التبرعات
    const points = donationCount * 50;

    const pointsSpan = document.getElementById("points");
    const badgeDiv = document.getElementById("badge");
    const badgeText = document.getElementById("badgeText");

    pointsSpan.textContent = points;

    if (points >= 200) {
      badgeDiv.style.display = "block";
      badgeText.textContent = "🥇 وسام المتبرع الذهبي";
    }
  }
});

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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("editProfileForm");
  const userData = JSON.parse(localStorage.getItem("userProfile")) || {};

  // تعبئة البيانات القديمة
  document.getElementById("name").value = userData.name || "";
  document.getElementById("bloodType").value = userData.bloodType || "";
  document.getElementById("city").value = userData.city || "";

  // عند حفظ التعديلات
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const updatedData = {
      name: document.getElementById("name").value,
      bloodType: document.getElementById("bloodType").value,
      city: document.getElementById("city").value,
    };

    localStorage.setItem("userProfile", JSON.stringify(updatedData));
    alert("تم حفظ التعديلات بنجاح!");
    window.location.href = "profile.html"; // الرجوع للملف الشخصي
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
