import { supabase } from './supabase.js';

// فتح وإغلاق القائمة الجانبية
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

// الحصول على موقع المستخدم
let userLat = null;
let userLng = null;
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude;
    userLng = pos.coords.longitude;
  });
}

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("bloodRequestForm");

  // 🔹 التحقق من تسجيل الدخول وعرض "ملفي"
  const { data: { session } } = await supabase.auth.getSession();
  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (session) {
    if (authButtons) authButtons.style.display = "none";
    if (sideAuthButtons) sideAuthButtons.style.display = "none";
    if (profileLink) {
      profileLink.style.display = "inline-block";
      profileLink.textContent = "ملفي";
    }
    if (profileLinkMobile) {
      profileLinkMobile.style.display = "inline-block";
      profileLinkMobile.textContent = "ملفي";
    }
  }

  // 🔹 تغيير روابط الطلبات حسب نوع المستخدم
  const userType = localStorage.getItem("userType"); // "donor", "hospital", "bloodbank"
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

  // التعامل مع الفورم
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const requestData = {
        fullName: document.getElementById("fullName").value,
        phone: document.getElementById("phone").value,
        bloodType: document.getElementById("bloodType").value,
        city: document.getElementById("city").value,
        hospital: document.getElementById("hospital").value,
        urgency: parseInt(document.getElementById("urgency").value),
        notes: document.getElementById("notes").value,
        lat: userLat,
        lng: userLng,
        createdAt: new Date().toISOString(),
        timeLeftText: getTimeLeftText(parseInt(document.getElementById("urgency").value))
      };

      // حفظ الطلب في Supabase
      const { data, error } = await supabase
        .from("emergency_requests")
        .insert([{
          full_name: requestData.fullName,
          phone: requestData.phone,
          blood_type: requestData.bloodType,
          city: requestData.city,
          hospital: requestData.hospital,
          urgency: requestData.urgency,
          notes: requestData.notes,
          lat: requestData.lat,
          lng: requestData.lng,
          created_at: requestData.createdAt
        }]);

      if (error) {
        console.error("❌ خطأ في حفظ الطلب:", error);
        alert("حصل خطأ أثناء إرسال الطلب.");
      } else {
        console.log("✅ تم الحفظ:", data);
        document.getElementById("successMessage").classList.remove("hidden");
        form.reset();

        // تنبيهات حسب قرب المستخدم ونوع الحساب
        if (requestData.lat && requestData.lng) {
          const distance = getDistanceFromLatLonInKm(
            userLat,
            userLng,
            requestData.lat,
            requestData.lng
          );
          if (distance < 10 && (userType === "hospital" || userType === "bloodbank")) {
            alert(`🚑 يوجد طلب تبرع قريب (${Math.round(distance)} كم) - فصيلة ${requestData.bloodType}`);
          }
        }

        if (requestData.urgency <= 2 && userType === "donor") {
          alert("🔴 طلب تبرع عاجل جدًا متاح الآن. يرجى المساعدة إذا كنت قريبًا.");
        }
      }
    });
  }
});
