/* ============================================================
   TamedBlox Chat — FINAL PRODUCTION VERSION
   ✔ Customer chat auto-loads
   ✔ Admin chat list loads reliably
   ✔ No empty windows
   ✔ No auto-open bugs
============================================================ */

window.API = "https://website-5eml.onrender.com";

let CURRENT_CHAT = null;
let IS_ADMIN = false;
let evtSrc = null;

const qs = (id) => document.getElementById(id);

/* ============================================================
   SSE STREAM
============================================================ */
function startSSE(chatId) {
  if (evtSrc) evtSrc.close();

  evtSrc = new EventSource(`${API}/chats/stream/${chatId}`);

  evtSrc.onmessage = (e) => {
    try {
      appendMessage(JSON.parse(e.data));
    } catch {}
  };

  evtSrc.onerror = () => setTimeout(() => startSSE(chatId), 1500);
}

/* ============================================================
   MESSAGE RENDERING
============================================================ */
function appendMessage(msg) {
  const box = qs("chatMessages");
  if (!box) return;

  const mine = IS_ADMIN ? "admin" : CURRENT_CHAT.userEmail;

  const html = `
    <div class="msg ${msg.system ? "system" : msg.sender === mine ? "me" : "them"}">
      ${msg.content}
      <br><small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
    </div>`;

  box.innerHTML += html;
  box.scrollTop = box.scrollHeight;
}

async function loadMessages(id) {
  const res = await fetch(`${API}/chats/messages/${id}`);
  const msgs = await res.json();

  qs("chatMessages").innerHTML = "";

  msgs.forEach((m) => appendMessage(m));
}

/* ============================================================
   CUSTOMER CHAT AUTOMATICALLY LOADS
============================================================ */
async function loadCustomerChat(token) {
  const resp = await fetch(`${API}/chats/my-chats`, {
    headers: { Authorization: "Bearer " + token }
  });

  const chat = await resp.json();
  if (!chat?._id) return false;

  CURRENT_CHAT = { _id: chat._id, userEmail: chat.userEmail };

  await loadMessages(chat._id);

  qs("chatButton")?.classList.remove("hidden");
  startSSE(chat._id);

  return true;
}

/* ============================================================
   ADMIN CHAT LIST LOADER
============================================================ */
async function loadAdminChats() {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API}/chats/all`, {
    headers: { Authorization: "Bearer " + token }
  });

  const list = await res.json();
  const wrap = qs("adminChatList");

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
}

/* ============================================================
   OPEN CHAT AS ADMIN
============================================================ */
async function openAdminChat(id) {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API}/chats/by-id/${id}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const chat = await res.json();

  CURRENT_CHAT = { _id: id, userEmail: "admin" };

  qs("chatWindow").classList.remove("hidden");

  await loadMessages(id);
  startSSE(id);
}

/* ============================================================
   SEND MESSAGE
============================================================ */
async function sendMessage() {
  const input = qs("chatInput");
  const content = input.value.trim();
  input.value = "";

  if (!content || !CURRENT_CHAT) return;

  const token = localStorage.getItem("authToken");

  appendMessage({
    sender: IS_ADMIN ? "admin" : CURRENT_CHAT.userEmail,
    content,
    timestamp: new Date()
  });

  fetch(`${API}/chats/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? "Bearer " + token : ""
    },
    body: JSON.stringify({ chatId: CURRENT_CHAT._id, content })
  });
}

/* ============================================================
   ADMIN PANEL TOGGLE (FIXED)
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
   CHAT BUTTON TOGGLE
============================================================ */
function setupChatButton() {
  const btn = qs("chatButton");
  const win = qs("chatWindow");

  if (!btn || !win) return;

  btn.onclick = () => {
    win.classList.toggle("hidden");
  };
}

/* ============================================================
   MAIN INIT
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");

  setupAdminToggle();
  setupChatButton();

  if (!token) {
    qs("adminChatPanel")?.classList.add("hidden");
    qs("chatWindow")?.classList.add("hidden");
    return;
  }

  // LOAD ACCOUNT TYPE
  const me = await fetch(`${API}/auth/me`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!me.ok) return;

  const user = await me.json();
  IS_ADMIN = user.admin;

  if (IS_ADMIN) {
    qs("adminChatBtn")?.classList.remove("hidden");
  } else {
    await loadCustomerChat(token);
  }
});
