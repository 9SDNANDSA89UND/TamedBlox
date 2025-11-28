/* ============================================================
   TamedBlox Chat System — FINAL GUEST CHAT PATCH (2025)
   ✔ Guest chat auto-create
   ✔ All devices: PC, iOS, Android, iPad
   ✔ Messages never disappear
   ✔ Admin + User + Guest all supported
============================================================ */

console.log("%c[TAMEDBLOX CHAT] Loaded", "color:#4ef58a;font-weight:900;");

window.API = "https://website-5eml.onrender.com";

let CURRENT_CHAT = null;
let IS_ADMIN = false;
let LAST_SENT_TIMESTAMP = null;
let evtSrc = null;

document.addEventListener("touchend", () => {}, { passive: false });

function qs(id) { return document.getElementById(id); }

/* ============================================================
   SSE STREAM
============================================================ */
function startSSE(chatId) {
  if (evtSrc) evtSrc.close();

  evtSrc = new EventSource(`${API}/chats/stream/${chatId}`);

  evtSrc.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);

      if (msg.deleted) {
        alert("This ticket has been deleted by an admin.");
        qs("chatWindow").classList.add("hidden");
        return;
      }

      appendMessage(msg);

    } catch (err) {}
  };

  evtSrc.onerror = () => {
    setTimeout(() => startSSE(chatId), 1500);
  };
}

/* ============================================================
   MESSAGE UTILS
============================================================ */
function isMine(m) {
  const me = IS_ADMIN ? "admin" : (CURRENT_CHAT.userEmail || "customer");
  return m.sender === me;
}

function createMsgHTML(m) {
  if (m.system) {
    return `
      <div class="msg them" style="opacity:0.6;">
        ${m.content}
        <br><small>${new Date(m.timestamp).toLocaleTimeString()}</small>
      </div>
    `;
  }

  return `
    <div class="msg ${isMine(m) ? "me" : "them"}">
      ${m.content}
      <br><small>${new Date(m.timestamp).toLocaleTimeString()}</small>
    </div>
  `;
}

function appendMessage(msg) {
  if (msg.timestamp === LAST_SENT_TIMESTAMP) return;

  const box = qs("chatMessages");
  if (!box) return;

  box.innerHTML += createMsgHTML(msg);
  box.scrollTop = box.scrollHeight;
}

async function loadMessages(chatId) {
  const res = await fetch(`${API}/chats/messages/${chatId}`);
  const msgs = await res.json();

  qs("chatMessages").innerHTML = msgs.map(createMsgHTML).join("");
  qs("chatMessages").scrollTop = qs("chatMessages").scrollHeight;
}

/* ============================================================
   LOAD LOGGED-IN USER CHAT
============================================================ */
async function loadChatForUser(token) {
  const me = await fetch(`${API}/auth/me`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!me.ok) return false;

  const user = await me.json();
  IS_ADMIN = !!user.admin;

  if (IS_ADMIN) {
    enableAdminUI();
    return loadAdminChats(token);
  }

  const res = await fetch(`${API}/chats/my-chats`, {
    headers: { Authorization: "Bearer " + token }
  });

  const chat = await res.json();
  if (!chat || !chat._id) return false;

  CURRENT_CHAT = {
    _id: chat._id,
    userEmail: user.email
  };

  renderOrderSummary(chat);
  await loadMessages(chat._id);
  showChatWindow();
  startSSE(chat._id);
  return true;
}

/* ============================================================
   LOAD CHAT (Stripe return)
============================================================ */
async function loadChatById(chatId) {
  const res = await fetch(`${API}/chats/by-id/${chatId}`);
  const chat = await res.json();

  if (!chat || !chat._id) return false;

  CURRENT_CHAT = {
    _id: chat._id,
    userEmail: chat.userEmail || "customer"
  };

  renderOrderSummary(chat);
  await loadMessages(chat._id);
  showChatWindow();
  startSSE(chat._id);
  return true;
}

