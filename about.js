window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

function openMenu() {
      document.getElementById("sideMenu").classList.add("open");
    }
    function closeMenu() {
      document.getElementById("sideMenu").classList.remove("open");
    }

    document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("donationForm");
      const successMessage = document.getElementById("successMessage");

      form.addEventListener("submit", (e) => {
        e.preventDefault();

        // هنا يمكنك إرسال البيانات إلى سيرفر أو تخزينها
        successMessage.style.display = "block";
        form.reset();
      });
    });