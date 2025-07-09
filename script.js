window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

//map
window.initMap = function () {
  // إذا المتصفح يدعم تحديد الموقع
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        createMap(userLocation);
      },
      () => {
        // إذا رفض المستخدم أو حدث خطأ
        const fallbackLocation = { lat: 24.7136, lng: 46.6753 }; // الرياض
        createMap(fallbackLocation);
      }
    );
  } else {
    // في حال المتصفح لا يدعم geolocation
    const fallbackLocation = { lat: 24.7136, lng: 46.6753 };
    createMap(fallbackLocation);
  }
};

// دالة إنشاء الخريطة
function createMap(center) {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: center,
  });

  // ضع علامة على موقع المستخدم
  new google.maps.Marker({
    position: center,
    map: map,
    title: "موقعك الحالي",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white"
    }
  });

  // حالات تبرع قريبة (مثال ثابت)
  const cases = [
    {
      position: { lat: center.lat + 0.01, lng: center.lng + 0.01 },
      title: "مستشفى قريب - A+",
      info: "مريض بحاجة عاجلة لدم A+"
    },
    {
      position: { lat: center.lat - 0.015, lng: center.lng - 0.01 },
      title: "بنك دم - O-",
      info: "نقص حاد في O- بالمستودع"
    }
  ];

  // عرض العلامات
  cases.forEach((c) => {
    const marker = new google.maps.Marker({
      position: c.position,
      map,
      title: c.title,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<strong>${c.title}</strong><br>${c.info}`,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}

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

// توكن Mapbox الخاص بك
mapboxgl.accessToken = 'pk.eyJ1IjoiZWhhYjEwIiwiYSI6ImNtY3ZsaXZucDBidzUyaXM4cWluZjcxMzYifQ.EUIFT090mttpMoVNzUrYhg';

// إنشاء الخريطة
const map = new mapboxgl.Map({
  container: 'map', // ID العنصر اللي هتظهر فيه الخريطة
  style: 'mapbox://styles/mapbox/streets-v12', // نوع الخريطة
  center: [31.2357, 30.0444], // خط الطول والعرض (هنا: القاهرة)
  zoom: 10
});

// إضافة Marker على الخريطة
const marker = new mapboxgl.Marker()
  .setLngLat([31.2357, 30.0444])
  .addTo(map);