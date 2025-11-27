/* ============================================================
   TamedBlox — FINAL CHAT.JS (LIVE SSE + ANON PURCHASE SUPPORT)
============================================================ */

if (window.__CHAT_JS_LOADED__) {
  console.warn("chat.js already loaded");
} else {
  window.__CHAT_JS_LOADED__ = true;

window.API = window.API || "https://website-5eml.onrender.com";

let CURRENT_CHAT = null;
let ALL_CHATS = [];
let LIVE_STREAM = null;

/* ============================================================
   URL PARAM HANDLING (Stripe)
============================================================ */
const urlParams = new URLSearchParams(window.location.search);
const autoOpen = urlParams.get("chat") === "open";
const sessionIdFromURL = urlParams.get("session_id");

if (autoOpen) {
  localStorage.setItem("HAS_PURCHASED", "yes");
}

/* ============================================================
   TOKEN CLEANER
============================================================ */
function sanitizeToken(t) {
  if (!t || t === "null" || t === "undefined" || t.trim() === "") return null;
  return t;
}

/* ============================================================
   SHOW CHAT ICON IF USER CAN USE CHAT
============================================================ */
async function showChatBubbleIfAllowed() {
  const bubble = document.getElementById("chatButton");
  if (!bubble) return;

  if (localStorage.getItem("HAS_PURCHASED") === "yes") {
    bubble.classList.remove("hidden");
    return;
  }

  const token = sanitizeToken(localStorage.getItem("authToken"));
  if (!token) return;

  const res = await fetch(`${API}/chats/my-chats`, {
    headers: { Authorization: "Bearer " + token }
  });

  const chat = await res.json();
  if (chat && chat._id) {
    bubble.classList.remove("hidden");
    localStorage.setItem("HAS_PURCHASED", "yes");
  }
}

/* ============================================================
   LIVE CHAT STREAM (SSE)
============================================================ */
function startLiveChatStream(chatId) {
  if (!chatId) return;

  if (LIVE_STREAM) {
    LIVE_STREAM.close();
    LIVE_STREAM = null;
  }

  LIVE_STREAM = new EventSource(`${API}/chats/live/${chatId}`);

  LIVE_STREAM.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    appendLiveMessage(msg);
  });

  LIVE_STREAM.onerror = () => {
    console.warn("⚠️ SSE disconnected, reconnecting automatically...");
  };

  console.log("📡 LIVE chat started:", chatId);
}

/* Append new messages instantly */
function appendLiveMessage(msg) {
  const box = document.getElementById("chatMessages");
  if (!box) return;

  box.innerHTML += `
    <div class="msg ${msg.sender === CURRENT_CHAT?.userEmail ? "me" : "them"}">
      ${msg.content}
      <br><small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
    </div>
  `;

  box.scrollTop = box.scrollHeight;
}

/* ============================================================
   LOAD CHAT USING STRIPE SESSION ID (metadata → chatId)
============================================================ */
async function tryLoadChatFromStripeSession() {
  if (!sessionIdFromURL) return false;

  try {
    const r = await fetch(`${API}/pay/session-info/${sessionIdFromURL}`);
    const data = await r.json();

    if (data.chatId) {
      CURRENT_CHAT = { _id: data.chatId, userEmail: "anonymous" };
      localStorage.setItem("HAS_PURCHASED", "yes");

      document.getElementById("chatButton")?.classList.remove("hidden");
      document.getElementById("chatWindow")?.classList.remove("hidden");

      startLiveChatStream(data.chatId);
      refreshMessages();

      return true;
    }
  } catch (err) {
    console.error("Stripe session error:", err);
  }

  return false;
}

