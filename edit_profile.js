import { supabase } from './supabase.js';

// -------------------------
// فتح وإغلاق القائمة الجانبية
// -------------------------
window.openMenu = () => document.getElementById("sideMenu")?.classList.add("open");
window.closeMenu = () => document.getElementById("sideMenu")?.classList.remove("open");

// -------------------------
// تعبئة وتعديل بيانات الملف الشخصي
// -------------------------
async function setupProfileForm() {
  const form = document.getElementById("editProfileForm");
  if (!form) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    alert("يجب تسجيل الدخول أولاً.");
    return;
  }

  const userId = session.user.id;
  console.log("Logged in userId:", userId);

  try {
    // جلب البيانات من جدول profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("خطأ في جلب البيانات:", error);
      alert("خطأ في جلب البيانات: " + error.message);
      return;
    }

    if (!profile) {
      console.log("لم يتم العثور على بيانات المستخدم، إنشاء سجل جديد...");
      // إنشاء سجل جديد إذا لم يكن موجوداً
      const newProfile = {
        user_id: userId,
        name: "",
        blood_type: "",
        city: "",
        created_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile]);

      if (insertError) {
        console.error("خطأ في إنشاء سجل جديد:", insertError);
        alert("خطأ في إنشاء سجل الملف الشخصي: " + insertError.message);
        return;
      }

      // إعادة تحميل البيانات بعد الإنشاء
      const { data: newData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (newData) {
        populateForm(newData);
      }
    } else {
      console.log("Profile data loaded:", profile);
      populateForm(profile);
    }

  } catch (error) {
    console.error("خطأ غير متوقع:", error);
    alert("حدث خطأ غير متوقع: " + error.message);
  }

  function populateForm(profile) {
    // تعبئة الفورم تلقائيًا مع التحقق من وجود الحقول
    if (document.getElementById("name")) {
      document.getElementById("name").value = profile.name || "";
    }
    if (document.getElementById("bloodType")) {
      document.getElementById("bloodType").value = profile.blood_type || "";
    }
    if (document.getElementById("city")) {
      document.getElementById("city").value = profile.city || "";
    }
  }

  // حفظ التعديلات
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updates = {};
    
    // بناء التحديثات فقط للحقول الموجودة في النموذج
    const nameValue = document.getElementById("name")?.value;
    const bloodTypeValue = document.getElementById("bloodType")?.value;
    const cityValue = document.getElementById("city")?.value;

    if (nameValue !== undefined) updates.name = nameValue;
    if (bloodTypeValue !== undefined) updates.blood_type = bloodTypeValue;
    if (cityValue !== undefined) updates.city = cityValue;
    
    // Only add updated_at if the column exists in the table
    // The error indicates this column might not exist, so we'll skip it
    // updates.updated_at = new Date().toISOString();

    console.log("Attempting to update with:", updates);

    try {
      // تحديث البيانات في جدول profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) {
        console.error("خطأ في التحديث:", updateError);
        
        // محاولة التعامل مع أخطاء محددة
        if (updateError.code === 'PGRST204') {
          alert("الحقول المحدثة غير موجودة في قاعدة البيانات. يرجى التحقق من أسماء الحقول.");
        } else if (updateError.code === '23505') {
          alert("يوجد تكرار في البيانات.");
        } else {
          alert("حدث خطأ أثناء تحديث البيانات: " + updateError.message);
        }
        return;
      }

      alert("تم حفظ التعديلات بنجاح!");
      // إعادة التوجيه إلى صفحة الملف الشخصي
      window.location.href = "profile.html?updated=true";
      
    } catch (error) {
      console.error("خطأ غير متوقع أثناء التحديث:", error);
      alert("حدث خطأ غير متوقع أثناء التحديث: " + error.message);
    }
  });
}

// -------------------------
// تشغيل الوظائف عند تحميل الصفحة
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  setupProfileForm();
});
