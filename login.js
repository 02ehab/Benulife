// عرض الحقول حسب نوع الحساب المختار
function toggleAccountFields() {
  const accountType = document.getElementById("accountType").value;
  const donorFields = document.getElementById("donorFields");
  const hospitalFields = document.getElementById("hospitalFields");

  if (accountType === "donor") {
    donorFields.classList.remove("hidden");
    hospitalFields.classList.add("hidden");
    // اجعل الحقول المطلوبة للمتبرع مطلوبة
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

// عند تحميل الصفحة، اربط الأحداث
document.addEventListener("DOMContentLoaded", () => {
  // عرض الحقول الافتراضي
  toggleAccountFields();

  // فورم التسجيل
  const registerForm = document.getElementById("registerForm");
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(registerForm);
    const accountType = formData.get("accountType") || formData.get("accountType");
    if (!formData.get("accountType")) {
      alert("يرجى اختيار نوع الحساب");
      return;
    }

    // مثال: تخزين بيانات المستخدم في localStorage (غير آمن، فقط للتجربة)
    const userData = {};
    for (let [key, value] of formData.entries()) {
      userData[key] = value;
    }
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", formData.get("accountType"));

    alert("تم التسجيل بنجاح!");
    window.location.href = "index.html";
  });

  // فورم تسجيل الدخول
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    // استرجع البيانات المخزنة (تجريبي)
    const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (formData.get("email") === savedUserData.email && formData.get("password") === savedUserData.password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", savedUserData.accountType || "donor");
      alert("تم تسجيل الدخول بنجاح!");
      window.location.href = "index.html";
    } else {
      alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  });
});
