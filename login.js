import { supabase } from './supabase.js';

function toggleAccountFields() {
  const accountType = document.getElementById("accountType").value;
  document.getElementById("donorFields").classList.toggle("hidden", accountType !== "donor");
  document.getElementById("hospitalFields").classList.toggle("hidden", accountType !== "hospital");
}

document.addEventListener("DOMContentLoaded", () => {
  const accountTypeSelect = document.getElementById("accountType");
  accountTypeSelect.addEventListener("change", toggleAccountFields);

  // تشغيلها مرة أول ما تفتح الصفحة
  toggleAccountFields();
});

// دوال التنقل بين النماذج
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

  // ربط أزرار التنقل
  document.getElementById("btn-login").addEventListener("click", showLogin);
  document.getElementById("btn-register").addEventListener("click", showRegister);

  // إنشاء حساب
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (!data.email || !data.password) {
      alert("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    });

    if (authError) {
      alert("خطأ في إنشاء الحساب: " + authError.message);
      return;
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{
        id: userId,
        account_type: data.accountType,
        name: data.name,
        phone: data.phone,
        city: data.city,
        blood_type: data.blood_type || null,
        last_donation_date: data.last_donation_date || null,
        diseases: data.diseases || null,
        hospital_name: data.hospital_name || null,
        license_number: data.license_number || null,
        contact_person: data.contact_person || null
      }]);

    if (profileError) {
      alert("تم إنشاء الحساب ولكن حدث خطأ في حفظ البيانات: " + profileError.message);
    } else {
      alert("تم التسجيل بنجاح! تحقق من بريدك الإلكتروني لتفعيل الحساب.");
      window.location.href = "index.html";
    }
  });

  // تسجيل الدخول
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("خطأ في تسجيل الدخول: " + error.message);
    } else {
      alert("تم تسجيل الدخول بنجاح!");
      window.location.href = "index.html";
    }
  });
});
