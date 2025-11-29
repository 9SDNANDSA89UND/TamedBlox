/* ============================================================
   TamedBlox — AUTH SYSTEM (FINAL PATCHED VERSION)
============================================================ */

window.API = window.API || "https://website-5eml.onrender.com";

/* ============================================================
   SAFE FALLBACKS (Fix Option A)
============================================================ */
if (!window.openModal) {
  window.openModal = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("hidden");
  };
}

if (!window.closeModal) {
  window.closeModal = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  };
}

/* ============================================================
   WAIT FOR NAVBAR BEFORE BINDING BUTTONS
============================================================ */
function waitForNavbar(callback) {
  const ready =
    document.getElementById("openLogin") &&
    document.getElementById("openSignup") &&
    document.getElementById("adminChatBtn");

  if (!ready) {
    return setTimeout(() => waitForNavbar(callback), 50);
  }

  callback();
}

/* ============================================================
   INITIALIZE AUTH LOGIC
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  waitForNavbar(() => {
    bindAuthButtons();
    applyLoggedInUI();
  });
});

/* ============================================================
   BIND LOGIN / SIGNUP BUTTONS
============================================================ */
function bindAuthButtons() {
  const loginBtn = document.getElementById("openLogin");
  const signupBtn = document.getElementById("openSignup");

  if (loginBtn) loginBtn.onclick = () => openModal("loginModal");
  if (signupBtn) signupBtn.onclick = () => openModal("signupModal");

  const loginSubmit = document.getElementById("loginSubmit");
  const signupSubmit = document.getElementById("signupSubmit");

  if (loginSubmit) loginSubmit.onclick = loginUser;
  if (signupSubmit) signupSubmit.onclick = signupUser;
}

/* ============================================================
   LOGIN HANDLER
============================================================ */
async function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const errorEl = document.getElementById("loginError");

  errorEl.innerText = "";

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!data.success) {
    errorEl.innerText = data.error || "Invalid email or password.";
    return;
  }

  localStorage.setItem("authToken", data.token);
  closeModal("loginModal");

  location.reload();
}

/* ============================================================
   SIGNUP HANDLER (AUTO-LOGIN)
============================================================ */
async function signupUser() {
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const confirm = document.getElementById("signupPasswordConfirm").value.trim();
  const errorEl = document.getElementById("signupError");

  errorEl.innerText = "";

  if (password !== confirm) {
    errorEl.innerText = "Passwords do not match.";
    return;
  }

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();

  if (!data.success) {
    errorEl.innerText = data.error || "Signup failed.";
    return;
  }

  // ⭐ Fetch login token after signup
  const loginReq = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const loginData = await loginReq.json();
  if (loginData.success && loginData.token) {
    localStorage.setItem("authToken", loginData.token);
  }

  closeModal("signupModal");
  location.reload();
}

/* ============================================================
   UPDATE NAVBAR FOR LOGGED-IN USERS
============================================================ */
async function applyLoggedInUI() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  const loginBtn = document.getElementById("openLogin");
  const signupBtn = document.getElementById("openSignup");

  if (loginBtn) loginBtn.style.display = "none";
  if (signupBtn) signupBtn.style.display = "none";

  const navRight = document.querySelector(".nav-right");
  if (!navRight) return;

  const res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!res.ok) return;
  const user = await res.json();

  /* ============================================================
     PROFILE BUTTON (LUCIDE USER-PEN — NO EMOJI)
  ============================================================ */
  const profileBtn = document.createElement("button");
  profileBtn.className = "nav-rect-btn";
  profileBtn.id = "profileBtn";

  profileBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      class="lucide lucide-user-pen">
      <path d="M11.5 15H7a4 4 0 0 0-4 4v2"/>
      <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>
      <circle cx="10" cy="7" r="4"/>
    </svg>
    <span>${user.username}</span>
  `;

  navRight.appendChild(profileBtn);

  /* ============================================================
     LOGOUT BUTTON
  ============================================================ */
  const logoutBtn = document.createElement("button");
  logoutBtn.className = "nav-rect-btn nav-accent-btn";
  logoutBtn.innerText = "Logout";
  logoutBtn.onclick = logoutUser;
  navRight.appendChild(logoutBtn);

  /* ============================================================
     ADMIN CHAT BUTTON
  ============================================================ */
  const adminBtn = document.getElementById("adminChatBtn");

  if (user.admin === true && adminBtn) {
    adminBtn.style.display = "flex";

    adminBtn.onclick = async () => {
      const panel = document.getElementById("adminChatPanel");
      if (panel) panel.classList.toggle("hidden");

      const token = localStorage.getItem("authToken");
      if (typeof loadAdminChats === "function") {
        await loadAdminChats(token);
      }
    };
  }
}

/* ============================================================
   LOGOUT HANDLER
============================================================ */
function logoutUser() {
  localStorage.removeItem("authToken");
  location.reload();
}
