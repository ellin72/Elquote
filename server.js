const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { loadQuotations, saveQuotation } = require("./quotationStore");
const { generateQuotationPdf } = require("./pdfGenerator");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Routes
app.get("/api/quotations", (req, res) => {
  const quotations = loadQuotations();
  res.json(quotations);
});

app.post("/api/generate-pdf", (req, res) => {
  try {
    const quotationData = req.body;

    // Validate required fields
    if (
      !quotationData.clientName ||
      !quotationData.clientEmail ||
      !quotationData.items ||
      quotationData.items.length === 0
    ) {
      return res.status(400).json({
        error: "Missing required fields: clientName, clientEmail, or items",
      });
    }

    // Save quotation to file (also assigns a stable ID)
    const savedQuotation = saveQuotation(quotationData);

    // Delegate PDF creation to the dedicated generator
    generateQuotationPdf(quotationData, res, savedQuotation.id);

    // Handle completion and errors
    return;
  } catch (error) {
    console.error("PDF generation error:", error.message || error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to generate PDF: " + (error.message || "Unknown error"),
      });
    } else {
      res.end();
    }
  }
});

app.post("/api/save-quotation", (req, res) => {
  try {
    if (
      !req.body.clientName ||
      !req.body.clientEmail ||
      !req.body.items ||
      req.body.items.length === 0
    ) {
      return res.status(400).json({
        error: "Missing required fields: clientName, clientEmail, or items",
      });
    }

    const quotation = saveQuotation(req.body);
    res.json({ success: true, quotation });
  } catch (error) {
    console.error("Save error:", error.message || error);
    res.status(500).json({
      error: "Failed to save quotation: " + (error.message || "Unknown error"),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   ELCORP NAMIBIA - QUOTATION GENERATOR               ║
║   Server running on http://localhost:${PORT}              ║
║   Phone: +264 81 7244041                               ║
║   Email: elcorpnamibia@gmail.com                       ║
║   Press Ctrl+C to stop                                 ║
╚════════════════════════════════════════════════════════╝
  `);
});
