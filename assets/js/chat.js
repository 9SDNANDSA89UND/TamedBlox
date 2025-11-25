/* ============================================================
   TAMEDBLOX — ADVANCED CHAT SYSTEM (ADMIN MULTI-CHAT + USER)
   Now using backend ADMIN_NAME instead of hardcoded email
============================================================ */

const API = "https://website-5eml.onrender.com";

let ALL_CHATS = [];        // Admin chat list
let CURRENT_CHAT = null;   // Chat currently open

/* ============================================================
   PAGE INIT
============================================================ */
document.addEventListener("DOMContentLoaded", () => {

  loadChat();

  setInterval(() => {
    if (CURRENT_CHAT?._id) refreshMessages();
  }, 2000);

  document.getElementById("chatButton").onclick = () => {
    document.getElementById("chatWindow").classList.toggle("hidden");
  };

  document.getElementById("chatSend").onclick = sendMessage;
});

/* ============================================================
   MAIN LOADER — USER OR ADMIN
============================================================ */
async function loadChat() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  // Get logged in user info
  const userRes = await fetch(`${API}/auth/me`, {
    headers: { Authorization: "Bearer " + token }
  });
  if (!userRes.ok) return;

  const user = await userRes.json();

  // Backend sends admin name here
  const ADMIN_NAME = user.adminName;   
  const isAdmin =
    user.email === ADMIN_NAME ||
    user.username === ADMIN_NAME;

  /* ======================================================
     ADMIN MODE (Multi-chat panel)
  ====================================================== */
  if (isAdmin) {
    document.getElementById("chatButton").classList.remove("hidden");
    document.getElementById("adminChatPanel").classList.remove("hidden");

    const allRes = await fetch(`${API}/chats/all`, {
      headers: { Authorization: "Bearer " + token }
    });
    ALL_CHATS = await allRes.json();

    renderAdminChatList();
    return; // Admin doesn't auto-open a chat
  }

  /* ======================================================
     USER MODE (Single chat)
  ====================================================== */
  const chatRes = await fetch(`${API}/chats/my-chats`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!chatRes.ok) return;
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
   ADMIN — RENDER CHAT LIST
============================================================ */
function renderAdminChatList() {
  const list = document.getElementById("adminChatList");
  list.innerHTML = "";

  ALL_CHATS.forEach((c) => {
    list.innerHTML += `
      <div class="admin-chat-item" onclick="openAdminChat('${c._id}')">
        <strong>${c.orderDetails?.orderId || "No Order"}</strong><br>
        ${c.participants[0]}
      </div>
    `;
  });
}

/* ============================================================
   ADMIN — OPEN SELECTED CHAT
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

  document.getElementById("chatWindow").classList.remove("hidden");
}

/* ============================================================
   USER — RENDER ORDER SUMMARY
============================================================ */
function renderOrderSummary(chat) {
  const el = document.getElementById("chatOrderSummary");

  if (!chat.orderDetails) {
    el.innerHTML = "";
    return;
  }

  const order = chat.orderDetails;

  el.innerHTML = `
    <strong>Order ID:</strong> ${order.orderId}<br>
    <strong>Total:</strong> $${order.total} USD<br>
    <strong>Items:</strong><br>
    ${order.items.map(i => `• ${i.qty}× ${i.name}`).join("<br>")}
  `;
}

/* ============================================================
   RENDER MESSAGES
============================================================ */
function renderMessages(msgs) {
  const box = document.getElementById("chatMessages");

  box.innerHTML = msgs
    .map(
      (m) => `
      <div class="msg ${m.sender === CURRENT_CHAT.userEmail ? "me" : "them"}">
        ${m.content}<br>
        <small>${new Date(m.timestamp).toLocaleTimeString()}</small>
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

  if (!res.ok) return;

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
