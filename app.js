function formatTime24(dateObj) {
  const hh = String(dateObj.getHours()).padStart(2, "0");
  const mm = String(dateObj.getMinutes()).padStart(2, "0");
  const ss = String(dateObj.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function updateThaiDateTime() {
  const now = new Date();
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const day = now.getDate();
  const month = thaiMonths[now.getMonth()];
  const yearBE = now.getFullYear() + 543;

  const el = document.getElementById("thaiDateTime");
  if (el) {
    el.textContent = `วันที่ ${day} ${month} พ.ศ. ${yearBE} เวลา ${formatTime24(now)} น.`;
  }
}

function formatNumber(value) {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "--";
  return Number(value).toLocaleString();
}

function formatCurrency(value) {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "--";
  return Number(value).toLocaleString() + " บาท";
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();

  if (s === "normal" || s === "paid") return "status-normal";
  if (s === "watch" || s === "due") return "status-watch";
  if (s === "alert" || s === "overdue") return "status-alert";
  return "status-unknown";
}

function statusText(status) {
  const s = String(status || "").toLowerCase();

  if (s === "normal") return "Normal";
  if (s === "watch") return "Watch";
  if (s === "alert") return "Alert";
  if (s === "paid") return "Paid";
  if (s === "due") return "Due";
  if (s === "overdue") return "Overdue";
  return "Unknown";
}

function createCardItem(card) {
  return `
    <div class="card">
      <div class="card-title-wrap">
        <div class="card-title-badge">${card.name || "-"}</div>
      </div>

      <div class="main-values">
        <div class="metric-box">
          <div class="label">Used Amount</div>
          <div class="value">${formatNumber(card.usedAmount)}</div>
        </div>
        <div class="metric-box">
          <div class="label">Credit Limit</div>
          <div class="value">${formatNumber(card.creditLimit)}</div>
        </div>
      </div>

      <div class="mid-divider"></div>

      <div class="detail-box">
        <div class="detail-row">
          <div class="detail-name">Bank</div>
          <div class="detail-value">${card.bank || "-"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-name">Statement Day</div>
          <div class="detail-value">${card.statementDay ?? "-"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-name">Due Day</div>
          <div class="detail-value">${card.dueDay ?? "-"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-name">Minimum Payment</div>
          <div class="detail-value">${formatCurrency(card.minPayment)}</div>
        </div>
        <div class="detail-row">
          <div class="detail-name">Full Payment</div>
          <div class="detail-value">${formatCurrency(card.fullPayment)}</div>
        </div>
        <div class="detail-row">
          <div class="detail-name">Note</div>
          <div class="detail-value">${card.note || "-"}</div>
        </div>
      </div>

      <div class="footer-row">
        <div class="footer">
          Status :
          <span class="${statusClass(card.status)}">${statusText(card.status)}</span>
        </div>
        <div class="footer">ID: ${card.id || "-"}</div>
      </div>
    </div>
  `;
}

function createSummaryCard(cards) {
  let normalCount = 0;
  let watchCount = 0;
  let alertCount = 0;

  cards.forEach(card => {
    const s = String(card.status || "").toLowerCase();
    if (s === "normal" || s === "paid") normalCount++;
    else if (s === "watch" || s === "due") watchCount++;
    else if (s === "alert" || s === "overdue") alertCount++;
  });

  const summaryRows = cards.map(card => `
    <div class="summary-row">
      <div class="summary-card-name">${card.name || "-"}</div>
      <div class="summary-card-value">${formatCurrency(card.fullPayment)}</div>
    </div>
  `).join("");

  return `
    <div class="card summary-card">
      <div class="panel-title">Cards Summary</div>

      <div class="summary-top-boxes">
        <div class="summary-mini-box">
          <div class="summary-mini-label">Normal</div>
          <div class="summary-mini-value summary-normal">${normalCount}</div>
        </div>
        <div class="summary-mini-box">
          <div class="summary-mini-label">Watch</div>
          <div class="summary-mini-value summary-watch">${watchCount}</div>
        </div>
        <div class="summary-mini-box">
          <div class="summary-mini-label">Alert</div>
          <div class="summary-mini-value summary-alert">${alertCount}</div>
        </div>
      </div>

      <div class="summary-list">
        ${summaryRows || `<div class="empty-text">No card data</div>`}
      </div>
    </div>
  `;
}

async function loadCards() {
  try {
    const response = await fetch("cards.json");
    if (!response.ok) {
      throw new Error("Failed to load cards.json");
    }

    const data = await response.json();
    const cards = Array.isArray(data.cards) ? data.cards : [];
    const grid = document.getElementById("roomGrid");

    if (!grid) return;

    grid.innerHTML = "";
    grid.insertAdjacentHTML("beforeend", createSummaryCard(cards));

    cards.forEach(card => {
      grid.insertAdjacentHTML("beforeend", createCardItem(card));
    });

    const pageRefreshEl = document.getElementById("pageRefresh");
    if (pageRefreshEl) {
      pageRefreshEl.textContent = "Last refresh: " + (data.updatedAt || formatTime24(new Date())) + " น.";
    }
  } catch (error) {
    console.error(error);

    const grid = document.getElementById("roomGrid");
    if (grid) {
      grid.innerHTML = `<div class="card"><div class="empty-text">Failed to load cards.json</div></div>`;
    }
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  updateThaiDateTime();
  setInterval(updateThaiDateTime, 1000);
  await loadCards();
});