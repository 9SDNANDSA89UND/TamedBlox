/* =====================================
   AUTH HANDLERS (FRONTEND)
===================================== */

function initAuth() {
  const loginBtn = document.getElementById("openLogin");
  const signupBtn = document.getElementById("openSignup");

  // Navbar loads dynamically → wait for it
  if (!loginBtn || !signupBtn) {
    return setTimeout(initAuth, 80);
  }

  /* ========= MODAL HELPERS ========= */
  window.openModal = (id) => {
    document.getElementById(id)?.classList.remove("hidden");
  };

  window.closeModal = (id) => {
    document.getElementById(id)?.classList.add("hidden");
  };

  /* ========= OPEN MODALS ========= */
  loginBtn.onclick = () => openModal("loginModal");
  signupBtn.onclick = () => openModal("signupModal");

  /* =====================================
       LOGIN SUBMIT
  ====================================== */
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

  /* =====================================
       SIGNUP SUBMIT
  ====================================== */
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

    localStorage.setItem("authToken", data.token);
    closeModal("signupModal");
    location.reload();
  };

  applyLoggedInUI();
  console.log("Auth initialized.");
}


/* =====================================
   FIXED LOGGED-IN UI + ADMIN BUTTON
===================================== */
function applyLoggedInUI() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  const navRight = document.querySelector(".nav-right");

  // Navbar might not be loaded yet
  if (!navRight) {
    return setTimeout(applyLoggedInUI, 80);
  }

  // Remove login/signup buttons
  document.getElementById("openLogin")?.remove();
  document.getElementById("openSignup")?.remove();

  // Account button
  const accountBtn = document.createElement("button");
  accountBtn.className = "nav-account-btn";
  accountBtn.innerText = "Account";

  // Logout button
  const logoutBtn = document.createElement("button");
  logoutBtn.className = "nav-logout-btn";
  logoutBtn.innerText = "Logout";
  logoutBtn.onclick = () => {
    localStorage.removeItem("authToken");
    location.reload();
  };

  navRight.appendChild(accountBtn);
  navRight.appendChild(logoutBtn);

  /* ==========================================================
     ⭐ ADMIN DETECTION — SHOW "Admin Chats" BUTTON
  ========================================================== */
  fetch("https://website-5eml.onrender.com/auth/me", {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => res.json())
    .then(user => {
      if (user.email === user.adminEmail) {
        console.log("👑 Admin detected — enabling admin chat button");

        const adminBtn = document.getElementById("adminChatBtn");
        if (adminBtn) adminBtn.style.display = "flex";
      }
    });
}


/* =====================================
   PASSWORD EYE ICON TOGGLE
===================================== */
document.addEventListener("click", (e) => {
  const toggle = e.target.closest(".toggle-password");
  if (!toggle) return;

  const inputId = toggle.getAttribute("data-target");
  const input = document.getElementById(inputId);

  const eyeOpen = toggle.querySelector(".eye-open");
  const eyeClosed = toggle.querySelector(".eye-closed");

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


/* Start auth once DOM loads */
document.addEventListener("DOMContentLoaded", initAuth);
