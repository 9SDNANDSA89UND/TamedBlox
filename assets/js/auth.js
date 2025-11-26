/* =====================================================
   FRONTEND AUTH SYSTEM (SAFE + ADMIN FIXED)
   - Works with async navbar loading
   - Uses backend "admin: true/false"
   - No false admin detection
   - No null onclick errors
===================================================== */

function initAuth() {
  const loginBtn = document.getElementById("openLogin");
  const signupBtn = document.getElementById("openSignup");

  // 🔥 Navbar loads asynchronously — wait until buttons exist
  if (!loginBtn || !signupBtn) {
    return setTimeout(initAuth, 50);
  }

  /* ========= MODAL HELPERS ========= */
  window.openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("hidden");
  };

  window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("hidden");
  };

  /* ========= OPEN LOGIN/SIGNUP MODALS ========= */
  loginBtn.onclick = () => openModal("loginModal");
  signupBtn.onclick = () => openModal("signupModal");

  /* =====================================
        LOGIN SUBMIT
  ====================================== */
  document.getElementById("loginSubmit").onclick = async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    const res = await fetch("https://website-5eml.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!data.success) {
      loginError.innerText = data.error || "Invalid credentials.";
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
    const username = signupUsername.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();
    const confirm = signupPasswordConfirm.value.trim();

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

/* =====================================================
   APPLY LOGGED-IN UI + ADMIN DETECTION (SAFE)
===================================================== */
async function applyLoggedInUI() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  const navRight = document.querySelector(".nav-right");
  if (!navRight) return setTimeout(applyLoggedInUI, 50);

  // Remove default login/signup buttons
  document.getElementById("openLogin")?.remove();
  document.getElementById("openSignup")?.remove();

  // Create account button
  const accountBtn = document.createElement("button");
  accountBtn.className = "nav-account-btn";
  accountBtn.innerText = "Account";

  // Create logout button
  const logoutBtn = document.createElement("button");
  logoutBtn.className = "nav-logout-btn";
  logoutBtn.innerText = "Logout";
  logoutBtn.onclick = () => {
    localStorage.removeItem("authToken");
    location.reload();
  };

  navRight.appendChild(accountBtn);
  navRight.appendChild(logoutBtn);

  /* === ADMIN CHECK (SAFE + CORRECT) === */
  try {
    const res = await fetch("https://website-5eml.onrender.com/auth/me", {
      headers: { Authorization: "Bearer " + token }
    });

    const user = await res.json();

    // Backend now returns: { email, username, admin: true/false }
    if (user.admin === true) {
      const adminBtn = document.getElementById("adminChatBtn");
      if (adminBtn) adminBtn.style.display = "flex";
    }
  } catch (e) {
    console.error("Failed to fetch user info:", e);
  }
}

/* =====================================================
   PASSWORD VISIBILITY TOGGLE
===================================================== */
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

/* =====================================================
   START AUTH
===================================================== */
document.addEventListener("DOMContentLoaded", initAuth);
