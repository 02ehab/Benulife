window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}
 
// مثال بيانات طلبات مؤقتة

// زر فتح نافذة الطلب
document.addEventListener("DOMContentLoaded", () => {
  const openFormBtn = document.getElementById("openFormBtn");
  const requestPopup = document.getElementById("requestPopup");
  const closePopupBtn = document.getElementById("closePopupBtn");
  const toggleRequestsBtn = document.getElementById("toggleRequestsBtn");
  const requestsSection = document.getElementById("requestsSection");

  if (openFormBtn && requestPopup) {
    openFormBtn.addEventListener("click", () => {
      requestPopup.classList.remove("hidden");
    });
  }

  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", () => {
      requestPopup.classList.add("hidden");
    });
  }

  if (toggleRequestsBtn && requestsSection) {
    toggleRequestsBtn.addEventListener("click", () => {
      requestsSection.classList.toggle("hidden");
    });
  }

  const requestForm = document.getElementById("requestForm");
  if (requestForm) {
    requestForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("✅ تم إرسال طلب التبرع بنجاح!");
      requestPopup.classList.add("hidden");
      requestForm.reset();
    });
  }
});

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });

    renderRequests();

    document.addEventListener("DOMContentLoaded", () => {
  const userType = localStorage.getItem("userType");
  if(userType !== "hospital") {
    alert("غير مصرح بالدخول");
    window.location.href = "login.html";
  }
});
