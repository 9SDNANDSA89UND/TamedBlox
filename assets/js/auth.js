/* ============================================================
   TamedBlox — AUTH SYSTEM (FINAL PATCHED VERSION)
   - Auto-login after signup
   - Auto-login after login
   - Navbar UI updates
   - Admin button injection
   - Safe async navbar loader
============================================================ */

window.API = window.API || "https://website-5eml.onrender.com";

/* ============================================================
   WAIT FOR NAVBAR BEFORE BINDING BUTTONS
============================================================ */
function waitForNavbar(callback) {
  const loginBtn = document.getElementById("openLogin");
  const signupBtn = document.getElementById("openSignup");

  if (!loginBtn || !signupBtn) {
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

  // ⭐ Auto-login
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

  // ⭐ Auto-login after signup
  localStorage.setItem("authToken", data.token);

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

  // Fetch user details
  const res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!res.ok) return; // Invalid token
  const user = await res.json();

  // ⭐ Display username + logout
  const accountBtn = document.createElement("button");
  accountBtn.className = "nav-rect-btn";
  accountBtn.innerHTML = `👤 ${user.username}`;
  navRight.appendChild(accountBtn);

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "nav-rect-btn nav-accent-btn";
  logoutBtn.innerHTML = "Logout";
  logoutBtn.onclick = logoutUser;
  navRight.appendChild(logoutBtn);

  // ⭐ Admin Chat Button
  if (user.admin === true) {
    const adminBtn = document.getElementById("adminChatBtn");
    if (adminBtn) adminBtn.style.display = "flex";
  }
}

/* ============================================================
   LOGOUT HANDLER
============================================================ */
function logoutUser() {
  localStorage.removeItem("authToken");
  location.reload();
}
