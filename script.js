window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

// توكن Mapbox الخاص بك
mapboxgl.accessToken = 'pk.eyJ1IjoiZWhhYjEwIiwiYSI6ImNtY3ZsaXZucDBidzUyaXM4cWluZjcxMzYifQ.EUIFT090mttpMoVNzUrYhg';

// محاولة تحديد موقع المستخدم
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userCoords = [position.coords.longitude, position.coords.latitude];
      initMap(userCoords);
    },
    () => {
      // لو المستخدم رفض أو فيه مشكلة
      initMap([46.6753, 24.7136]); // الرياض
    }
  );
} else {
  initMap([46.6753, 24.7136]); // المتصفح لا يدعم geolocation
}

// إنشاء الخريطة
function initMap(centerCoords) {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: centerCoords,
    zoom: 12
  });

  // Marker على موقع المستخدم
  new mapboxgl.Marker({ color: '#4285f4' })
    .setLngLat(centerCoords)
    .setPopup(new mapboxgl.Popup().setText('موقعك الحالي'))
    .addTo(map);

  // بيانات لحالات تبرع قريبة
  const cases = [
    {
      coords: [centerCoords[0] + 0.01, centerCoords[1] + 0.01],
      title: "مستشفى قريب - A+",
      info: "مريض بحاجة عاجلة لدم A+"
    },
    {
      coords: [centerCoords[0] - 0.015, centerCoords[1] - 0.01],
      title: "بنك دم - O-",
      info: "نقص حاد في O- بالمستودع"
    }
  ];

  cases.forEach(c => {
    const marker = new mapboxgl.Marker({ color: 'red' })
      .setLngLat(c.coords)
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${c.title}</strong><br>${c.info}`))
      .addTo(map);
  });
}}

//تواصل
const contactForm = document.getElementById("contactForm");
const contactSuccess = document.getElementById("contactSuccess");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // إخفاء الرسالة مؤقتاً لو ظاهرة
    contactSuccess.classList.add("hidden");

    // عرض الرسالة بعد الإرسال
    setTimeout(() => {
      contactSuccess.classList.remove("hidden");
      contactForm.reset();
    }, 300); // تأخير بسيط شكلي
  });
}

