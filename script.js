// فتح وإغلاق القائمة الجانبية
window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}
window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

// إعداد خريطة Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZWhhYjEwIiwiYSI6ImNtY3ZsaXZucDBidzUyaXM4cWluZjcxMzYifQ.EUIFT090mttpMoVNzUrYhg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [39.8579, 21.3891],
  zoom: 12
});
map.addControl(new mapboxgl.NavigationControl());

// نقطة مركزية
new mapboxgl.Marker()
  .setLngLat([39.8579, 21.3891])
  .setPopup(new mapboxgl.Popup().setHTML("<strong>موقع التبرع</strong>"))
  .addTo(map);

// حساب المسافة
function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearbyHospitals(userLat, userLng) {
  const nearby = hospitals.filter(h => {
    const distance = getDistance(userLat, userLng, h.lat, h.lng);
    return distance <= 10;
  });

  if (!nearby.length) {
    alert("لا توجد مستشفيات قريبة في حدود 10 كم");
  } else {
    showHospitalsOnMap(nearby);
  }
}

function showHospitalsOnMap(hospitals) {
  hospitals.forEach(h => {
    new mapboxgl.Marker()
      .setLngLat([h.lng, h.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${h.name}</strong>`))
      .addTo(map);
  });
}

// إظهار موقع المستخدم
navigator.geolocation.getCurrentPosition(position => {
  const { latitude, longitude } = position.coords;
  findNearbyHospitals(latitude, longitude);
  new mapboxgl.Marker({ color: "blue" })
    .setLngLat([longitude, latitude])
    .setPopup(new mapboxgl.Popup().setHTML("📍 موقعك الحالي"))
    .addTo(map);
});

// فورم التواصل
const contactForm = document.getElementById("contactForm");
const contactSuccess = document.getElementById("contactSuccess");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    contactSuccess.classList.add("hidden");
    setTimeout(() => {
      contactSuccess.classList.remove("hidden");
      contactForm.reset();
    }, 300);
  });
}

// ✅ السلايدر للطلبات العاجلة
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("emergencySlider");
  const requests = JSON.parse(localStorage.getItem("emergencyRequests") || "[]");

  if (!slider) return;

  if (!requests.length) {
    slider.innerHTML = "<p>لا توجد طلبات حالياً</p>";
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
    slider.appendChild(card);
  });

  const scrollAmount = 300;
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  if (leftBtn && rightBtn) {
    leftBtn.onclick = () => {
      slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    };
    rightBtn.onclick = () => {
      slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };
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
