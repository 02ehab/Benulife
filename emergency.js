window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}
 document.getElementById("bloodRequestForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // استخراج البيانات
  const requestData = {
    fullName: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    bloodType: document.getElementById("bloodType").value,
    city: document.getElementById("city").value,
    hospital: document.getElementById("hospital").value,
    urgency: document.getElementById("urgency").value,
    notes: document.getElementById("notes").value
  };

  console.log("طلب دم جديد:", requestData);

  // إظهار رسالة النجاح
  document.getElementById("successMessage").classList.remove("hidden");

  // تفريغ الفورم
  this.reset();
});
