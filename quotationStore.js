const fs = require("fs");
const path = require("path");

// Centralised quotation storage helpers to keep server.js slim

const dataDir = path.join(__dirname, "data");
const quotationsFile = path.join(dataDir, "quotations.json");

// Ensure storage directory and file exist
function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(quotationsFile)) {
    fs.writeFileSync(quotationsFile, JSON.stringify([], null, 2));
  }
}

function loadQuotations() {
  ensureStorage();

  try {
    const data = fs.readFileSync(quotationsFile, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveQuotation(quotationData) {
  ensureStorage();

  const quotations = loadQuotations();
  quotationData.id = Date.now();
  quotationData.createdAt = new Date().toISOString();
  quotations.push(quotationData);

  fs.writeFileSync(quotationsFile, JSON.stringify(quotations, null, 2));
  return quotationData;
}

module.exports = {
  loadQuotations,
  saveQuotation,
};

