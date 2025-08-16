import { supabase } from './supabase.js';

const form = document.getElementById("resetPasswordForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPassword = form.querySelector("input[type='password']").value.trim();

  if (newPassword.length < 6) {
    alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    return;
  }

  // تحديث كلمة المرور في Supabase
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    alert("❌ حدث خطأ: " + error.message);
  } else {
    alert("✅ تم تحديث كلمة المرور بنجاح!");
    window.location.href = "login.html";
  }
});
