import { supabase } from './supabase.js';

function showMessage(element, message, isError = true) {
  element.style.color = isError ? "red" : "green";
  element.textContent = message;
  element.style.display = "block";
}

async function loginUser(email, password, loginError) {
  try {
    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const userId = loginData.user.id;

    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (userError) throw userError;
    if (!userData) {
      showMessage(loginError, "لم يتم العثور على بيانات المستخدم.");
      return;
    }

    localStorage.setItem("userType", userData.account_type);
    showMessage(loginError, "تم تسجيل الدخول بنجاح! جاري التحويل...", false);
    setTimeout(() => window.location.href = "index.html", 1500);

  } catch (err) {
    showMessage(loginError, err.message || "حدث خطأ أثناء تسجيل الدخول.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // 🔹 تحقق إذا المستخدم مسجل دخول بالفعل
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.href = "index.html";
    return;
  }

  const loginError = document.getElementById("loginError");

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
