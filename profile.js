 window.openMenu = function () {
      document.getElementById("sideMenu").classList.add("open");
    };

    window.closeMenu = function () {
      document.getElementById("sideMenu").classList.remove("open");
    };

    function logout() {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("userType");
      window.location.href = "login.html";
    }

    document.addEventListener("DOMContentLoaded", () => {
      const logoutBtn = document.getElementById("logoutBtn");
      const logoutBtn2 = document.getElementById("logoutBtn2");
      const dashboardBtn = document.getElementById("dashboardBtn");

      if (logoutBtn) logoutBtn.addEventListener("click", logout);
      if (logoutBtn2) logoutBtn2.addEventListener("click", logout);

      const userType = localStorage.getItem("userType");
      const dashboard = document.getElementById("dashboard");
      const donorProfile = document.getElementById("donorProfile");

      if (userType === "hospital") {
        dashboard.style.display = "block";
        donorProfile.style.display = "none";
        if (dashboardBtn) dashboardBtn.style.display = "inline-block";
        renderRequestsDashboard();
      } else {
        dashboard.style.display = "none";
        donorProfile.style.display = "block";
      }
    });

    const requests = [
      { id: 1, patient: "محمد علي", bloodType: "O+", status: "جديد" },
      { id: 2, patient: "سعاد محمد", bloodType: "A-", status: "قيد التوصيل" },
      { id: 3, patient: "علي حسن", bloodType: "B+", status: "تم الاستلام" },
    ];

    function renderRequestsDashboard() {
      const newList = document.getElementById("newRequestsList");
      const statusList = document.getElementById("requestsStatusList");
      const confirmList = document.getElementById("confirmReceiptList");

      newList.innerHTML = "";
      statusList.innerHTML = "";
      confirmList.innerHTML = "";

      requests.forEach(req => {
        if (req.status === "جديد") {
          const li = document.createElement("li");
          li.textContent = `${req.patient} - فصيلة دم ${req.bloodType}`;

          const acceptBtn = document.createElement("button");
          acceptBtn.textContent = "قبول";
          acceptBtn.onclick = () => {
            req.status = "قيد التوصيل";
            renderRequestsDashboard();
          };

          li.appendChild(acceptBtn);
          newList.appendChild(li);
        }

        if (req.status !== "جديد") {
          const li = document.createElement("li");
          li.textContent = `${req.patient} - ${req.status}`;
          statusList.appendChild(li);
        }

        if (req.status === "قيد التوصيل") {
          const li = document.createElement("li");
          li.textContent = `${req.patient} - فصيلة دم ${req.bloodType}`;

          const confirmBtn = document.createElement("button");
          confirmBtn.textContent = "تأكيد استلام";
          confirmBtn.onclick = () => {
            req.status = "تم الاستلام";
            renderRequestsDashboard();
          };

          li.appendChild(confirmBtn);
          confirmList.appendChild(li);
        }
      });
    }
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
