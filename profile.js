// فتح/إغلاق القائمة الجانبية
window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};

// تسجيل الخروج
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  localStorage.removeItem("userType");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutBtn2 = document.getElementById("logoutBtn2");

  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (logoutBtn2) logoutBtn2.addEventListener("click", logout);
});

// إظهار رابط "ملفي" واختفاء تسجيل الدخول عند تسجيل الدخول
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

// تغيير رابط الطلبات حسب نوع المستخدم
document.addEventListener("DOMContentLoaded", () => {
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
    if (placeholder) {
      placeholder.outerHTML = linkHTML;
    }
  });
});

// القائمة المنسدلة
document.addEventListener("DOMContentLoaded", () => {
  const dropdownBtn = document.querySelector(".dropdown-btn");
  const dropdown = document.querySelector(".dropdown");

  dropdownBtn.addEventListener("click", () => {
    dropdown.classList.toggle("show");
  });

  window.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      alert("تم تسجيل الخروج");
      logout();
    });
  }
});

// تحميل بيانات المستخدم وعرضها في الصفحة
document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(localStorage.getItem("userProfile")) || {};

  document.getElementById("userName").textContent = userData.name || "اسم المستخدم";
  document.getElementById("userCity").textContent = userData.city || "غير محددة";
  document.querySelector(".blood-type-badge").textContent = userData.bloodType || "N/A";

  const donationCount = userData.donationCount || 0;
  const points = donationCount * 50;

  const pointsSpan = document.getElementById("points");
  const badgeDiv = document.getElementById("badge");
  const badgeText = document.getElementById("badgeText");

  pointsSpan.textContent = points;

  if (points >= 200) {
    badgeDiv.style.display = "block";
    badgeText.textContent = "🥇 وسام المتبرع الذهبي";
  }
});
