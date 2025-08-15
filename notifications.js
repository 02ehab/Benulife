import { supabase } from './supabase.js';

// -------------------------
// فتح وإغلاق القائمة الجانبية
// -------------------------
window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};
window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};

// -------------------------
// التحقق إذا المستخدم مستشفى
// -------------------------
function isUserHospital(userType) {
  return userType === "hospital" || userType === "bloodbank";
}

// -------------------------
// حساب المسافة بين نقطتين (كم)
// -------------------------
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// -------------------------
// إرسال إشعار للمستخدم
// -------------------------
function notify(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

// -------------------------
// التحقق من الطلبات القريبة وإرسال إشعارات
// -------------------------
function handleRequestNotification(req, userLocation, userType) {
  const requestLoc = req.location; // يجب أن يكون { lat, lng } في قاعدة البيانات
  if (!requestLoc) return;

  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    requestLoc.lat,
    requestLoc.lng
  );

  if (!isUserHospital(userType) && req.urgency === "high" && distance <= 10) {
    notify("🚨 طلب دم عاجل", `يوجد طلب ${req.bloodType} قريب منك في ${req.hospital}`);
  }

  if (isUserHospital(userType) && distance <= 10) {
    notify("🔔 طلب تبرع قريب", `يوجد طلب دم بالقرب من المستشفى: ${req.bloodType}`);
  }
}

// -------------------------
// تنفيذ بعد تحميل DOM
// -------------------------
document.addEventListener("DOMContentLoaded", async () => {
  if ("Notification" in window) Notification.requestPermission();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) return console.error(sessionError);
  if (!session || !session.user) return;

  const userId = session.user.id;

  const { data: userData, error } = await supabase
    .from("login")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !userData) return console.error("خطأ في جلب بيانات المستخدم:", error);

  const userType = userData.account_type || "";

  // تحديث واجهة Navbar حسب تسجيل الدخول

async function updateAuthUI(session) {
  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");
  const requestsLinkDesktop = document.getElementById("requestsLinkDesktop");
  const requestsLinkMobile = document.getElementById("requestsLinkMobile");

  try {
    if (session && session.user) {
      const userId = session.user.id;

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

      // جلب بيانات المستخدم من جدول login
      const { data: userData, error } = await supabase
        .from("login")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("خطأ في جلب بيانات المستخدم:", error);
        return;
      }

      if (userData) {
        console.log("User data loaded:", userData);
        const userType = userData.account_type || "";
        console.log("User type:", userType);
        
        const linkText =
          (userType === "hospital" || userType === "bloodbank")
            ? "طلبات المتبرعين"
            : "الطلبات العاجلة";
        const linkHref =
          (userType === "hospital" || userType === "bloodbank")
            ? "donate_card.html"
            : "emergency_card.html";

        console.log("Setting link:", linkText, "->", linkHref);

        if (requestsLinkDesktop) {
          requestsLinkDesktop.innerHTML = `<a href="${linkHref}">${linkText}</a>`;
          console.log("Updated desktop link");
        }
        if (requestsLinkMobile) {
          requestsLinkMobile.innerHTML = `<a href="${linkHref}">${linkText}</a>`;
          console.log("Updated mobile link");
        }
      } else {
        console.log("No user data found");
      }

    } else {
      // المستخدم غير مسجل
      if (authButtons) authButtons.style.display = "flex";
      if (sideAuthButtons) sideAuthButtons.style.display = "flex";
      if (profileLink) profileLink.style.display = "none";
      if (profileLinkMobile) profileLinkMobile.style.display = "none";

      if (requestsLinkDesktop) requestsLinkDesktop.innerHTML = "";
      if (requestsLinkMobile) requestsLinkMobile.innerHTML = "";
    }
  } catch (err) {
    console.error("حدث خطأ أثناء تحديث واجهة المستخدم:", err.message);
    if (authButtons) authButtons.style.display = "flex";
    if (sideAuthButtons) sideAuthButtons.style.display = "flex";
  }
}

  // الحصول على موقع المستخدم
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(pos => {
      const userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };

      // جلب جميع الطلبات الحالية وإرسال إشعارات
      supabase.from("emergencyRequests").select("*").then(({ data }) => {
        if (data && data.length) data.forEach(req => handleRequestNotification(req, userLocation, userType));
      });

      // الاشتراك في التحديثات الفورية (Realtime)
      supabase
        .channel('realtime-emergency')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergencyRequests' }, payload => {
          handleRequestNotification(payload.new, userLocation, userType);
        })
        .subscribe();
    });
  }
});

