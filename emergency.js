window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}
window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

// تحويل عدد الساعات لنص واضح
function getTimeLeftText(hours) {
  return `خلال ${hours} ساعة${hours > 1 ? "ً" : ""}`;
}

document.getElementById("bloodRequestForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // جمع بيانات الطلب
  const requestData = {
    fullName: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    bloodType: document.getElementById("bloodType").value,
    city: document.getElementById("city").value,
    hospital: document.getElementById("hospital").value,
    urgency: document.getElementById("urgency").value,
    notes: document.getElementById("notes").value,
    timeLeftText: getTimeLeftText(document.getElementById("urgency").value)
  };

  // جلب الطلبات الحالية أو مصفوفة جديدة
  const existingRequests = JSON.parse(localStorage.getItem("emergencyRequests") || "[]");

  // إضافة الطلب الجديد
  existingRequests.push(requestData);

  // حفظ الطلبات في localStorage
  localStorage.setItem("emergencyRequests", JSON.stringify(existingRequests));

  // عرض رسالة النجاح ومسح الحقول
  document.getElementById("successMessage").classList.remove("hidden");
  this.reset();
});

// دالة مساعدة لتحويل الوقت لكتابة واضحة
function getTimeLeftText(hours) {
  return `خلال ${hours} ساعة${hours > 1 ? "ً" : ""}`;
}


// التصفية حسب الفصيلة والمدينة
function filterRequests() {
  const blood = document.getElementById("bloodFilter").value;
  const city = document.getElementById("cityFilter").value.trim();

  const filtered = allRequests.filter(req => {
    const matchBlood = blood ? req.bloodType === blood : true;
    const matchCity = city ? req.city.includes(city) : true;
    return matchBlood && matchCity;
  });

  renderRequests(filtered);
}

// ربط أحداث الفلترة
document.getElementById("bloodFilter").addEventListener("change", filterRequests);
document.getElementById("cityFilter").addEventListener("input", filterRequests);

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
