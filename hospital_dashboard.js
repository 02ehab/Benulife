window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}
 
// مثال بيانات طلبات مؤقتة
    const requests = [
      { id: 1, patient: "محمد علي", bloodType: "O+", status: "جديد" },
      { id: 2, patient: "سعاد محمد", bloodType: "A-", status: "قيد التوصيل" },
      { id: 3, patient: "علي حسن", bloodType: "B+", status: "تم الاستلام" },
    ];

    function renderRequests() {
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
          // زر قبول الطلب
          const acceptBtn = document.createElement("button");
          acceptBtn.textContent = "قبول";
          acceptBtn.onclick = () => {
            req.status = "قيد التوصيل";
            renderRequests();
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
            renderRequests();
          };
          li.appendChild(confirmBtn);
          confirmList.appendChild(li);
        }
      });
    }

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
