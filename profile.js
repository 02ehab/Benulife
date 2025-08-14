import { supabase } from './supabase.js';

// تبديل الحقول حسب نوع الحساب
function toggleAccountFields() {
  const accountType = document.getElementById("accountType").value;
  const donorFields = document.getElementById("donorFields");
  const hospitalFields = document.getElementById("hospitalFields");

  donorFields.classList.toggle("hidden", accountType !== "donor");
  hospitalFields.classList.toggle("hidden", accountType !== "hospital");

  const bloodTypeSelect = donorFields.querySelector('[name="blood_type"]');
  bloodTypeSelect.required = accountType === "donor";
}

document.addEventListener("DOMContentLoaded", () => {
  toggleAccountFields();

  document.getElementById("accountType").addEventListener("change", toggleAccountFields);

  // أزرار التنقل بين النماذج
  document.getElementById("btn-login").addEventListener("click", () => {
    document.getElementById("loginForm").classList.add("active");
    document.getElementById("registerForm").classList.remove("active");
    document.getElementById("btn-indicator").style.right = "0%";
  });

  document.getElementById("btn-register").addEventListener("click", () => {
    document.getElementById("loginForm").classList.remove("active");
    document.getElementById("registerForm").classList.add("active");
    document.getElementById("btn-indicator").style.right = "50%";
  });

  // عناصر لعرض رسائل الخطأ
  const loginError = document.getElementById("loginError");
  let registerError = document.getElementById("registerError");
  if (!registerError) {
    registerError = document.createElement("p");
    registerError.id = "registerError";
    registerError.style.color = "red";
    registerError.style.display = "none";
    document.getElementById("registerForm").prepend(registerError);
  }

  // إنشاء حساب
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    registerError.style.display = "none";

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (!data.email || !data.registerPassword) {
      registerError.textContent = "يرجى إدخال البريد الإلكتروني وكلمة المرور";
      registerError.style.display = "block";
      return;
    }

    if (!/\S+@\S+\.\S+/.test(data.email)) {
      registerError.textContent = "يرجى إدخال بريد إلكتروني صالح";
      registerError.style.display = "block";
      return;
    }

    if (data.registerPassword.length < 6) {
      registerError.textContent = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
      registerError.style.display = "block";
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.registerPassword
    });

    if (authError) {
      registerError.textContent = authError.status === 409
        ? "هذا البريد مسجل بالفعل."
        : "خطأ في إنشاء الحساب: " + authError.message;
      registerError.style.display = "block";
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      registerError.textContent = "لم يتم إنشاء الحساب بنجاح.";
      registerError.style.display = "block";
      return;
    }

    const { error: profileError } = await supabase
      .from("login")
      .insert([{
        id: userId,
        account_type: data.accountType,
        name: data.name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        blood_type: data.blood_type || null,
        last_donation_date: data.last_donation_date || null,
        diseases: data.diseases || null,
        hospital_name: data.hospital_name || null,
        license_number: data.license_number || null,
        contact_person: data.contact_person || null
      }]);

    if (profileError) {
      registerError.textContent = "تم إنشاء الحساب ولكن حدث خطأ في حفظ البيانات: " + profileError.message;
      registerError.style.display = "block";
    } else {
      localStorage.setItem("userType", data.accountType);
      registerError.style.color = "green";
      registerError.textContent = "تم التسجيل بنجاح! جاري التحويل...";
      registerError.style.display = "block";
      setTimeout(() => { window.location.href = "index.html"; }, 2000);
    }
  });

  // تسجيل الدخول
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.style.display = "none";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      loginError.textContent = "يرجى إدخال البريد الإلكتروني وكلمة المرور";
      loginError.style.display = "block";
      return;
    }

    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      loginError.textContent = "خطأ في تسجيل الدخول: " + error.message;
      loginError.style.display = "block";
    } else {
      // جلب نوع المستخدم من الجدول login
      const { data: userData, error: userError } = await supabase
        .from("login")
        .select("account_type")
        .eq("id", loginData.user.id)
        .single();

      if (!userError) localStorage.setItem("userType", userData.account_type);

      loginError.style.color = "green";
      loginError.textContent = "تم تسجيل الدخول بنجاح! جاري التحويل...";
      loginError.style.display = "block";
      setTimeout(() => { window.location.href = "index.html"; }, 1500);
    }
  });
});
