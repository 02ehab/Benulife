import { supabase } from './supabase.js';

// فتح/إغلاق القائمة الجانبية
window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}
 
// 2. التعامل مع الفورم
const form = document.getElementById("volunteerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // جمع البيانات
  const data = {
    full_name: form.querySelector("input[type='text']").value,
    birth_date: form.querySelector("input[type='date']").value,
    gender: form.querySelector("select").value,
    national_id: form.querySelectorAll("input[type='text']")[1].value,
    phone: form.querySelector("input[type='tel']").value,
    email: form.querySelector("input[type='email']").value,
    address: form.querySelector("textarea").value,
    city: form.querySelectorAll("input[type='text']")[2].value,
    blood_type: form.querySelectorAll("select")[1].value,
    last_donation: form.querySelectorAll("input[type='date']")[1].value,
    health_status: form.querySelectorAll("select")[2].value,
    chronic_diseases: form.querySelectorAll("input[type='text']")[3].value,
    experience: form.querySelectorAll("textarea")[1].value,
    availability: form.querySelectorAll("select")[3].value,
  };

  // زر الإرسال
  const btn = form.querySelector(".btn");
  btn.innerText = "جارٍ الحفظ...";
  btn.disabled = true;

  // 3. إدخال البيانات في الجدول
  const { error } = await supabase.from("volunteers").insert([data]);

  if (error) {
    alert("❌ حصل خطأ: " + error.message);
  } else {
    alert("✅ تم تسجيل بياناتك بنجاح!");
    form.reset();
  }

  btn.innerText = "تسجيل";
  btn.disabled = false;
});


    // تغيير روابط الصفحة حسب نوع المستخدم
  const userType = localStorage.getItem("userType");
  const linkText = (userType === "hospital" || userType === "bloodbank")
    ? "طلبات المتبرعين"
    : "الطلبات العاجلة";
  const linkHref = (userType === "hospital" || userType === "bloodbank")
    ? "donate_card.html"
    : "emergency_card.html";

  const linkHTML = `<a href="${linkHref}">${linkText}</a>`;
  const placeholders = [
    document.getElementById("requestsLinkPlaceholder"),
    document.getElementById("requestsLinkDesktop"),
    document.getElementById("requestsLinkMobile")
  ];
  placeholders.forEach(placeholder => {
    if (placeholder) placeholder.outerHTML = linkHTML;
  });

  // عرض كلمة "ملفي" إذا المستخدم مسجل دخول
  const { data: { session } } = await supabase.auth.getSession();
  const authButtons = document.getElementById("authButtons");
  const sideAuthButtons = document.getElementById("sideAuthButtons");
  const profileLink = document.getElementById("profileLink");
  const profileLinkMobile = document.getElementById("profileLinkMobile");

  if (session) {
    if (authButtons) authButtons.style.display = "none";
    if (sideAuthButtons) sideAuthButtons.style.display = "none";
    if (profileLink) {
      profileLink.style.display = "inline-block";
      profileLink.textContent = "ملفي";
    }
    if (profileLinkMobile) {
      profileLinkMobile.style.display = "inline-block";
      profileLinkMobile.textContent = "ملفي";
    }
  }
