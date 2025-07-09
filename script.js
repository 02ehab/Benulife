window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

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
  const nearby = hospitals.filter(hospital => {
    const distance = getDistance(userLat, userLng, hospital.lat, hospital.lng);
    return distance <= 10;
  });

  if (nearby.length === 0) {
    alert("لا توجد مستشفيات قريبة في حدود 10 كم");
  } else {
    console.log("أقرب المستشفيات:", nearby);
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

// مثال لتفعيل البحث تلقائيًا
navigator.geolocation.getCurrentPosition(position => {
  const { latitude, longitude } = position.coords;
  findNearbyHospitals(latitude, longitude);

  new mapboxgl.Marker({ color: "blue" })
    .setLngLat([longitude, latitude])
    .setPopup(new mapboxgl.Popup().setHTML("📍 موقعك الحالي"))
    .addTo(map);
});


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
