import { supabase } from './supabase.js';

// --- تبديل الحقول حسب نوع الحساب ---
function toggleAccountFields() {
  const accountType = document.getElementById("accountType").value;
  const donorFields = document.getElementById("donorFields");
  const hospitalFields = document.getElementById("hospitalFields");

  donorFields.classList.toggle("hidden", accountType !== "donor");
  hospitalFields.classList.toggle("hidden", accountType !== "hospital");

  const bloodTypeSelect = donorFields.querySelector('[name="blood_type"]');
  if (bloodTypeSelect) bloodTypeSelect.required = accountType === "donor";
}

// --- عرض رسالة خطأ أو نجاح ---
function showMessage(element, message, isError = true) {
  element.style.color = isError ? "red" : "green";
  element.textContent = message;
  element.style.display = "block";
}

// --- التحقق من صحة البيانات ---
function validateRegisterData(data) {
  if (!data.email || !data.registerPassword) return "يرجى إدخال البريد الإلكتروني وكلمة المرور";
  if (!/\S+@\S+\.\S+/.test(data.email)) return "يرجى إدخال بريد إلكتروني صالح";
  if (data.registerPassword.length < 6) return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
  return null;
}

// --- إنشاء حساب جديد ---
async function registerUser(data, registerError) {
  try {
    // تسجيل في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.registerPassword
    });
    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) throw new Error("لم يتم إنشاء الحساب بنجاح.");

    // حفظ بيانات المستخدم في جدول profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{
        user_id: userId,
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
    if (profileError) throw profileError;

    localStorage.setItem("userType", data.accountType);
    showMessage(registerError, "تم التسجيل بنجاح! جاري التحويل...", false);
    setTimeout(() => window.location.href = "index.html", 2000);

  } catch (err) {
    showMessage(registerError, err.message || "حدث خطأ أثناء التسجيل.");
  }
}

// --- تسجيل الدخول ---
async function loginUser(email, password, loginError) {
  try {
    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const userId = loginData.user.id;

    // جلب بيانات المستخدم من جدول profiles
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // ← استخدام maybeSingle لتجنب أخطاء JSON
    if (userError) throw userError;

    if (!userData) {
      showMessage(loginError, "لم يتم العثور على بيانات المستخدم.");
      return;
    }

    localStorage.setItem("userType", userData.account_type);
    showMessage(loginError, "تم تسجيل الدخول بنجاح! جاري التحويل...", false);
    setTimeout(() => window.location.href = "profile.html", 1500);

  } catch (err) {
    showMessage(loginError, err.message || "حدث خطأ أثناء تسجيل الدخول.");
  }
}

// --- تحميل الصفحة ---
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

  // عناصر عرض الرسائل
  const loginError = document.getElementById("loginError");
  let registerError = document.getElementById("registerError");
  if (!registerError) {
    registerError = document.createElement("p");
    registerError.id = "registerError";
    registerError.style.display = "none";
    document.getElementById("registerForm").prepend(registerError);
  }

  // حدث تسجيل الحساب
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    registerError.style.display = "none";

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const validationError = validateRegisterData(data);
    if (validationError) {
      showMessage(registerError, validationError);
      return;
    }

    await registerUser(data, registerError);
  });

  // حدث تسجيل الدخول
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.style.display = "none";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      showMessage(loginError, "يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    await loginUser(email, password, loginError);
  });
});
