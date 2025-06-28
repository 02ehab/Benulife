window.openMenu = function () {
  document.getElementById("sideMenu").classList.add("open");
}

window.closeMenu = function () {
  document.getElementById("sideMenu").classList.remove("open");
}

 document.getElementById("moneyDonationForm").addEventListener("submit", function(e) {
      e.preventDefault();
      alert("شكرًا لدعمك الإنساني ❤️ سيتم التواصل معك إن لزم الأمر.");
      this.reset();
    });