async function loadChatVisibility() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  const res = await fetch("https://website-5eml.onrender.com/chats/my-chats", {
    headers: { Authorization: "Bearer " + token }
  });

  const chat = await res.json();
  if (!chat) return;

  window.USER_CHAT = chat;

  document.getElementById("chatButton").classList.remove("hidden");

  const order = chat.orderDetails;
  document.getElementById("chatOrderSummary").innerHTML = `
    <strong>Order ID:</strong> ${order.orderId}<br>
    <strong>Total:</strong> $${order.total} USD<br>
    <strong>Items:</strong><br>
    ${order.items.map(i => `• ${i.qty}× ${i.name}`).join("<br>")}
  `;
}

document.getElementById("chatButton").onclick = () => {
  document.getElementById("chatWindow").classList.toggle("hidden");
};

async function refreshMessages() {
  if (!window.USER_CHAT) return;
  const token = localStorage.getItem("authToken");

  const res = await fetch(
    `https://website-5eml.onrender.com/chats/messages/${window.USER_CHAT._id}`,
    { headers: { Authorization: "Bearer " + token } }
  );

  const msgs = await res.json();

  const box = document.getElementById("chatMessages");
  box.innerHTML = msgs
    .map(
      (m) => `
      <div class="msg ${
        m.sender === window.USER_CHAT.participants[0] ? "me" : "them"
      }">
        ${m.content}<br>
        <small>${new Date(m.timestamp).toLocaleTimeString()}</small>
      </div>
    `
    )
    .join("");

  box.scrollTop = box.scrollHeight;
}

document.getElementById("chatSend").onclick = async () => {
  const msg = document.getElementById("chatInput").value;
  if (!msg) return;

  document.getElementById("chatInput").value = "";

  const token = localStorage.getItem("authToken");

  await fetch("https://website-5eml.onrender.com/chats/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      chatId: window.USER_CHAT._id,
      content: msg
    })
  });

  refreshMessages();
};

document.addEventListener("DOMContentLoaded", () => {
  loadChatVisibility();
  setInterval(refreshMessages, 2000);
});
