/* ============================================================
   TAMEDBLOX — FIXED CHAT SYSTEM (ADMIN + USER)
   - No auto-opening admin panel
   - Admin panel toggled from navbar button only
   - User chat button still works
   - Stripe webhook chat retry support
============================================================ */

const API = "https://website-5eml.onrender.com";

let ALL_CHATS = [];
let CURRENT_CHAT = null;

/* ============================================================
   PAGE INIT
============================================================ */
document.addEventListener("DOMContentLoaded", () => {

  loadChat();

  // Auto-refresh messages every 2 seconds
  setInterval(() => {
    if (CURRENT_CHAT?._id) refreshMessages();
  }, 2000);

  // USER: Chat circle toggle
  const userChatBtn = document.getElementById("chatButton");
  if (userChatBtn) {
    userChatBtn.onclick = () => {
      document.getElementById("chatWindow").classList.toggle("hidden");
    };
  }

  // ADMIN: Navbar toggle button
  const adminBtn = document.getElementById("adminChatBtn");
  if (adminBtn) {
    adminBtn.onclick = () => {
      const panel = document.getElementById("adminChatPanel");
      panel.classList.toggle("hidden");
    };
  }

  // Send message
  document.getElementById("chatSend").onclick = sendMessage;
});

/* ============================================================
   MAIN LOADER — USER OR ADMIN
============================================================ */
async function loadChat(retry = 0) {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  const userRes = await fetch(`${API}/auth/me`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!userRes.ok) return;
  const user = await userRes.json();

  const ADMIN_EMAIL = user.adminEmail;
  const isAdmin = user.email === ADMIN_EMAIL;

  /* ================================
     ADMIN MODE
  ================================= */
  if (isAdmin) {
    // Do NOT auto-open panel (panel is hidden until navbar button is clicked)
    console.log("Admin logged in — admin mode active");

    // Fetch all chats
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

  let chat = await chatRes.json();

  // Stripe webhook delay → retry loading
  if (!chat) {
    if (retry < 6) {
      console.log("⏳ Waiting for Stripe webhook… retry:", retry + 1);
      return setTimeout(() => loadChat(retry + 1), 500);
    }
    return;
  }

  // Load chat fully
  CURRENT_CHAT = {
    ...chat,
    userEmail: user.email
  };

  renderOrderSummary(chat);
  refreshMessages();

  // User chat button appears
  const circle = document.getElementById("chatButton");
  if (circle) circle.classList.remove("hidden");
}

/* ============================================================
   ADMIN — RENDER CHAT LIST
============================================================ */
function renderAdminChatList() {
  const list = document.getElementById("adminChatList");
  if (!list) return;

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

  // Admin chat window becomes visible
  const chatWin = document.getElementById("chatWindow");
  chatWin.classList.add("admin-mode");
  chatWin.classList.remove("hidden");
}

/* ============================================================
   USER — RENDER ORDER SUMMARY
============================================================ */
function renderOrderSummary(chat) {
  const el = document.getElementById("chatOrderSummary");
  if (!el) return;

  if (!chat.orderDetails) {
    el.innerHTML = `<strong>No order linked.</strong>`;
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
  if (!box) return;

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
  if (!msg) return;

  if (!CURRENT_CHAT || !CURRENT_CHAT._id) {
    console.error("❌ No chat loaded yet.");
    return;
  }

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