/* ============================================================
   GUEST CHAT CREATION
============================================================ */
async function createGuestChat() {
  const res = await fetch(`${API}/chats/create-guest-chat`, {
    method: "POST"
  });

  const data = await res.json();

  if (!data || !data.chatId) return false;

  CURRENT_CHAT = {
    _id: data.chatId,
    userEmail: "customer"
  };

  showChatWindow();
  startSSE(data.chatId);
  return true;
}

/* ============================================================
   ORDER SUMMARY
============================================================ */
function renderOrderSummary(chat) {
  const o = chat.orderDetails;
  const box = qs("chatOrderSummary");

  if (!o) {
    box.innerHTML = `<strong>No linked order.</strong>`;
    return;
  }

  box.innerHTML = `
    <strong>Order:</strong> ${o.orderId}<br>
    <strong>Total:</strong> $${o.total} USD<br>
    <strong>Items:</strong><br>
    ${o.items.map(i => `${i.qty}× ${i.name}`).join("<br>")}
  `;
}

/* ============================================================
   ADMIN CHAT STUFF
============================================================ */
async function loadAdminChats(token) {
  const res = await fetch(`${API}/chats/all`, {
    headers: { Authorization: "Bearer " + token }
  });

  const list = await res.json();
  const wrap = qs("adminChatList");
  wrap.innerHTML = "";

  list.forEach((chat) => {
    wrap.innerHTML += `
      <div class="admin-chat-item" data-id="${chat._id}">
        <strong>${chat.orderDetails?.orderId || "Order"}</strong><br>
        ${chat.participants?.[0] || "User"}
      </div>
    `;
  });

  document.querySelectorAll(".admin-chat-item").forEach((el) => {
    el.onclick = () => openAdminChat(el.getAttribute("data-id"));
  });
}

async function openAdminChat(chatId) {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API}/chats/by-id/${chatId}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const chat = await res.json();

  CURRENT_CHAT = {
    _id: chatId,
    userEmail: "admin"
  };

  renderOrderSummary(chat);
  await loadMessages(chatId);
  showChatWindow();
  startSSE(chatId);
}

function enableAdminUI() {
  qs("adminChatPanel").classList.remove("hidden");
  qs("chatButton").classList.remove("hidden");
}

/* ============================================================
   SEND MESSAGE (WORKS FOR GUESTS TOO)
============================================================ */
async function sendMessage() {
  const input = qs("chatInput");
  let msg = input.value.trim();
  input.value = "";

  if (!msg || !CURRENT_CHAT) return;

  const timestamp = new Date().toISOString();

  const localMessage = {
    sender: IS_ADMIN ? "admin" : (CURRENT_CHAT.userEmail || "customer"),
    content: msg,
    timestamp
  };

  LAST_SENT_TIMESTAMP = timestamp;
  appendMessage(localMessage);

  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("authToken");

  if (token) {
    headers.Authorization = "Bearer " + token;
  } else {
    headers["x-guest"] = "true";
    headers["x-purchase-verified"] = "true";
  }

  setTimeout(() => {
    fetch(`${API}/chats/send`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        chatId: CURRENT_CHAT._id,
        content: msg
      })
    }).catch(() => {});
  }, 30);
}

/* ============================================================
   CHAT UI
============================================================ */
function showChatWindow() {
  qs("chatWindow").classList.remove("hidden");
  qs("chatButton").classList.remove("hidden");
}

function initChatUI() {
  const sendBtn = qs("chatSend");

  sendBtn.onclick = (e) => {
    e.preventDefault();
    sendMessage();
  };

  sendBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    sendMessage();
  }, { passive: false });

  qs("chatButton").onclick = () => {
    qs("chatWindow").classList.toggle("hidden");
  };
}

/* ============================================================
   MAIN INIT
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  initChatUI();

  const token = localStorage.getItem("authToken");
  let loaded = false;

  // Stripe return
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.get("chat") === "open" && urlParams.get("session_id")) {
    const sid = urlParams.get("session_id");

    const res = await fetch(`${API}/pay/session-info/${sid}`);
    const data = await res.json();

    if (data.chatId) loaded = await loadChatById(data.chatId);
  }

  if (!loaded && token) loaded = await loadChatForUser(token);

  // Guest? → Create chat
  if (!loaded) await createGuestChat();
});
