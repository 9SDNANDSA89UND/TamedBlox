/* ============================================================
   TamedBlox — CHAT SYSTEM (SAFE, PATCHED, FINAL VERSION)
   - Prevents duplicate loading
   - Fixes API re-declare error
   - Works with admin + user mode
============================================================ */

// 🔥 Prevent double-loading of chat.js (fixes API duplicate AND all crashes)
if (window.__CHAT_JS_LOADED__) {
  console.warn("chat.js already loaded — skipping duplicate load.");
  return;
}
window.__CHAT_JS_LOADED__ = true;

// 🔥 Safe API assignment (cannot redeclare)
window.API = window.API || "https://website-5eml.onrender.com";

let ALL_CHATS = [];
let CURRENT_CHAT = null;

/* ============================================================
   INITIAL SETUP
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadChat();

  // Auto-refresh messages
  setInterval(() => {
    if (CURRENT_CHAT?._id) refreshMessages();
  }, 2000);

  // USER chat circle button
  const chatBtn = document.getElementById("chatButton");
  if (chatBtn) {
    chatBtn.onclick = () => {
      document.getElementById("chatWindow").classList.toggle("hidden");
    };
  }

  // ADMIN navbar chat button
  const adminBtn = document.getElementById("adminChatBtn");
  if (adminBtn) {
    adminBtn.onclick = () => {
      const panel = document.getElementById("adminChatPanel");
      panel.classList.toggle("hidden");
    };
  }

  // SEND MESSAGE
  const sendBtn = document.getElementById("chatSend");
  if (sendBtn) sendBtn.onclick = sendMessage;
});

/* ============================================================
   LOAD CHAT BASED ON USER ROLE
============================================================ */
async function loadChat() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  const userRes = await fetch(`${API}/auth/me`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!userRes.ok) return;
  const user = await userRes.json();

  /* ================================
       ADMIN MODE
  ================================= */
  if (user.admin === true) {
    const allRes = await fetch(`${API}/chats/all`, {
      headers: { Authorization: "Bearer " + token }
    });

    ALL_CHATS = await allRes.json();
    renderAdminChatList();
    return;
  }

  /* ================================
       USER MODE
  ================================= */
  const chatRes = await fetch(`${API}/chats/my-chats`, {
    headers: { Authorization: "Bearer " + token }
  });

  const chat = await chatRes.json();
  if (!chat) return;

  CURRENT_CHAT = {
    ...chat,
    userEmail: user.email
  };

  renderOrderSummary(chat);
  refreshMessages();
}

/* ============================================================
   ADMIN — LIST OF CHATS
============================================================ */
function renderAdminChatList() {
  const list = document.getElementById("adminChatList");
  if (!list) return;

  list.innerHTML = "";

  ALL_CHATS.forEach(c => {
    list.innerHTML += `
      <div class="admin-chat-item" onclick="openAdminChat('${c._id}')">
        <strong>${c.orderDetails?.orderId || "No Order"}</strong><br>
        ${c.participants[0]}
      </div>
    `;
  });
}

/* ============================================================
   ADMIN — OPEN CHAT
============================================================ */
async function openAdminChat(chatId) {
  const token = localStorage.getItem("authToken");

  CURRENT_CHAT = {
    _id: chatId,
    userEmail: "admin"
  };

  const res = await fetch(`${API}/chats/messages/${chatId}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const msgs = await res.json();
  renderMessages(msgs);

  const chatWin = document.getElementById("chatWindow");
  chatWin.classList.add("admin-mode");
  chatWin.classList.remove("hidden");
}

/* ============================================================
   USER — ORDER SUMMARY
============================================================ */
function renderOrderSummary(chat) {
  const el = document.getElementById("chatOrderSummary");
  if (!el) return;

  if (!chat.orderDetails) {
    el.innerHTML = "<strong>No order linked.</strong>";
    return;
  }

  const o = chat.orderDetails;

  el.innerHTML = `
    <strong>Order ID:</strong> ${o.orderId}<br>
    <strong>Total:</strong> $${o.total} USD<br>
    <strong>Items:</strong><br>
    ${o.items.map(i => `• ${i.qty}× ${i.name}`).join("<br>")}
  `;
}

/* ============================================================
   RENDER MESSAGES
============================================================ */
function renderMessages(msgs) {
  const box = document.getElementById("chatMessages");
  if (!box) return;

  box.innerHTML = msgs
    .map(
      m => `
      <div class="msg ${m.sender === CURRENT_CHAT.userEmail ? "me" : "them"}">
        ${m.content}
        <br><small>${new Date(m.timestamp).toLocaleTimeString()}</small>
      </div>
    `
    )
    .join("");

  box.scrollTop = box.scrollHeight;
}

/* ============================================================
   REFRESH MESSAGES
============================================================ */
async function refreshMessages() {
  const token = localStorage.getItem("authToken");
  if (!CURRENT_CHAT?._id) return;

  const res = await fetch(`${API}/chats/messages/${CURRENT_CHAT._id}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const msgs = await res.json();
  renderMessages(msgs);
}

/* ============================================================
   SEND MESSAGE
============================================================ */
async function sendMessage() {
  const msg = document.getElementById("chatInput").value.trim();
  if (!msg || !CURRENT_CHAT?._id) return;

  document.getElementById("chatInput").value = "";

  const token = localStorage.getItem("authToken");

  await fetch(`${API}/chats/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      chatId: CURRENT_CHAT._id,
      content: msg
    })
  });

  refreshMessages();
}
