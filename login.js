// عرض الحقول حسب نوع الحساب المختار
function toggleAccountFields() {
  const accountType = document.getElementById("accountType").value;
  const donorFields = document.getElementById("donorFields");
  const hospitalFields = document.getElementById("hospitalFields");

  if (accountType === "donor") {
    donorFields.classList.remove("hidden");
    hospitalFields.classList.add("hidden");
    donorFields.querySelectorAll("select, input").forEach(input => input.required = true);
    hospitalFields.querySelectorAll("input").forEach(input => input.required = false);
  } else if (accountType === "hospital") {
    hospitalFields.classList.remove("hidden");
    donorFields.classList.add("hidden");
    hospitalFields.querySelectorAll("input").forEach(input => input.required = true);
    donorFields.querySelectorAll("select, input").forEach(input => input.required = false);
  } else {
    donorFields.classList.add("hidden");
    hospitalFields.classList.add("hidden");
    donorFields.querySelectorAll("select, input").forEach(input => input.required = false);
    hospitalFields.querySelectorAll("input").forEach(input => input.required = false);
  }
}

// التبديل بين فورم تسجيل الدخول وإنشاء حساب
function showLogin() {
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("registerForm").classList.remove("active");
  document.getElementById("btn-indicator").style.right = "0%";
}

function showRegister() {
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("registerForm").classList.add("active");
  document.getElementById("btn-indicator").style.right = "50%";
}

document.addEventListener("DOMContentLoaded", () => {
  toggleAccountFields();

  // التسجيل
  const registerForm = document.getElementById("registerForm");
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(registerForm);
    const phone = formData.get("phone");
    const accountType = formData.get("accountType");

    if (!phone || !accountType) {
      alert("يرجى إدخال رقم الموبايل واختيار نوع الحساب");
      return;
    }

    const userData = {};
    for (let [key, value] of formData.entries()) {
      userData[key] = value;
    }

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    // تأكد من عدم وجود مستخدم بنفس الرقم
    if (users.some(u => u.phone === phone)) {
      alert("هذا الرقم مسجل مسبقًا. قم بتسجيل الدخول.");
      return;
    }

    users.push(userData);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedInPhone", phone);
    localStorage.setItem("userType", accountType);

    alert("تم التسجيل بنجاح!");
    window.location.href = "index.html";
  });

  // تسجيل الدخول برقم الجوال فقط
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const phone = loginForm.querySelector("#loginPhone").value.trim();
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const user = users.find(u => u.phone === phone);

    if (user) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loggedInPhone", user.phone);
      localStorage.setItem("userType", user.accountType || "donor");
      alert("تم تسجيل الدخول بنجاح!");
      window.location.href = "index.html";
    } else {
      alert("رقم الموبايل غير مسجل، يرجى إنشاء حساب أولًا.");
    }
  });
});
