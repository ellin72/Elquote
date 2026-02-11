// =====================
// INITIALIZATION
// =====================

// Set today's date as default
document.getElementById("quotationDate").valueAsDate = new Date();

// Initialize with one empty item
window.addEventListener("load", () => {
  addItem();
  updateCalculations();
});

// =====================
// ITEM MANAGEMENT
// =====================

function addItem() {
  const template = document.getElementById("itemTemplate");
  const clone = template.content.cloneNode(true);
  const tableBody = document.getElementById("itemsTableBody");

  tableBody.appendChild(clone);

  // Add event listeners to the new inputs
  const newRow = tableBody.lastElementChild;
  const inputs = newRow.querySelectorAll(
    'input[type="number"], input[type="text"]',
  );

  inputs.forEach((input) => {
    input.addEventListener("change", updateCalculations);
    input.addEventListener("input", updateCalculations);
  });
}

function removeItem(button) {
  const row = button.closest("tr");
  row.remove();
  updateCalculations();
}

// =====================
// CALCULATIONS
// =====================

function updateCalculations() {
  // Calculate subtotal from all rows
  let subtotal = 0;
  const rows = document.querySelectorAll("#itemsTableBody tr");

  rows.forEach((row) => {
    const quantity = parseFloat(row.querySelector(".item-quantity").value) || 0;
    const unitPrice =
      parseFloat(row.querySelector(".item-unitPrice").value) || 0;
    const itemTotal = quantity * unitPrice;
    subtotal += itemTotal;

    // Update item total display in the table
    const totalCell = row.querySelector(".item-total");
    if (totalCell) {
      totalCell.textContent = formatCurrency(itemTotal);
    }
  });

  // Get discount and tax rates
  const discountPercent =
    parseFloat(document.getElementById("discountPercent").value) || 0;
  const taxPercent =
    parseFloat(document.getElementById("taxPercent").value) || 0;

  // Calculate discount
  const discountAmount = (subtotal * discountPercent) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;

  // Calculate tax
  const taxAmount = (subtotalAfterDiscount * taxPercent) / 100;

  // Calculate grand total
  const grandTotal = subtotalAfterDiscount + taxAmount;

  // Update display
  document.getElementById("subtotal").textContent = formatCurrency(subtotal);

  // Show/hide discount
  const discountLabel = document.getElementById("discountLabel");
  const discountDisplay = document.getElementById("discountAmount");

  if (discountPercent > 0) {
    discountLabel.style.display = "block";
    discountDisplay.style.display = "block";
    discountDisplay.textContent = "-" + formatCurrency(discountAmount);
  } else {
    discountLabel.style.display = "none";
    discountDisplay.style.display = "none";
  }

  document.getElementById("taxAmount").textContent = formatCurrency(taxAmount);
  document.getElementById("grandTotal").textContent =
    formatCurrency(grandTotal);
}

function getItems() {
  const items = [];
  const rows = document.querySelectorAll("#itemsTableBody tr");

  rows.forEach((row) => {
    const name = row.querySelector(".item-name").value;
    const description = row.querySelector(".item-description").value;
    const quantity = parseFloat(row.querySelector(".item-quantity").value) || 0;
    const unitPrice =
      parseFloat(row.querySelector(".item-unitPrice").value) || 0;

    if (name && description && quantity && unitPrice) {
      items.push({ name, description, quantity, unitPrice });
    }
  });

  return items;
}

function formatCurrency(amount) {
  return "N$" + parseFloat(amount).toFixed(2);
}

// =====================
// QUOTATION GENERATION
// =====================

async function generatePDF() {
  if (!validateForm()) {
    return;
  }

  const quotationData = getQuotationData();

  try {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quotationData),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    // Get the PDF blob and download it
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quotation-${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

    showSuccess("Quotation PDF generated successfully!");
  } catch (error) {
    console.error("PDF generation error:", error);
    showError("Failed to generate PDF. Please try again.");
  }
}

async function saveQuotation() {
  if (!validateForm()) {
    return;
  }

  const quotationData = getQuotationData();

  try {
    const response = await fetch("/api/save-quotation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quotationData),
    });

    if (!response.ok) {
      throw new Error("Failed to save quotation");
    }

    const result = await response.json();
    showSuccess(`Quotation saved successfully! ID: ${result.quotation.id}`);
  } catch (error) {
    console.error("Save error:", error);
    showError("Failed to save quotation. Please try again.");
  }
}

function getQuotationData() {
  return {
    clientName: document.getElementById("clientName").value,
    clientEmail: document.getElementById("clientEmail").value,
    clientPhone: document.getElementById("clientPhone").value,
    quotationDate: document.getElementById("quotationDate").value,
    items: getItems(),
    discount: parseFloat(document.getElementById("discountPercent").value) || 0,
    tax: parseFloat(document.getElementById("taxPercent").value) || 0,
  };
}

function validateForm() {
  const clientName = document.getElementById("clientName").value.trim();
  const clientEmail = document.getElementById("clientEmail").value.trim();
  const clientPhone = document.getElementById("clientPhone").value.trim();
  const items = getItems();

  if (!clientName) {
    showError("Please enter client name");
    return false;
  }

  if (!clientEmail || !isValidEmail(clientEmail)) {
    showError("Please enter a valid email address");
    return false;
  }

  if (!clientPhone) {
    showError("Please enter client phone number");
    return false;
  }

  if (items.length === 0) {
    showError("Please add at least one product/service");
    return false;
  }

  return true;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// =====================
// FORM MANAGEMENT
// =====================

function resetForm() {
  if (
    confirm(
      "Are you sure you want to reset the form? This action cannot be undone.",
    )
  ) {
    document.getElementById("clientName").value = "";
    document.getElementById("clientEmail").value = "";
    document.getElementById("clientPhone").value = "";
    document.getElementById("quotationDate").valueAsDate = new Date();
    document.getElementById("discountPercent").value = "0";
    document.getElementById("taxPercent").value = "15";

    // Clear items and add one empty row
    document.getElementById("itemsTableBody").innerHTML = "";
    addItem();
    updateCalculations();
  }
}

// =====================
// NOTIFICATIONS
// =====================

function showSuccess(message) {
  showNotification(message, "success");
}

function showError(message) {
  showNotification(message, "error");
}

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 400px;
    `;

  if (type === "success") {
    notification.style.backgroundColor = "#27AE60";
    notification.style.color = "white";
    notification.innerHTML = "✓ " + message;
  } else {
    notification.style.backgroundColor = "#E74C3C";
    notification.style.color = "white";
    notification.innerHTML = "✕ " + message;
  }

  document.body.appendChild(notification);

  // Add animation
  const style = document.createElement("style");
  if (!document.querySelector("style[data-notification-animation]")) {
    style.setAttribute("data-notification-animation", "1");
    style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
    document.head.appendChild(style);
  }

  // Remove after 4 seconds
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// =====================
// EVENT LISTENERS
// =====================

document
  .getElementById("discountPercent")
  .addEventListener("change", updateCalculations);
document
  .getElementById("discountPercent")
  .addEventListener("input", updateCalculations);
document
  .getElementById("taxPercent")
  .addEventListener("change", updateCalculations);
document
  .getElementById("taxPercent")
  .addEventListener("input", updateCalculations);