/* ============================================================
   LOAD CHAT FOR LOGGED-IN USERS
============================================================ */
async function loadChat() {
  const token = sanitizeToken(localStorage.getItem("authToken"));

  if (token) {
    const meRes = await fetch(`${API}/auth/me`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (meRes.ok) {
      const user = await meRes.json();

      // ADMIN CHAT
      if (user.admin) {
        const r = await fetch(`${API}/chats/all`, {
          headers: { Authorization: "Bearer " + token }
        });

        ALL_CHATS = await r.json();
        renderAdminChatList();
        document.getElementById("chatButton")?.classList.remove("hidden");
        return;
      }

      // USER CHAT
      const r = await fetch(`${API}/chats/my-chats`, {
        headers: { Authorization: "Bearer " + token }
      });

      const chat = await r.json();

      if (chat && chat._id) {
        CURRENT_CHAT = { _id: chat._id, userEmail: user.email };
        document.getElementById("chatButton")?.classList.remove("hidden");

        startLiveChatStream(chat._id);
        refreshMessages();
        return;
      }
    }
  }

  // FALLBACK: anonymous purchaser
  if (localStorage.getItem("HAS_PURCHASED") === "yes") {
    await loadAnonymousChat();
  }
}

/* ============================================================
   LOAD ANONYMOUS CHAT
============================================================ */
async function loadAnonymousChat() {
  const r = await fetch(`${API}/chats/anonymous-latest`, {
    headers: { "X-Purchase-Verified": "true" }
  });

  const chat = await r.json();

  if (chat && chat._id) {
    CURRENT_CHAT = { _id: chat._id, userEmail: "anonymous" };

    startLiveChatStream(chat._id);
    refreshMessages();

    document.getElementById("chatButton")?.classList.remove("hidden");
  }
}

/* ============================================================
   SEND MESSAGE (LIVE)
============================================================ */
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  if (!CURRENT_CHAT?._id) {
    alert("Chat not ready.");
    return;
  }

  input.value = "";

  const token = sanitizeToken(localStorage.getItem("authToken"));
  const purchased = localStorage.getItem("HAS_PURCHASED") === "yes";

  const headers = { "Content-Type": "application/json" };

  if (token) headers.Authorization = "Bearer " + token;
  else if (purchased) headers["X-Purchase-Verified"] = "true";
  else return alert("Log in or purchase to chat.");

  await fetch(`${API}/chats/send`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      chatId: CURRENT_CHAT._id,
      content: msg
    })
  });
}

/* ============================================================
   REFRESH MESSAGES (ONLY FOR INITIAL LOAD)
============================================================ */
async function refreshMessages() {
  if (!CURRENT_CHAT?._id) return;

  const token = sanitizeToken(localStorage.getItem("authToken"));
  const headers = {};

  if (token) headers.Authorization = "Bearer " + token;
  else headers["X-Purchase-Verified"] = "true";

  const r = await fetch(`${API}/chats/messages/${CURRENT_CHAT._id}`, {
    headers
  });

  const messages = await r.json();
  renderMessages(messages);
}

/* Render full history */
function renderMessages(messages) {
  const box = document.getElementById("chatMessages");

  box.innerHTML = messages
    .map(
      (m) => `
      <div class="msg ${m.sender === CURRENT_CHAT?.userEmail ? "me" : "them"}">
        ${m.content}
        <br><small>${new Date(m.timestamp).toLocaleTimeString()}</small>
      </div>
    `
    )
    .join("");

  box.scrollTop = box.scrollHeight;
}

/* ============================================================
   ADMIN CHAT LIST
============================================================ */
function renderAdminChatList() {
  const list = document.getElementById("adminChatList");

  list.innerHTML = ALL_CHATS.map(
    (c) => `
      <div class="admin-chat-item" onclick="openAdminChat('${c._id}')">
        <strong>${c.orderDetails?.orderId || "Order"}</strong><br>
        ${c.participants[0]}
      </div>
    `
  ).join("");
}

window.openAdminChat = async function (chatId) {
  const token = sanitizeToken(localStorage.getItem("authToken"));

  CURRENT_CHAT = { _id: chatId, userEmail: "admin" };

  const r = await fetch(`${API}/chats/messages/${chatId}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const messages = await r.json();
  renderMessages(messages);

  startLiveChatStream(chatId);

  document.getElementById("chatWindow")?.classList.remove("hidden");
};

/* ============================================================
   DOMContentLoaded (FINAL LIVE VERSION)
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  showChatBubbleIfAllowed();

  // 1️⃣ Try loading chat via Stripe session
  const loadedFromStripe = await tryLoadChatFromStripeSession();

  // 2️⃣ If not loaded, fallback to normal system
  if (!loadedFromStripe) {
    await loadChat();
  }

  // 3️⃣ Chat bubble toggle
  const bubble = document.getElementById("chatButton");
  if (bubble) {
    bubble.onclick = () =>
      document.getElementById("chatWindow")?.classList.toggle("hidden");
  }

  // 4️⃣ Send button
  document
    .getElementById("chatSend")
    ?.addEventListener("click", sendMessage);

  // 5️⃣ Auto-open (backup)
  if (autoOpen && CURRENT_CHAT?._id) {
    setTimeout(() => {
      document.getElementById("chatButton")?.classList.remove("hidden");
      document.getElementById("chatWindow")?.classList.remove("hidden");
    }, 300);
  }
});

} // END WRAPPER
