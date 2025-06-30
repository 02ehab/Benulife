 document.getElementById("resetForm").addEventListener("submit", function(e) {
      e.preventDefault();
      alert("📨 تم إرسال رابط إعادة تعيين كلمة المرور (تجريبي)");
      this.reset();
    });