window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

 // بيانات وهمية (تستبدل لاحقًا ببيانات حقيقية من localStorage أو قاعدة بيانات)
const requests = [
  {
    bloodType: "O+",
    fullName: "أحمد عبد الله",
    city: "الرياض",
    hoursLeft: 6
  },
  {
    bloodType: "A-",
    fullName: "سارة علي",
    city: "جدة",
    hoursLeft: 3
  },
  {
    bloodType: "AB+",
    fullName: "محمد سالم",
    city: "مكة",
    hoursLeft: 1
  },
  {
    bloodType: "AB+",
    fullName: "محمد سالم",
    city: "مكة",
    hoursLeft: 1
  },
  {
    bloodType: "AB+",
    fullName: "محمد سالم",
    city: "مكة",
    hoursLeft: 1
  },
  {
    bloodType: "AB+",
    fullName: "محمد سالم",
    city: "مكة",
    hoursLeft: 1
  }
  
  
  
  
];

// عرض الطلبات
const container = document.getElementById("requestsContainer");

requests.forEach(req => {
  const card = document.createElement("div");
  card.className = "request-card";

  card.innerHTML = `
    <div class="blood-type">${req.bloodType}</div>
    <div class="request-info"><strong>الاسم:</strong> ${req.fullName}</div>
    <div class="request-info"><strong>المدينة:</strong> ${req.city}</div>
    <div class="timer">⏳ ${req.hoursLeft} ساعة متبقية</div>
    <button onclick="alert('سيتم التواصل مع ${req.fullName}')">ساعد الآن</button>
  `;

  container.appendChild(card);
});


// رسم الكروت
function renderRequests(requests) {
  const container = document.getElementById("requestsContainer");
  container.innerHTML = "";

  requests.forEach(req => {
    const card = document.createElement("div");
    card.className = "request-card";
    card.innerHTML = `
      <div class="request-info"><strong>الاسم:</strong> ${req.name}</div>
      <div class="request-info"><strong>المدينة:</strong> ${req.city}</div>
      <p class="blood-type">فصيلة الدم المطلوبة: <span>${req.bloodType}</span></p>
      <div class="timer">⏳ ${req.timeLeft}</div>
      <button>ساعد الآن</button>
    `;
    container.appendChild(card);
  });
}


// التصفية
function filterRequests() {
  const blood = document.getElementById("bloodFilter").value;
  const city = document.getElementById("cityFilter").value.trim();

  const filtered = allRequests.filter(req => {
    const matchBlood = blood ? req.bloodType === blood : true;
    const matchCity = city ? req.city.includes(city) : true;
    return matchBlood && matchCity;
  });

  renderRequests(filtered);
}

// ربط الأحداث
document.getElementById("bloodFilter").addEventListener("change", filterRequests);
document.getElementById("cityFilter").addEventListener("input", filterRequests);

// أول عرض
renderRequests(allRequests);

//عرض في  الصفحة الرئيسية
function saveEmergencyRequest(data) {
  const existing = JSON.parse(localStorage.getItem("emergencyRequests") || "[]");
  existing.push(data);
  localStorage.setItem("emergencyRequests", JSON.stringify(existing));
}
