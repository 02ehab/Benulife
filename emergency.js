window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};
window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};

// تحويل عدد الساعات لنص واضح
function getTimeLeftText(hours) {
  if (hours == 1) return "خلال ساعة واحدة";
  if (hours == 2) return "خلال ساعتين";
  if (hours >= 3 && hours <= 10) return `خلال ${hours} ساعات`;
  return `خلال ${hours} ساعة`;
}

// حساب المسافة بين نقطتين جغرافيًا (كيلومتر)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

let userLat = null;
let userLng = null;
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude;
    userLng = pos.coords.longitude;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("bloodRequestForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const requestData = {
        fullName: document.getElementById("fullName").value,
        phone: document.getElementById("phone").value,
        bloodType: document.getElementById("bloodType").value,
        city: document.getElementById("city").value,
        hospital: document.getElementById("hospital").value,
        urgency: document.getElementById("urgency").value,
        notes: document.getElementById("notes").value,
        timeLeftText: getTimeLeftText(document.getElementById("urgency").value),
        location: userLat && userLng ? { lat: userLat, lng: userLng } : null,
        createdAt: new Date().toISOString()
      };

      const existingRequests = JSON.parse(localStorage.getItem("emergencyRequests") || "[]");
      existingRequests.push(requestData);
      localStorage.setItem("emergencyRequests", JSON.stringify(existingRequests));

      document.getElementById("successMessage").classList.remove("hidden");
      form.reset();

      const userType = localStorage.getItem("userType");
      // تنبيهات حسب نوع المستخدم
      if (requestData.location && userLat && userLng) {
        const distance = getDistanceFromLatLonInKm(
          userLat,
          userLng,
          requestData.location.lat,
          requestData.location.lng
        );
        if (distance < 10 && (userType === "hospital" || userType === "bloodbank")) {
          alert(`🚑 يوجد طلب تبرع قريب (${Math.round(distance)} كم) - فصيلة ${requestData.bloodType}`);
        }
      }

      if (requestData.urgency <= 2 && userType === "donor") {
        alert("🔴 طلب تبرع عاجل جدًا متاح الآن. يرجى المساعدة إذا كنت قريبًا.");
      }
    });
  }

  // فلترة الطلبات حسب الفصيلة والمدينة
  const bloodFilter = document.getElementById("bloodFilter");
  const cityFilter = document.getElementById("cityFilter");

  if (bloodFilter && cityFilter) {
    bloodFilter.addEventListener("change", filterRequests);
    cityFilter.addEventListener("input", filterRequests);
  }

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

  // تغيير روابط القائمة حسب نوع المستخدم
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
    if (placeholder) placeholder.outerHTML = linkHTML;
  });

  // عرض رابط "ملفي" حسب حالة الدخول
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (isLoggedIn) {
    const authButtons = document.getElementById("authButtons");
    const sideAuthButtons = document.getElementById("sideAuthButtons");
    const profileLink = document.getElementById("profileLink");
    const profileLinkMobile = document.getElementById("profileLinkMobile");

    if (authButtons) authButtons.style.display = "none";
    if (sideAuthButtons) sideAuthButtons.style.display = "none";
    if (profileLink) profileLink.style.display = "inline-block";
    if (profileLinkMobile) profileLinkMobile.style.display = "inline-block";
  }
});
