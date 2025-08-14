import { supabase } from './supabase.js';

window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};
window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};

// العناصر
const container = document.getElementById("requestsContainer");
const bloodFilter = document.getElementById("bloodFilter");
const cityFilter = document.getElementById("cityFilter");

// 🔹 جلب الطلبات من Supabase
async function fetchRequests() {
  const { data, error } = await supabase
    .from("emergency_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ خطأ في جلب الطلبات:", error);
    container.innerHTML = "<p>حدث خطأ أثناء تحميل الطلبات.</p>";
    return [];
  }
  return data || [];
}

// عرض الطلبات في الصفحة
function renderRequests(requests) {
  container.innerHTML = "";
  if (!requests.length) {
    container.innerHTML = "<p>لا توجد طلبات متاحة حالياً.</p>";
    return;
  }

  requests.forEach(req => {
    const card = document.createElement("div");
    card.className = "request-card";
    const timeText = req.urgency === 1 ? "خلال ساعة واحدة" :
                     req.urgency === 2 ? "خلال ساعتين" :
                     req.urgency >= 3 && req.urgency <= 10 ? `خلال ${req.urgency} ساعات` :
                     `خلال ${req.urgency} ساعة`;

    card.innerHTML = `
      <div class="blood-type">${req.blood_type}</div>
      <div class="request-info"><strong>الاسم:</strong> ${req.full_name}</div>
      <div class="request-info"><strong>المدينة:</strong> ${req.city}</div>
      <div class="timer">⏳ ${timeText}</div>
      <button onclick="alert('سيتم التواصل مع ${req.full_name}')">ساعد الآن</button>
    `;
    container.appendChild(card);
  });
}

// فلترة الطلبات حسب الفصيلة والمدينة
async function filterRequests() {
  const allRequests = await fetchRequests();
  const blood = bloodFilter.value;
  const city = cityFilter.value.trim();

  const filtered = allRequests.filter(req => {
    const matchBlood = blood ? req.blood_type === blood : true;
    const matchCity = city ? req.city.includes(city) : true;
    return matchBlood && matchCity;
  });

  renderRequests(filtered);
}

// ربط الفلاتر
if (bloodFilter) bloodFilter.addEventListener("change", filterRequests);
if (cityFilter) cityFilter.addEventListener("input", filterRequests);

// 🔹 عرض الطلبات عند التحميل
document.addEventListener("DOMContentLoaded", async () => {
  const requests = await fetchRequests();
  renderRequests(requests);

  // تغيير روابط الصفحة حسب نوع المستخدم
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

  // عرض كلمة "ملفي" إذا المستخدم مسجل دخول
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
});
