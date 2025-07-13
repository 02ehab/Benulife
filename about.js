window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

function openMenu() {
      document.getElementById("sideMenu").classList.add("open");
    }
    function closeMenu() {
      document.getElementById("sideMenu").classList.remove("open");
    }

    document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("donationForm");
      const successMessage = document.getElementById("successMessage");

      form.addEventListener("submit", (e) => {
        e.preventDefault();

        // هنا يمكنك إرسال البيانات إلى سيرفر أو تخزينها
        successMessage.style.display = "block";
        form.reset();
      });
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
