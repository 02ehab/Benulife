import { supabase } from './supabase.js';

function toggleAccountFields() {
  const accountType = document.getElementById("accountType").value;
  const donorFields = document.getElementById("donorFields");
  const hospitalFields = document.getElementById("hospitalFields");

  donorFields.classList.toggle("hidden", accountType !== "donor");
  hospitalFields.classList.toggle("hidden", accountType !== "hospital");

  const bloodTypeSelect = donorFields.querySelector('[name="blood_type"]');
  if (bloodTypeSelect) bloodTypeSelect.required = accountType === "donor";
}

function showMessage(element, message, isError = true) {
  element.style.color = isError ? "red" : "green";
  element.textContent = message;
  element.style.display = "block";
}

function validateRegisterData(data) {
  if (!data.email || !data.registerPassword) return "يرجى إدخال البريد الإلكتروني وكلمة المرور";
  if (!/\S+@\S+\.\S+/.test(data.email)) return "يرجى إدخال بريد إلكتروني صالح";
  if (data.registerPassword.length < 6) return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
  return null;
}

async function registerUser(data, registerError) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.registerPassword
    });
    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) throw new Error("لم يتم إنشاء الحساب بنجاح.");

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

document.addEventListener("DOMContentLoaded", async () => {
  // 🔹 تحقق إذا المستخدم مسجل دخول بالفعل
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.href = "index.html";
    return;
  }

  // 🔹 تفعيل إظهار الحقول عند تحميل الصفحة
  toggleAccountFields();

  // 🔹 عند تغيير نوع الحساب
  document.getElementById("accountType").addEventListener("change", toggleAccountFields);

  const registerError = document.getElementById("registerError");

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
});
