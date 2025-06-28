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

// ربط زري تسجيل الخروج (في الملف الشخصي والداشبورد)
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutBtn2 = document.getElementById("logoutBtn2");

  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (logoutBtn2) logoutBtn2.addEventListener("click", logout);

  // عرض حسب نوع المستخدم
  const userType = localStorage.getItem("userType");
  const dashboard = document.getElementById("dashboard");
  const donorProfile = document.getElementById("donorProfile");

  if (userType === "hospital") {
    dashboard.style.display = "block";
    donorProfile.style.display = "none";
    renderRequestsDashboard();
  } else {
    dashboard.style.display = "none";
    donorProfile.style.display = "block";
  }
});

// بيانات مؤقتة لطلبات الداشبورد (مثال)
const requests = [
  { id: 1, patient: "محمد علي", bloodType: "O+", status: "جديد" },
  { id: 2, patient: "سعاد محمد", bloodType: "A-", status: "قيد التوصيل" },
  { id: 3, patient: "علي حسن", bloodType: "B+", status: "تم الاستلام" },
];

// دالة لعرض الطلبات في لوحة التحكم
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
