window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}
window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

// جلب الطلبات من localStorage أو مصفوفة فارغة
let allRequests = JSON.parse(localStorage.getItem("emergencyRequests") || "[]");

// العناصر
const container = document.getElementById("requestsContainer");
const bloodFilter = document.getElementById("bloodFilter");
const cityFilter = document.getElementById("cityFilter");

// عرض الطلبات في الصفحة
function renderRequests(requests) {
  container.innerHTML = "";
  if (requests.length === 0) {
    container.innerHTML = "<p>لا توجد طلبات متاحة حالياً.</p>";
    return;
  }
  requests.forEach(req => {
    const card = document.createElement("div");
    card.className = "request-card";
    card.innerHTML = `
      <div class="blood-type">${req.bloodType}</div>
      <div class="request-info"><strong>الاسم:</strong> ${req.fullName}</div>
      <div class="request-info"><strong>المدينة:</strong> ${req.city}</div>
      <div class="timer">⏳ ${req.timeLeftText}</div>
      <button onclick="alert('سيتم التواصل مع ${req.fullName}')">ساعد الآن</button>
    `;
    container.appendChild(card);
  });
}

// فلترة الطلبات حسب الفصيلة والمدينة
function filterRequests() {
  const blood = bloodFilter.value;
  const city = cityFilter.value.trim();

  const filtered = allRequests.filter(req => {
    const matchBlood = blood ? req.bloodType === blood : true;
    const matchCity = city ? req.city.includes(city) : true;
    return matchBlood && matchCity;
  });

  renderRequests(filtered);
}

// ربط الفلاتر بالأحداث
bloodFilter.addEventListener("change", filterRequests);
cityFilter.addEventListener("input", filterRequests);

// عرض أولي
renderRequests(allRequests);

// تظهر بفقط للمستشفي او بنك الدم
document.addEventListener("DOMContentLoaded", () => {
  const userType = localStorage.getItem("userType");
  if (userType !== "hospital" && userType !== "bloodbank") {
    alert("هذه الصفحة مخصصة للمستشفيات وبنوك الدم فقط.");
    window.location.href = "index.html";
    return;
  }

  const allRequests = JSON.parse(localStorage.getItem("emergencyRequests") || "[]");

  function renderRequests(requests) {
    const container = document.getElementById("requestsContainer");
    container.innerHTML = "";

    if (requests.length === 0) {
      container.innerHTML = "<p>لا توجد طلبات حالياً</p>";
      return;
    }

    requests.forEach((req, index) => {
      if (req.status === "accepted") return; // تجاهل المقبولة

      const card = document.createElement("div");
      card.className = "request-card";
      card.innerHTML = `
        <div class="blood-type">${req.bloodType}</div>
        <div class="request-info"><strong>الاسم:</strong> ${req.fullName}</div>
        <div class="request-info"><strong>المدينة:</strong> ${req.city}</div>
        <div class="timer">⏳ ${req.timeLeftText}</div>
        <button class="accept-btn" data-index="${index}">قبول الطلب</button>
      `;
      container.appendChild(card);
    });

    // إضافة أحداث على أزرار "قبول الطلب"
    document.querySelectorAll(".accept-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        acceptRequest(index);
      });
    });
  }

  function acceptRequest(index) {
    const requests = JSON.parse(localStorage.getItem("emergencyRequests") || "[]");
    requests[index].status = "accepted";
    localStorage.setItem("emergencyRequests", JSON.stringify(requests));
    alert("تم قبول الطلب بنجاح");
    renderRequests(filterRequests(requests));
  }

  function filterRequests(data = null) {
    const blood = document.getElementById("bloodFilter").value;
    const city = document.getElementById("cityFilter").value.trim();
    const source = data || JSON.parse(localStorage.getItem("emergencyRequests") || "[]");

    return source.filter(req => {
      const matchBlood = blood ? req.bloodType === blood : true;
      const matchCity = city ? req.city.includes(city) : true;
      return req.status !== "accepted" && matchBlood && matchCity;
    });
  }

  document.getElementById("bloodFilter").addEventListener("change", () => {
    renderRequests(filterRequests());
  });

  document.getElementById("cityFilter").addEventListener("input", () => {
    renderRequests(filterRequests());
  });

  renderRequests(filterRequests());
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
