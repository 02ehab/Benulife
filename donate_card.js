import { supabase } from './supabase.js';

window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};
window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};

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

// عرض الطلبات مع دعم قبول الطلب
function renderRequests(requests, userType) {
  container.innerHTML = "";
  if (!requests.length) {
    container.innerHTML = "<p>لا توجد طلبات حالياً</p>";
    return;
  }

  requests.forEach((req, index) => {
    if (req.status === "accepted") return; // تجاهل المقبولة

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
      ${ (userType === "hospital" || userType === "bloodbank") ? 
        `<button class="accept-btn" data-id="${req.id}">قبول الطلب</button>` : 
        `<button onclick="alert('سيتم التواصل مع ${req.full_name}')">ساعد الآن</button>` 
      }
    `;
    container.appendChild(card);
  });

  // ربط أزرار "قبول الطلب"
  if (userType === "hospital" || userType === "bloodbank") {
    document.querySelectorAll(".accept-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const { error } = await supabase
          .from("emergency_requests")
          .update({ status: "accepted" })
          .eq("id", id);

        if (error) {
          alert("❌ حدث خطأ أثناء قبول الطلب.");
        } else {
          alert("✅ تم قبول الطلب بنجاح");
          loadAndRender(); // تحديث العرض بعد القبول
        }
      });
    });
  }
}

// فلترة الطلبات
function filterRequests(requests) {
  const blood = bloodFilter.value;
  const city = cityFilter.value.trim();

  return requests.filter(req => {
    const matchBlood = blood ? req.blood_type === blood : true;
    const matchCity = city ? req.city.includes(city) : true;
    return req.status !== "accepted" && matchBlood && matchCity;
  });
}

// تحميل البيانات وعرضها
async function loadAndRender() {
  const allRequests = await fetchRequests();
  const userType = localStorage.getItem("userType");
  renderRequests(filterRequests(allRequests), userType);
}

// ربط الفلاتر
bloodFilter.addEventListener("change", loadAndRender);
cityFilter.addEventListener("input", loadAndRender);

// 🔹 تغيير روابط الطلبات وكلمة "ملفي"
async function initPage() {
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
  placeholders.forEach(ph => { if (ph) ph.outerHTML = linkHTML; });

  // كلمة "ملفي"
  const { data: { session } } = await supabase.auth.getSession();
  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (session) {
    if (authButtons) authButtons.style.display = "none";
    if (sideAuthButtons) sideAuthButtons.style.display = "none";
    if (profileLink) { profileLink.style.display = "inline-block"; profileLink.textContent = "ملفي"; }
    if (profileLinkMobile) { profileLinkMobile.style.display = "inline-block"; profileLinkMobile.textContent = "ملفي"; }
  }

  // حماية الصفحة للمستشفى أو بنك الدم فقط
  if (userType !== "hospital" && userType !== "bloodbank") {
    alert("هذه الصفحة مخصصة للمستشفيات وبنوك الدم فقط.");
    window.location.href = "index.html";
  }
}

// بدء الصفحة
document.addEventListener("DOMContentLoaded", () => {
  initPage();
  loadAndRender();
});
