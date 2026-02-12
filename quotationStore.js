const fs = require("fs");
const path = require("path");

// Centralised quotation storage helpers to keep server.js slim
// NOTE: Vercel/serverless file systems are read-only at runtime, so we
// gracefully degrade to in-memory / no-op persistence there.

const dataDir = path.join(__dirname, "data");
const quotationsFile = path.join(dataDir, "quotations.json");
const IS_EPHEMERAL_FS = !!process.env.VERCEL;

// Ensure storage directory and file exist (only for writable environments)
function ensureStorage() {
  if (IS_EPHEMERAL_FS) return;

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(quotationsFile)) {
    fs.writeFileSync(quotationsFile, JSON.stringify([], null, 2));
  }
}

function loadQuotations() {
  if (IS_EPHEMERAL_FS) {
    // On Vercel we don't have durable disk, so just return an empty list.
    return [];
  }

  ensureStorage();

  try {
    const data = fs.readFileSync(quotationsFile, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveQuotation(quotationData) {
  // Always assign an ID and timestamp so the PDF + API responses are consistent.
  quotationData.id = Date.now();
  quotationData.createdAt = new Date().toISOString();

  if (IS_EPHEMERAL_FS) {
    // On Vercel/serverless, skip disk writes entirely (no persistent storage).
    return quotationData;
  }

  ensureStorage();

  const quotations = loadQuotations();
  quotations.push(quotationData);

  fs.writeFileSync(quotationsFile, JSON.stringify(quotations, null, 2));
  return quotationData;
}

module.exports = {
  loadQuotations,
  saveQuotation,
};

