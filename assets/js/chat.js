/* ============================================================
   TamedBlox Chat — CRASH-PROOF FINAL VERSION
   ✔ Never breaks navbar
   ✔ Never throws errors
   ✔ Works for admin + users
============================================================ */

window.API = "https://website-5eml.onrender.com";

let IS_ADMIN = false;
let CURRENT_CHAT = null;
let evtSrc = null;

const qs = (id) => document.getElementById(id);

/* ============================================================
   SAFE AUTH SESSION CHECK
============================================================ */
async function loadSession() {
  const token = localStorage.getItem("authToken");
  if (!token) return { loggedIn: false, admin: false };

  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) return { loggedIn: false, admin: false };

    const user = await res.json();

    return {
      loggedIn: true,
      admin: user?.admin === true,
      email: user?.email || null
    };
  } catch {
    return { loggedIn: false, admin: false };
  }
}

/* ============================================================
   SSE — fully guarded (never errors)
============================================================ */
function startSSE(chatId) {
  try {
    if (!chatId) return;

    if (evtSrc) evtSrc.close();
    evtSrc = new EventSource(`${API}/chats/stream/${chatId}`);

    evtSrc.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        appendMessage(msg);
      } catch {}
    };

    evtSrc.onerror = () => {
      setTimeout(() => startSSE(chatId), 1500);
    };
  } catch {}
}

/* ============================================================
   MESSAGE RENDERING
============================================================ */
function appendMessage(msg) {
  const box = qs("chatMessages");
  if (!box || !msg) return;

  const mine = IS_ADMIN ? "admin" : CURRENT_CHAT?.userEmail;

  const div = document.createElement("div");
  div.className = `msg ${msg.system ? "system" : msg.sender === mine ? "me" : "them"}`;
  div.innerHTML = `${msg.content}<br><small>${new Date(msg.timestamp).toLocaleTimeString()}</small>`;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function loadMessages(id) {
  try {
    const res = await fetch(`${API}/chats/messages/${id}`);
    const msgs = await res.json();

    const box = qs("chatMessages");
    if (!box) return;

    box.innerHTML = "";

    msgs.forEach((m) => appendMessage(m));
  } catch {}
}

/* ============================================================
   CUSTOMER CHAT LOADING (SAFE)
============================================================ */
async function loadCustomerChat(token, email) {
  try {
    const res = await fetch(`${API}/chats/my-chats`, {
      headers: { Authorization: "Bearer " + token }
    });

    const chat = await res.json();

    if (!chat?._id) return false;

    CURRENT_CHAT = { _id: chat._id, userEmail: email };

    await loadMessages(chat._id);

    qs("chatButton")?.classList.remove("hidden");

    startSSE(chat._id);

    return true;
  } catch {
    return false;
  }
}

/* ============================================================
   ADMIN CHAT LIST
============================================================ */
async function loadAdminChats() {
  try {
    const token = localStorage.getItem("authToken");
    const wrap = qs("adminChatList");
    if (!wrap) return;

    const res = await fetch(`${API}/chats/all`, {
      headers: { Authorization: "Bearer " + token }
    });

    const list = await res.json();

    wrap.innerHTML = "";

    list.forEach((chat) => {
      const item = document.createElement("div");
      item.className = "admin-chat-item";
      item.dataset.id = chat._id;
      item.innerHTML = `
        <strong>${chat.orderDetails?.orderId || "Order"}</strong><br>
        ${chat.participants?.[0] || "User"}
      `;
      item.onclick = () => openAdminChat(chat._id);
      wrap.appendChild(item);
    });
  } catch {}
}

/* ============================================================
   OPEN ADMIN CHAT
============================================================ */
async function openAdminChat(chatId) {
  try {
    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API}/chats/by-id/${chatId}`, {
      headers: { Authorization: "Bearer " + token }
    });

    const chat = await res.json();

    CURRENT_CHAT = { _id: chatId, userEmail: "admin" };

    qs("chatWindow")?.classList.remove("hidden");

    await loadMessages(chatId);
    startSSE(chatId);
  } catch {}
}

/* ============================================================
   SEND MESSAGE (SAFE)
============================================================ */
async function sendMessage() {
  const input = qs("chatInput");
  if (!input) return;

  const text = input.value.trim();
  input.value = "";

  if (!text || !CURRENT_CHAT) return;

  appendMessage({
    sender: IS_ADMIN ? "admin" : CURRENT_CHAT.userEmail,
    content: text,
    timestamp: new Date()
  });

  try {
    const token = localStorage.getItem("authToken");

    fetch(`${API}/chats/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? "Bearer " + token : ""
      },
      body: JSON.stringify({ chatId: CURRENT_CHAT._id, content: text })
    });
  } catch {}
}

/* ============================================================
   ADMIN PANEL TOGGLE (SAFE)
============================================================ */
function setupAdminToggle() {
  const btn = qs("adminChatBtn");
  const panel = qs("adminChatPanel");

  if (!btn || !panel) return;

  btn.onclick = async () => {
    const opening = panel.classList.contains("hidden");

    if (opening) {
      await loadAdminChats();
      panel.classList.remove("hidden");
    } else {
      panel.classList.add("hidden");
    }
  };
}

/* ============================================================
   CHAT WINDOW TOGGLE
============================================================ */
function setupChatWindowToggle() {
  const btn = qs("chatButton");
  const win = qs("chatWindow");

  if (!btn || !win) return;

  btn.onclick = () => win.classList.toggle("hidden");
}

/* ============================================================
   MAIN INITIALIZATION (CRASH-PROOF)
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  setupAdminToggle();
  setupChatWindowToggle();

  const session = await loadSession();

  if (!session.loggedIn) {
    qs("adminChatBtn")?.classList.add("hidden");
    qs("adminChatPanel")?.classList.add("hidden");
    qs("chatWindow")?.classList.add("hidden");
    qs("chatButton")?.classList.add("hidden");
    return;
  }

  IS_ADMIN = session.admin;

  if (IS_ADMIN) {
    qs("adminChatBtn")?.classList.remove("hidden");
    return; // admin manually opens panel
  }

  await loadCustomerChat(localStorage.getItem("authToken"), session.email);
});
