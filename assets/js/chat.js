/* ============================================================
   TamedBlox — CHAT SYSTEM (FINAL PATCHED + PURCHASE LOGIC)
   - Prevents duplicate loading
   - Fixes API redeclare
   - Fixes illegal return
   - Shows chat icon ONLY if user has purchased
   - Works for logged-out purchased users
   - Supports admin mode + user chats
============================================================ */

// ========= SAFE WRAPPER (NO DUPLICATE LOAD) ========= //
if (window.__CHAT_JS_LOADED__) {
  console.warn("chat.js already loaded — skipping duplicate load.");
} else {
  window.__CHAT_JS_LOADED__ = true;

// ========= SAFE API DEFINE (NO REDECLARE) ========= //
window.API = window.API || "https://website-5eml.onrender.com";

let ALL_CHATS = [];
let CURRENT_CHAT = null;

/* ============================================================
   PURCHASE-BASED CHAT BUBBLE VISIBILITY
============================================================ */
async function showChatBubbleIfPurchased() {
  const bubble = document.getElementById("chatButton");
  if (!bubble) return;

  // --- Case 1: LocalStorage says they purchased
  if (localStorage.getItem("HAS_PURCHASED") === "yes") {
    bubble.classList.remove("hidden");
    return;
  }

  // --- Case 2: Logged-in user w/ an active chat
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      const res = await fetch(`${API}/chats/my-chats`, {
        headers: { Authorization: "Bearer " + token }
      });

      const chat = await res.json();
      if (chat && chat._id) {
        bubble.classList.remove("hidden");
        localStorage.setItem("HAS_PURCHASED", "yes");
      }
    } catch {}
  }
}

/* ============================================================
   INITIAL SETUP
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  showChatBubbleIfPurchased();
  loadChat();

  // Auto-refresh messages every 2 seconds
  setInterval(() => {
    if (CURRENT_CHAT?._id) refreshMessages();
  }, 2000);

  // =========== USER CHAT BUTTON CLICK ===========
  const chatBtn = document.getElementById("chatButton");
  if (chatBtn) {
    chatBtn.onclick = () => {
      const token = localStorage.getItem("authToken");

      // If not logged in but HAS_PURCHASED → force login
      if (!token) {
        if (typeof openModal === "function") openModal("loginModal");
        return;
      }

      // Logged-in → toggle chat
      document.getElementById("chatWindow").classList.toggle("hidden");
    };
  }

  // =========== ADMIN CHAT PANEL BUTTON ===========
  const adminBtn = document.getElementById("adminChatBtn");
  if (adminBtn) {
    adminBtn.onclick = () => {
      const panel = document.getElementById("adminChatPanel");
      panel.classList.toggle("hidden");
    };
  }

  // =========== SEND MESSAGE BUTTON ===========
  const sendBtn = document.getElementById("chatSend");
  if (sendBtn) sendBtn.onclick = sendMessage;
});

/* ============================================================
   LOAD CHAT BASED ON USER ROLE
============================================================ */
async function loadChat() {
  const token = localStorage.getItem("authToken");
  if (!token) return; // logged-out user will still see bubble if purchased

  const userRes = await fetch(`${API}/auth/me`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!userRes.ok) return; // token invalid
  const user = await userRes.json();

  /* ========= ADMIN MODE ========= */
  if (user.admin === true) {
    const allRes = await fetch(`${API}/chats/all`, {
      headers: { Authorization: "Bearer " + token }
    });

    ALL_CHATS = await allRes.json();
    renderAdminChatList();

    // Admins ALWAYS see chat bubble
    document.getElementById("chatButton")?.classList.remove("hidden");
    return;
  }

  /* ========= USER MODE ========= */
  const chatRes = await fetch(`${API}/chats/my-chats`, {
    headers: { Authorization: "Bearer " + token }
  });

  const chat = await chatRes.json();

  // If user has a chat, show bubble + load chat
  if (chat && chat._id) {
    CURRENT_CHAT = { ...chat, userEmail: user.email };
    localStorage.setItem("HAS_PURCHASED", "yes");
    document.getElementById("chatButton")?.classList.remove("hidden");

    renderOrderSummary(chat);
    refreshMessages();
  }
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
   ADMIN — OPEN SPECIFIC CHAT
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

  const win = document.getElementById("chatWindow");
  win.classList.add("admin-mode");
  win.classList.remove("hidden");
}

/* ============================================================
   USER — RENDER ORDER SUMMARY
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
    ${o.items.map((i) => `• ${i.qty}× ${i.name}`).join("<br>")}
  `;
}

/* ============================================================
   RENDER CHAT MESSAGES
============================================================ */
function renderMessages(msgs) {
  const box = document.getElementById("chatMessages");
  if (!box) return;

  box.innerHTML = msgs
    .map(
      (m) => `
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
   AUTO-REFRESH MESSAGES
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

/* ============================================================
   END SAFE WRAPPER
============================================================ */
} // end wrapper
