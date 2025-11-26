/* ============================================================
   TamedBlox — FINAL CHAT.JS (ANON PURCHASE SUPPORT + NO ERRORS)
============================================================ */

if (window.__CHAT_JS_LOADED__) {
  console.warn("chat.js already loaded");
} else {
  window.__CHAT_JS_LOADED__ = true;

window.API = window.API || "https://website-5eml.onrender.com";

let CURRENT_CHAT = null;
let ALL_CHATS = [];

/* ============================================================
   URL PARAM HANDLER
============================================================ */
const urlParams = new URLSearchParams(window.location.search);
const autoOpen = urlParams.get("chat") === "open";
const sessionIdFromURL = urlParams.get("session_id");

/* Mark purchased if ?chat=open */
if (autoOpen) {
  localStorage.setItem("HAS_PURCHASED", "yes");
}

/* ============================================================
   SAFE TOKEN CLEANER
============================================================ */
function sanitizeToken(t) {
  if (!t || t === "null" || t === "undefined" || t.trim() === "") return null;
  return t;
}

/* ============================================================
   SHOW CHAT BUBBLE IF USER SHOULD SEE IT
============================================================ */
async function showChatBubbleIfAllowed() {
  const bubble = document.getElementById("chatButton");
  if (!bubble) return;

  // Already purchased
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
   🟢 PART 2 — LOAD CHAT FROM STRIPE SESSION METADATA
============================================================ */
async function tryLoadChatFromStripeSession() {
  if (!sessionIdFromURL) return false;

  try {
    const r = await fetch(`${API}/pay/session-info/${sessionIdFromURL}`);
    const data = await r.json();

    if (data.chatId) {
      CURRENT_CHAT = { _id: data.chatId, userEmail: "anonymous" };
      localStorage.setItem("HAS_PURCHASED", "yes");

      // Show chat button + open chat
      document.getElementById("chatButton")?.classList.remove("hidden");
      document.getElementById("chatWindow")?.classList.remove("hidden");

      refreshMessages();

      return true;
    }
  } catch (err) {
    console.error("Stripe session chat load fail:", err);
  }

  return false;
}

/* ============================================================
   LOAD CHAT (WHEN LOGGED IN)
============================================================ */
async function loadChat() {
  const token = sanitizeToken(localStorage.getItem("authToken"));

  if (token) {
    const meRes = await fetch(`${API}/auth/me`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (meRes.ok) {
      const user = await meRes.json();

      // Admin mode
      if (user.admin) {
        const allRes = await fetch(`${API}/chats/all`, {
          headers: { Authorization: "Bearer " + token }
        });

        ALL_CHATS = await allRes.json();
        renderAdminChatList();
        document.getElementById("chatButton")?.classList.remove("hidden");
        return;
      }

      // User chat
      const chatRes = await fetch(`${API}/chats/my-chats`, {
        headers: { Authorization: "Bearer " + token }
      });

      const chat = await chatRes.json();

      if (chat && chat._id) {
        CURRENT_CHAT = { _id: chat._id, userEmail: user.email };
        document.getElementById("chatButton")?.classList.remove("hidden");
        refreshMessages();
        return;
      }
    }
  }

  // Anonymous fallback
  if (localStorage.getItem("HAS_PURCHASED") === "yes") {
    await loadAnonymousChat();
  }
}

/* ============================================================
   ANONYMOUS CHAT LOADER
============================================================ */
async function loadAnonymousChat() {
  const res = await fetch(`${API}/chats/anonymous-latest`, {
    headers: { "X-Purchase-Verified": "true" }
  });

  const chat = await res.json();

  if (chat && chat._id) {
    CURRENT_CHAT = { _id: chat._id, userEmail: "anonymous" };
    document.getElementById("chatButton")?.classList.remove("hidden");
    refreshMessages();
  }
}

/* ============================================================
   SEND MESSAGE
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
  else return alert("You must log in or purchase to use chat.");

  await fetch(`${API}/chats/send`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      chatId: CURRENT_CHAT._id,
      content: msg
    })
  });

  refreshMessages();
}

/* ============================================================
   REFRESH MESSAGES
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

/* ============================================================
   RENDER MESSAGES
============================================================ */
function renderMessages(messages) {
  const box = document.getElementById("chatMessages");
  if (!box) return;

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
   ADMIN LIST
============================================================ */
function renderAdminChatList() {
  const list = document.getElementById("adminChatList");
  if (!list) return;

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

  const msgs = await r.json();
  renderMessages(msgs);

  document.getElementById("chatWindow")?.classList.remove("hidden");
};

/* ============================================================
   🟢 PART 3 — UPDATED DOMContentLoaded (FINAL)
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  showChatBubbleIfAllowed();

  // 1️⃣ Try loading chat via Stripe session metadata
  const loadedFromStripe = await tryLoadChatFromStripeSession();

  // 2️⃣ Fallback: load logged-in chat or anonymous chat
  if (!loadedFromStripe) {
    await loadChat();
  }

  // 3️⃣ Auto refresh
  setInterval(() => {
    if (CURRENT_CHAT?._id) refreshMessages();
  }, 2000);

  // 4️⃣ Chat bubble toggle
  const bubble = document.getElementById("chatButton");
  if (bubble) {
    bubble.onclick = () => {
      document.getElementById("chatWindow")?.classList.toggle("hidden");
    };
  }

  // 5️⃣ Send button
  document.getElementById("chatSend")?.addEventListener("click", sendMessage);

  // 6️⃣ Auto-open (backup)
  if (autoOpen) {
    setTimeout(() => {
      document.getElementById("chatButton")?.classList.remove("hidden");
      document.getElementById("chatWindow")?.classList.remove("hidden");
    }, 300);
  }
});

} // END WRAPPER
