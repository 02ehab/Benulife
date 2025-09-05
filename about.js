import { supabase } from "./supabase.js";

async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    alert("من فضلك سجل دخول أولاً");
    window.location.href = "login.html";
  } else {
    console.log("المستخدم الحالي:", user.email);
  }
}

checkUser();

window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
};
window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
};



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
