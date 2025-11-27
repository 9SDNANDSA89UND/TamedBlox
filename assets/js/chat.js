/* ============================================================
   TamedBlox Chat System — FINAL FRONTEND VERSION
   ✔ Instant messages
   ✔ SSE live updates
   ✔ Duplicate prevention
   ✔ Admin close ticket included
============================================================ */

console.log("%c[TAMEDBLOX CHAT] Loaded", "color:#4ef58a;font-weight:900;");

window.API = "https://website-5eml.onrender.com";

let CURRENT_CHAT = null;
let IS_ADMIN = false;

// ⭐ Tracks last message timestamp to prevent duplicates
let LAST_SENT_TIMESTAMP = null;

/* ============================================================
   SSE STREAM
============================================================ */
let evtSrc = null;

function startSSE(chatId) {
  if (evtSrc) evtSrc.close();

  evtSrc = new EventSource(`${API}/chats/stream/${chatId}`);

  evtSrc.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      appendMessage(msg);

      // If ticket was closed by admin via SSE
      if (msg.closed === true) {
        qs("chatInput").disabled = true;
        qs("chatSend").disabled = true;
      }
    } catch (err) {
      console.warn("SSE parse error:", err);
    }
  };
}

/* ============================================================
   HELPERS
============================================================ */
function qs(id) {
  return document.getElementById(id);
}

/* ============================================================
   BUBBLE DETECTION LOGIC
============================================================ */
function isMine(m) {
  if (IS_ADMIN && m.sender === "admin") return true;
  if (!IS_ADMIN && m.sender === CURRENT_CHAT.userEmail) return true;
  return false;
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

/* ============================================================
   SAFE APPEND (NO DUPLICATES)
============================================================ */
function appendMessage(msg) {
  // Prevent duplicate messages from SSE echo
  if (msg.timestamp === LAST_SENT_TIMESTAMP) {
    return;
  }

  const box = qs("chatMessages");
  if (!box) return;

  box.innerHTML += createMsgHTML(msg);
  box.scrollTop = box.scrollHeight;
}

/* ============================================================
   LOAD MESSAGES
============================================================ */
async function loadMessages(chatId) {
  const res = await fetch(`${API}/chats/messages/${chatId}`);
  const msgs = await res.json();

  const box = qs("chatMessages");
  box.innerHTML = msgs.map(createMsgHTML).join("");
  box.scrollTop = box.scrollHeight;

  // Lock UI if last message indicates chat is closed
  if (msgs.length && msgs[msgs.length - 1].closed === true) {
    qs("chatInput").disabled = true;
    qs("chatSend").disabled = true;
  }
}

/* ============================================================
   LOAD CHAT (LOGGED-IN USER)
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
   LOAD CHAT BY ID (STRIPE BUYER)
============================================================ */
async function loadChatById(chatId) {
  try {
    const res = await fetch(`${API}/chats/by-id/${chatId}`);
    const chat = await res.json();

    if (!chat || !chat._id) return false;

    CURRENT_CHAT = {
      _id: chat._id,
      userEmail: "anonymous"
    };

    renderOrderSummary(chat);
    await loadMessages(chat._id);
    showChatWindow();

    startSSE(chat._id);
    return true;

  } catch (err) {
    console.error("loadChatById error:", err);
    return false;
  }
}

/* ============================================================
   ADMIN MODE
============================================================ */
async function loadAdminChats(token) {
  const res = await fetch(`${API}/chats/all`, {
    headers: { Authorization: "Bearer " + token }
  });

  const list = await res.json();
  const wrap = qs("adminChatList");
  wrap.innerHTML = "";

  if (!Array.isArray(list)) return;

  list.forEach((chat) => {
    wrap.innerHTML += `
      <div class="admin-chat-item" onclick="openAdminChat('${chat._id}')">
        <strong>${chat.orderDetails?.orderId || "Unknown Order"}</strong><br>
        ${chat.participants?.[0] || "Unknown User"}
      </div>
    `;
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

  // ⭐ Required SSE fix for admins switching chats
  startSSE(chatId);
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
   CLOSE TICKET (ADMIN)
============================================================ */
async function closeTicket() {
  if (!CURRENT_CHAT) return;

  const token = localStorage.getItem("authToken");
  if (!IS_ADMIN) return alert("Only admins can close tickets.");

  await fetch(`${API}/chats/close`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ chatId: CURRENT_CHAT._id })
  });

  qs("chatInput").disabled = true;
  qs("chatSend").disabled = true;

  appendMessage({
    system: true,
    content: "This ticket has been closed.",
    timestamp: new Date()
  });
}

/* ============================================================
   SEND MESSAGE — INSTANT MSG + SSE SAFE
============================================================ */
async function sendMessage() {
  const input = qs("chatInput");
  const msg = input.value.trim();
  if (!msg || !CURRENT_CHAT) return;
  if (input.disabled) return; // ticket closed

  input.value = "";

  const timestamp = new Date().toISOString();

  // ⭐ Instant local message
  const localMessage = {
    sender: IS_ADMIN ? "admin" : CURRENT_CHAT.userEmail,
    content: msg,
    timestamp
  };

  LAST_SENT_TIMESTAMP = timestamp;
  appendMessage(localMessage);

  const token = localStorage.getItem("authToken");
  const headers = { "Content-Type": "application/json" };

  if (IS_ADMIN) {
    headers.Authorization = "Bearer " + token;
  } else if (token) {
    headers.Authorization = "Bearer " + token;
  } else {
    headers["x-purchase-verified"] = "true";
  }

  fetch(`${API}/chats/send`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      chatId: CURRENT_CHAT._id,
      content: msg
    })
  });
}

/* ============================================================
   UI
============================================================ */
function enableAdminUI() {
  qs("adminChatPanel").classList.remove("hidden");
  qs("chatButton").classList.remove("hidden");

  const closeBtn = document.createElement("button");
  closeBtn.id = "closeTicketBtn";
  closeBtn.innerText = "Close Ticket";
  closeBtn.style =
    "background:#ff4b4b;color:white;padding:10px;margin:10px;border-radius:10px;width:90%;cursor:pointer;";
  closeBtn.onclick = closeTicket;

  qs("chatWindow").prepend(closeBtn);
}

function showChatWindow() {
  qs("chatWindow").classList.remove("hidden");
  qs("chatButton").classList.remove("hidden");
}

function initChatUI() {
  qs("chatSend").onclick = sendMessage;

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

  // Case 1 — Stripe purchase return
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.get("chat") === "open" && urlParams.get("session_id")) {
    const sid = urlParams.get("session_id");

    const res = await fetch(`${API}/pay/session-info/${sid}`);
    const data = await res.json();

    if (data.chatId) {
      loaded = await loadChatById(data.chatId);
      localStorage.setItem("HAS_PURCHASED", "yes");
    }
  }

  // Case 2 — Logged-in user
  if (!loaded && token) {
    loaded = await loadChatForUser(token);
  }

  // Case 3 — Hide chat button if no access
  if (!loaded) {
    qs("chatButton").classList.add("hidden");
    qs("chatWindow").classList.add("hidden");
  }
});
