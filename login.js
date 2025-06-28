function showLogin() {
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("registerForm").classList.remove("active");
  document.getElementById("btn-indicator").style.right = "0%";
}

function showRegister() {
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("registerForm").classList.add("active");
  document.getElementById("btn-indicator").style.right = "50%";
}

function toggleAccountFields() {
  const type = document.getElementById("accountType").value;
  const donorFields = document.getElementById("donorFields");
  const hospitalFields = document.getElementById("hospitalFields");

  donorFields.classList.add("hidden");
  hospitalFields.classList.add("hidden");

  if (type === "donor") {
    donorFields.classList.remove("hidden");
  } else if (type === "hospital") {
    hospitalFields.classList.remove("hidden");
  }
}
