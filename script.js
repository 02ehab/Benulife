import { supabase } from './supabase.js';


// فتح وإغلاق القائمة الجانبية

window.openMenu = () => {
  const menu = document.getElementById("sideMenu");
  if (menu) menu.classList.add("open");
};
window.closeMenu = () => {
  const menu = document.getElementById("sideMenu");
  if (menu) menu.classList.remove("open");
};


// Mapbox: إعداد الخريطة وعرض المستشفيات القريبة

mapboxgl.accessToken = 'pk.eyJ1IjoiZWhhYjEwIiwiYSI6ImNtY3ZsaXZucDBidzUyaXM4cWluZjcxMzYifQ.EUIFT090mttpMoVNzUrYhg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [39.8579, 21.3891],
  zoom: 12
});
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
  .setLngLat([39.8579, 21.3891])
  .setPopup(new mapboxgl.Popup().setHTML("<strong>موقع التبرع</strong>"))
  .addTo(map);

function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = x => x * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function showHospitalsOnMap(hospitals) {
  hospitals.forEach(h => {
    new mapboxgl.Marker()
      .setLngLat([h.lng, h.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${h.name}</strong>`))
      .addTo(map);
  });
}

function findNearbyHospitals(userLat, userLng) {
  const hospitals = window.hospitals || [];
  if (!hospitals.length) return;
  const nearby = hospitals.filter(h => getDistance(userLat, userLng, h.lat, h.lng) <= 10);
  if (!nearby.length) {
    alert("لا توجد مستشفيات قريبة في حدود 10 كم");
  } else {
    showHospitalsOnMap(nearby);
  }
}

function showUserLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    findNearbyHospitals(latitude, longitude);
    new mapboxgl.Marker({ color: "blue" })
      .setLngLat([longitude, latitude])
      .setPopup(new mapboxgl.Popup().setHTML("📍 موقعك الحالي"))
      .addTo(map);
  }, err => {
    console.warn("تم رفض الوصول لموقع المستخدم أو حدث خطأ:", err.message);
  });
}


// فورم التواصل

function setupContactForm() {
  const contactForm = document.getElementById("contactForm");
  const contactSuccess = document.getElementById("contactSuccess");

  if (contactForm && contactSuccess) {
    contactForm.addEventListener("submit", e => {
      e.preventDefault();
      contactSuccess.classList.add("hidden");
      setTimeout(() => {
        contactSuccess.classList.remove("hidden");
        contactForm.reset();
      }, 300);
    });
  }
}



// --- السلايدر للطلبات العاجلة (Realtime + Supabase) ---
async function setupEmergencySlider() {
  const slider = document.getElementById("emergencySlider");
  if (!slider) return;

  // جلب الطلبات من Supabase
  const { data: requests, error } = await supabase
    .from("emergency_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    slider.innerHTML = "<p>حدث خطأ أثناء تحميل الطلبات.</p>";
    console.error(error);
    return;
  }

  if (!requests || requests.length === 0) {
    slider.innerHTML = "<p>لا توجد طلبات حالياً</p>";
    return;
  }

  slider.innerHTML = "";

  requests.forEach(req => {
    const card = document.createElement("div");
    card.className = "request-card";
    card.innerHTML = `
      <div class="blood-type">${req.blood_type}</div>
      <div class="request-info"><strong>الاسم:</strong> ${req.full_name}</div>
      <div class="request-info"><strong>المدينة:</strong> ${req.city}</div>
      <div class="timer">⏳ ${
        req.urgency === 1 ? "خلال ساعة واحدة" :
        req.urgency === 2 ? "خلال ساعتين" :
        req.urgency >= 3 && req.urgency <= 10 ? `خلال ${req.urgency} ساعات` :
        `خلال ${req.urgency} ساعة`
      }</div>
      <button class="help-btn">ساعد الآن</button>
    `;

    const helpBtn = card.querySelector(".help-btn");
    helpBtn.addEventListener("click", async () => {
      if (!req.user_id) {
        alert("لا يمكن إرسال الإشعار، معرف صاحب الطلب غير موجود.");
        return;
      }

      try {
        const { error } = await supabase.from("notifications").insert([{
          user_id: req.user_id,                      // المستلم
          title: `تمت المساعدة على طلبك`,            // عنوان الإشعار
          body: `قام شخص بعرض المساعدة لطلبك (${req.blood_type || "-"})`, // نص الإشعار
          related_request: req.id,                   // ربط بالطلب
          is_read: false,                             // افتراضي: غير مقروء
          created_at: new Date()
        }]);

        if (error) throw error;

        alert("✅ تم إرسال إشعار لصاحب الطلب بأنه تمت المساعدة.");
        card.remove();
      } catch (err) {
        console.error("❌ خطأ أثناء إرسال الإشعار:", err.message);
        alert("حدث خطأ أثناء إرسال الإشعار. تحقق من console.");
      }
    });

    slider.appendChild(card);
  });

  const scrollAmount = 300;
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  if (leftBtn) leftBtn.onclick = () => slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  if (rightBtn) rightBtn.onclick = () => slider.scrollBy({ left: scrollAmount, behavior: "smooth" });

  // الاشتراك في التحديثات الفورية
  supabase
    .channel('realtime-emergency')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_requests' }, payload => {
      const req = payload.new;
      const card = document.createElement("div");
      card.className = "request-card";
      card.innerHTML = `
        <div class="blood-type">${req.blood_type}</div>
        <div class="request-info"><strong>الاسم:</strong> ${req.full_name}</div>
        <div class="request-info"><strong>المدينة:</strong> ${req.city}</div>
        <div class="timer">⏳ ${req.urgency} ساعات</div>
        <button class="help-btn">ساعد الآن</button>
      `;
      const helpBtn = card.querySelector(".help-btn");
      helpBtn.addEventListener("click", async () => {
        const { error } = await supabase.from("notifications").insert([
          {
            request_id: req.id,
            receiver_id: req.user_id,
            message: `قام شخص بعرض المساعدة لطلبك (${req.blood_type})`,
            created_at: new Date()
          }
        ]);
        if (!error) {
          alert("✅ تم إرسال إشعار لصاحب الطلب بأنه تمت المساعدة.");
          card.remove();
        }
      });
      slider.prepend(card);
    })
    .subscribe();
}




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
// تحميل الهيدر

async function loadHeader() {
  try {
    const { data, error } = await supabase
      .from('homepage')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('خطأ في جلب البيانات:', error.message);
      return;
    }

    if (!data) {
      console.warn('لا توجد بيانات لعرضها.');
      return;
    }

    const headerTitleEl = document.getElementById('headerTitle');
    const headerImageEl = document.getElementById('headerImage');

    if (headerTitleEl) headerTitleEl.textContent = data.title || 'بدون عنوان';
    if (headerImageEl) headerImageEl.src = data.image_url || 'placeholder.jpg';
  } catch (err) {
    console.error('خطأ غير متوقع:', err);
  }
}


// --- تنفيذ كل الوظائف بعد تحميل DOM ---
document.addEventListener("DOMContentLoaded", async () => {
  showUserLocation();
  setupContactForm();
  await setupEmergencySlider();
  supabase.auth.getSession().then(({ data: { session } }) => updateAuthUI(session));
  supabase.auth.onAuthStateChange((event, session) => updateAuthUI(session));
});

  // 🔹 تحقق من تسجيل الدخول عبر Supabase وعرض الملف الشخصي
document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabase.auth.getSession();

  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (session) {
    const userId = session.user.id;
    const { data: profile, error } = await supabase
      .from('login')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      // إخفاء أزرار تسجيل الدخول / إنشاء حساب
      if (authButtons) authButtons.style.display = "none";
      if (sideAuthButtons) sideAuthButtons.style.display = "none";

      // إظهار كلمة "ملفي"
      if (profileLink) {
        profileLink.style.display = "inline-block";
        profileLink.textContent = "ملفي";
      }
      if (profileLinkMobile) {
        profileLinkMobile.style.display = "inline-block";
        profileLinkMobile.textContent = "ملفي";
      }
    }
  }
});

//stats
async function loadStats() {
  const { data, error } = await supabase
    .from("stats")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1); // آخر صف فقط

  if (error) {
    console.error("خطأ في جلب الإحصائيات:", error.message);
    return;
  }

  if (data && data.length > 0) {
    const stats = data[0];
    animateCounter(document.getElementById("activeDonors"), stats.active_donors);
    animateCounter(document.getElementById("hospitals"), stats.hospitals);
    animateCounter(document.getElementById("unitsProvided"), stats.units_provided);
  }
}

document.addEventListener("DOMContentLoaded", loadStats);

// تحريك العدادات عند الظهور
function animateCounter(el, target) {
  if (!el) return;
  const start = 0;
  const duration = 1000;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(progress * (target - start) + start);
    el.textContent = `+${value}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ملاحظة: يمكننا لاحقاً استخدام IntersectionObserver لتفعيل العد فقط عند ظهور القسم

//realtime updates
supabase
  .channel("stats-changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "stats" }, (payload) => {
    console.log("تم تحديث الإحصائيات:", payload.new);
    document.getElementById("donorsCount").textContent = `+${payload.new.donors_count}`;
    document.getElementById("hospitalsCount").textContent = `+${payload.new.hospitals_count}`;
    document.getElementById("bloodUnits").textContent = `+${payload.new.blood_units}`;
  })
  .subscribe();

//المشاركة  
/*   
document.getElementById("shareBtn").addEventListener("click", async () => {
  const pageUrl = window.location.href;
  const pageTitle = document.title;

  if (navigator.share) {
    // ✅ لو الجهاز بيدعم Web Share API (موبايل مثلا)
    try {
      await navigator.share({
        title: pageTitle,
        url: pageUrl
      });
    } catch (err) {
      console.log("تم إلغاء المشاركة");
    }
  } else {
    // ❌ لو المتصفح مش بيدعمها → ينسخ الرابط تلقائي
    navigator.clipboard.writeText(pageUrl);
    alert("تم نسخ رابط الصفحة! 📋");
  }
});
*/
