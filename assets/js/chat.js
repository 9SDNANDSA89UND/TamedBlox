/* ============================================================
   TamedBlox — Fully Patched Chat.js
   - Anonymous send (if purchased)
   - Safe token handling (no malformed JWT)
   - Auto-open on ?chat=open
   - Works for admin + users
   - No duplicate load
============================================================ */

if (window.__CHAT_JS_LOADED__) {
  console.warn("chat.js already loaded");
} else {
  window.__CHAT_JS_LOADED__ = true;

window.API = window.API || "https://website-5eml.onrender.com";

let CURRENT_CHAT = null;
let ALL_CHATS = [];

/* ============================================================
   AUTO-OPEN CHAT AFTER PURCHASE
============================================================ */
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("chat") === "open") {
  localStorage.setItem("HAS_PURCHASED", "yes");
  window.__OPEN_CHAT_ON_LOAD__ = true;
}

/* ============================================================
   SHOW CHAT BUBBLE IF PURCHASED OR CHAT EXISTS
============================================================ */
async function showChatBubbleIfPurchased() {
  const bubble = document.getElementById("chatButton");
  if (!bubble) return;

  if (localStorage.getItem("HAS_PURCHASED") === "yes") {
    bubble.classList.remove("hidden");
    return;
  }

  const token = localStorage.getItem("authToken");
  const safeToken = token && token !== "null" && token !== "undefined" ? token : null;

  if (!safeToken) return;

  try {
    const r = await fetch(`${API}/chats/my-chats`, {
      headers: { Authorization: "Bearer " + safeToken }
    });

    const chat = await r.json();
    if (chat && chat._id) {
      bubble.classList.remove("hidden");
      localStorage.setItem("HAS_PURCHASED", "yes");
    }
  } catch {}
}

/* ============================================================
   INITIAL SETUP
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  showChatBubbleIfPurchased();
  loadChat();

  setInterval(() => {
    if (CURRENT_CHAT?._id) refreshMessages();
  }, 2000);

  const bubble = document.getElementById("chatButton");
  if (bubble) {
    bubble.onclick = () => {
      const token = localStorage.getItem("authToken");
      const safeToken = token && token !== "null" && token !== "undefined" ? token : null;
      const purchased = localStorage.getItem("HAS_PURCHASED") === "yes";

      if (!safeToken && !purchased) {
        openModal("loginModal");
        return;
      }

      document.getElementById("chatWindow").classList.toggle("hidden");
    };
  }

  const sendBtn = document.getElementById("chatSend");
  if (sendBtn) sendBtn.onclick = sendMessage;

  if (window.__OPEN_CHAT_ON_LOAD__) {
    setTimeout(() => {
      document.getElementById("chatButton")?.classList.remove("hidden");
      document.getElementById("chatWindow")?.classList.remove("hidden");
    }, 400);
  }
});

/* ============================================================
   LOAD CHAT (ADMIN OR USER)
============================================================ */
async function loadChat() {
  const token = localStorage.getItem("authToken");
  const safeToken = token && token !== "null" && token !== "undefined" ? token : null;

  if (!safeToken) return;

  const meRes = await fetch(`${API}/auth/me`, {
    headers: { Authorization: "Bearer " + safeToken }
  });

  if (!meRes.ok) return;

  const user = await meRes.json();

  if (user.admin) {
    const allRes = await fetch(`${API}/chats/all`, {
      headers: { Authorization: "Bearer " + safeToken }
    });

    ALL_CHATS = await allRes.json();
    renderAdminChatList();
    document.getElementById("chatButton")?.classList.remove("hidden");
    return;
  }

  const chatRes = await fetch(`${API}/chats/my-chats`, {
    headers: { Authorization: "Bearer " + safeToken }
  });

  const chat = await chatRes.json();

  if (chat && chat._id) {
    CURRENT_CHAT = { ...chat, userEmail: user.email };
    localStorage.setItem("HAS_PURCHASED", "yes");
    document.getElementById("chatButton")?.classList.remove("hidden");
    refreshMessages();
  }
}

/* ============================================================
   REFRESH MESSAGES
============================================================ */
async function refreshMessages() {
  if (!CURRENT_CHAT?._id) return;

  const token = localStorage.getItem("authToken");
  const safeToken = token && token !== "null" && token !== "undefined" ? token : null;

  const headers = {};
  if (safeToken) headers.Authorization = "Bearer " + safeToken;
  else headers["X-Purchase-Verified"] = "true";

  const res = await fetch(`${API}/chats/messages/${CURRENT_CHAT._id}`, {
    headers
  });

  renderMessages(await res.json());
}

/* ============================================================
   SEND MESSAGE (LOGIN OR ANON PURCHASED)
============================================================ */
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  input.value = "";

  const token = localStorage.getItem("authToken");
  const safeToken = token && token !== "null" && token !== "undefined" ? token : null;
  const purchased = localStorage.getItem("HAS_PURCHASED") === "yes";

  if (!safeToken && !purchased) {
    openModal("loginModal");
    return;
  }

  if (!CURRENT_CHAT?._id) {
    alert("Chat not ready.");
    return;
  }

  const headers = { "Content-Type": "application/json" };

  if (safeToken) headers.Authorization = "Bearer " + safeToken;
  else headers["X-Purchase-Verified"] = "true";

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
   VIEW SUPPORT FUNCTIONS
============================================================ */
function renderMessages(msgs) {
  const box = document.getElementById("chatMessages");
  if (!box) return;

  box.innerHTML = msgs.map(m => `
    <div class="msg ${m.sender === CURRENT_CHAT?.userEmail ? "me" : "them"}">
      ${m.content}
      <br><small>${new Date(m.timestamp).toLocaleTimeString()}</small>
    </div>
  `).join("");

  box.scrollTop = box.scrollHeight;
}

function renderAdminChatList() {
  const list = document.getElementById("adminChatList");
  if (!list) return;

  list.innerHTML = ALL_CHATS.map(c => `
    <div class="admin-chat-item" onclick="openAdminChat('${c._id}')">
      <strong>${c.orderDetails?.orderId || "No Order"}</strong><br>
      ${c.participants[0]}
    </div>
  `).join("");
}

window.openAdminChat = async function (chatId) {
  const token = localStorage.getItem("authToken");
  const safeToken = token && token !== "null" && token !== "undefined" ? token : null;

  CURRENT_CHAT = { _id: chatId, userEmail: "admin" };

  const res = await fetch(`${API}/chats/messages/${chatId}`, {
    headers: { Authorization: "Bearer " + safeToken }
  });

  renderMessages(await res.json());

  document.getElementById("chatWindow")?.classList.remove("hidden");
};

} // end wrapper
