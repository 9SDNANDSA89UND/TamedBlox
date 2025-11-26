/* =====================================
   AUTH HANDLERS (FRONTEND)
===================================== */

function initAuth() {
  const loginBtn = document.getElementById("openLogin");
  const signupBtn = document.getElementById("openSignup");

  if (!loginBtn || !signupBtn) {
    return setTimeout(initAuth, 80);
  }

  window.openModal = (id) => {
    document.getElementById(id)?.classList.remove("hidden");
  };

  window.closeModal = (id) => {
    document.getElementById(id)?.classList.add("hidden");
  };

  loginBtn.onclick = () => openModal("loginModal");
  signupBtn.onclick = () => openModal("signupModal");

  /* LOGIN */
  document.getElementById("loginSubmit").onclick = async () => {
    const email = loginEmail.value;
    const password = loginPassword.value;

    const res = await fetch("https://website-5eml.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!data.success) {
      loginError.innerText = data.error || "Invalid email or password.";
      return;
    }

    localStorage.setItem("authToken", data.token);
    closeModal("loginModal");
    location.reload();
  };

  /* SIGNUP */
  document.getElementById("signupSubmit").onclick = async () => {
    const username = signupUsername.value;
    const email = signupEmail.value;
    const password = signupPassword.value;
    const confirm = signupPasswordConfirm.value;

    if (password !== confirm) {
      signupError.innerText = "Passwords do not match.";
      return;
    }

    const res = await fetch("https://website-5eml.onrender.com/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (!data.success) {
      signupError.innerText = data.error || "Signup failed.";
      return;
    }

    closeModal("signupModal");
    location.reload();
  };

  applyLoggedInUI();
}

/* =====================================
   LOGGED-IN UI + ADMIN BUTTON FIXED
===================================== */
async function applyLoggedInUI() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  const navRight = document.querySelector(".nav-right");
  if (!navRight) return setTimeout(applyLoggedInUI, 80);

  // Remove login/signup
  document.getElementById("openLogin")?.remove();
  document.getElementById("openSignup")?.remove();

  // Account + Logout buttons
  const accountBtn = document.createElement("button");
  accountBtn.className = "nav-account-btn";
  accountBtn.innerText = "Account";

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "nav-logout-btn";
  logoutBtn.innerText = "Logout";
  logoutBtn.onclick = () => {
    localStorage.removeItem("authToken");
    location.reload();
  };

  navRight.appendChild(accountBtn);
  navRight.appendChild(logoutBtn);

  /* === Check if admin safely === */
  const userRes = await fetch("https://website-5eml.onrender.com/auth/me", {
    headers: { Authorization: "Bearer " + token }
  });
  const user = await userRes.json();

  if (user.admin === true) {
    const adminBtn = document.getElementById("adminChatBtn");
    if (adminBtn) adminBtn.style.display = "flex";
  }
}

/* =====================================
   PASSWORD VISIBILITY TOGGLE
===================================== */
document.addEventListener("click", (e) => {
  const t = e.target.closest(".toggle-password");
  if (!t) return;

  const inputId = t.getAttribute("data-target");
  const input = document.getElementById(inputId);

  const eyeOpen = t.querySelector(".eye-open");
  const eyeClosed = t.querySelector(".eye-closed");

  if (input.type === "password") {
    input.type = "text";
    eyeOpen.style.display = "none";
    eyeClosed.style.display = "block";
  } else {
    input.type = "password";
    eyeOpen.style.display = "block";
    eyeClosed.style.display = "none";
  }
});

/* Start */
document.addEventListener("DOMContentLoaded", initAuth);
