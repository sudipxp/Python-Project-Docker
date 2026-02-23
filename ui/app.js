// Base URL of your FastAPI backend (same origin as this UI, under /api)
const API_BASE_URL = "/api";

const els = {
  apiStatus: document.getElementById("api-status"),
  statusDot: document.querySelector("#api-status .status-dot"),
  statusText: document.querySelector("#api-status .status-text"),
  form: document.getElementById("item-form"),
  formTitle: document.getElementById("form-title"),
  formSubtitle: document.getElementById("form-subtitle"),
  submitBtn: document.getElementById("submit-btn"),
  resetBtn: document.getElementById("reset-btn"),
  refreshBtn: document.getElementById("refresh-btn"),
  idInput: document.getElementById("item-id"),
  nameInput: document.getElementById("name"),
  descriptionInput: document.getElementById("description"),
  priceInput: document.getElementById("price"),
  tableBody: document.getElementById("items-body"),
  emptyState: document.getElementById("empty-state"),
  message: document.getElementById("message"),
};

function setStatus({ ok, message }) {
  if (!els.statusDot || !els.statusText) return;

  els.statusDot.classList.remove("status-dot--ok", "status-dot--error", "status-dot--unknown");
  els.statusText.textContent = message;

  if (ok === true) {
    els.statusDot.classList.add("status-dot--ok");
  } else if (ok === false) {
    els.statusDot.classList.add("status-dot--error");
  } else {
    els.statusDot.classList.add("status-dot--unknown");
  }
}

async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error("Health check failed");
    const data = await res.json();
    setStatus({ ok: true, message: `API healthy • ${new Date(data.timestamp).toLocaleTimeString()}` });
  } catch (err) {
    setStatus({ ok: false, message: "API unreachable. Is the FastAPI server running on port 8000?" });
  }
}

function showMessage(text, type = "success") {
  if (!els.message) return;
  els.message.textContent = text;
  els.message.classList.remove("message--hidden", "message--success", "message--error");
  els.message.classList.add(type === "error" ? "message--error" : "message--success");
  setTimeout(() => {
    els.message.classList.add("message--hidden");
  }, 3000);
}

function setFormMode(mode, item) {
  if (mode === "edit" && item) {
    els.formTitle.textContent = "Edit Item";
    els.formSubtitle.textContent = `Editing item #${item.id}`;
    els.submitBtn.textContent = "Save Changes";
  } else {
    els.formTitle.textContent = "Create Item";
    els.formSubtitle.textContent = "Add a new item to your API";
    els.submitBtn.textContent = "Create Item";
    els.idInput.value = "";
  }
}

function resetForm() {
  els.form.reset();
  setFormMode("create");
}

function renderItems(items) {
  els.tableBody.innerHTML = "";

  if (!items || items.length === 0) {
    els.emptyState.style.display = "block";
    return;
  }

  els.emptyState.style.display = "none";

  items.forEach((item) => {
    const tr = document.createElement("tr");

    const createdAt = item.created_at
      ? new Date(item.created_at).toLocaleString()
      : "-";

    tr.innerHTML = `
      <td class="cell-id">#${item.id}</td>
      <td>${item.name}</td>
      <td>${item.description || ""}</td>
      <td class="cell-price">$${Number(item.price).toFixed(2)}</td>
      <td class="cell-created">${createdAt}</td>
      <td>
        <div class="actions">
          <button class="btn btn-small btn-outline" data-action="edit" data-id="${item.id}">Edit</button>
          <button class="btn btn-small btn-danger" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </td>
    `;

    els.tableBody.appendChild(tr);
  });
}

async function loadItems(showToast = false) {
  try {
    const res = await fetch(`${API_BASE_URL}/items`);
    if (!res.ok) throw new Error(`Failed to fetch items (${res.status})`);
    const data = await res.json();
    renderItems(data);
    if (showToast) showMessage("Items refreshed from API");
  } catch (err) {
    console.error(err);
    showMessage("Could not load items from API", "error");
  }
}

async function createItem(payload) {
  const res = await fetch(`${API_BASE_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create item");
  }
  return res.json();
}

async function updateItem(id, payload) {
  const res = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to update item");
  }
  return res.json();
}

async function deleteItem(id) {
  const res = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to delete item");
  }
}

els.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = els.idInput.value ? Number(els.idInput.value) : null;
  const payload = {
    name: els.nameInput.value.trim(),
    description: els.descriptionInput.value.trim() || null,
    price: Number(els.priceInput.value),
  };

  if (!payload.name || Number.isNaN(payload.price)) {
    showMessage("Please provide a valid name and price", "error");
    return;
  }

  els.submitBtn.disabled = true;

  try {
    if (id) {
      await updateItem(id, payload);
      showMessage("Item updated successfully");
    } else {
      await createItem(payload);
      showMessage("Item created successfully");
    }
    resetForm();
    await loadItems();
  } catch (err) {
    console.error(err);
    showMessage(err.message || "Request failed", "error");
  } finally {
    els.submitBtn.disabled = false;
  }
});

els.resetBtn.addEventListener("click", () => {
  resetForm();
});

els.refreshBtn.addEventListener("click", () => {
  loadItems(true);
  checkHealth();
});

els.tableBody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = Number(btn.dataset.id);

  if (action === "edit") {
    const row = btn.closest("tr");
    const cells = row.querySelectorAll("td");
    const item = {
      id,
      name: cells[1].textContent,
      description: cells[2].textContent,
      price: Number(cells[3].textContent.replace("$", "")),
    };

    els.idInput.value = item.id;
    els.nameInput.value = item.name;
    els.descriptionInput.value = item.description;
    els.priceInput.value = item.price;

    setFormMode("edit", item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (action === "delete") {
    const confirmed = window.confirm(`Delete item #${id}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteItem(id);
      showMessage("Item deleted successfully");
      await loadItems();
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Failed to delete item", "error");
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  checkHealth();
  loadItems();
  setInterval(checkHealth, 30000);
});

