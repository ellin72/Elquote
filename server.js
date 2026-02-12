const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Data storage path
const dataDir = path.join(__dirname, "data");
const quotationsFile = path.join(dataDir, "quotations.json");

// Initialize quotations file if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(quotationsFile)) {
  fs.writeFileSync(quotationsFile, JSON.stringify([], null, 2));
}

// Helper functions
function loadQuotations() {
  try {
    const data = fs.readFileSync(quotationsFile, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveQuotation(quotationData) {
  const quotations = loadQuotations();
  quotationData.id = Date.now();
  quotationData.createdAt = new Date().toISOString();
  quotations.push(quotationData);
  fs.writeFileSync(quotationsFile, JSON.stringify(quotations, null, 2));
  return quotationData;
}

function formatCurrency(amount) {
  return "N$" + parseFloat(amount).toFixed(2);
}

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

    // Save quotation to file
    const savedQuotation = saveQuotation(quotationData);

    // Create PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    });

    // Handle response errors
    res.on("error", (err) => {
      console.error("Response error:", err);
      doc.end();
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="quotation.pdf"',
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Create a simple logo as a colored rectangle with text (since SVG isn't supported)
    // Draw logo background circle
    doc.fillColor("#1a472a").circle(75, 65, 45);

    // Draw logo text - repositioned for better visibility
    doc
      .fillColor("#ffffff")
      .fontSize(36)
      .font("Helvetica-Bold")
      .text("E", 50, 48, { width: 50, align: "center" });

    // Company Header
    doc
      .fillColor("#000000")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("ELCORP NAMIBIA", 130, 50);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Professional Business Solutions", 130, 75);

    doc
      .fontSize(9)
      .text("Phone: +264 81 7244041", 115, 90)
      .text("Email: elcorpnamibia@gmail.com", 115, 103)
      .text("Website: https://elli-portfolio.vercel.app/", 115, 116);

    // Horizontal line
    doc
      .strokeColor("#333333")
      .lineWidth(2)
      .moveTo(40, 130)
      .lineTo(555, 130)
      .stroke();

    // Quotation title
    doc.fontSize(16).font("Helvetica-Bold").text("QUOTATION", 40, 145);

    // Quotation details
    doc.fontSize(9).font("Helvetica");

    const quoteDate = new Date(quotationData.quotationDate).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    doc.text(`Date: ${quoteDate}`, 40, 170);
    doc.text(
      `Quotation ID: QT-${quotationData.id || Math.floor(Math.random() * 100000)}`,
      40,
      185,
    );

    // Client details
    doc.fontSize(11).font("Helvetica-Bold").text("CLIENT INFORMATION", 40, 215);

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(`Name: ${quotationData.clientName}`, 40, 235)
      .text(`Email: ${quotationData.clientEmail}`, 40, 250)
      .text(`Phone: ${quotationData.clientPhone}`, 40, 265);

    // Items table
    const tableTop = 300;
    const itemHeight = 20;
    const colWidths = {
      description: 200,
      quantity: 60,
      unitPrice: 80,
      total: 95,
    };

    // Table header
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#1a1a1a")
      .rect(40, tableTop - 5, 515, 25)
      .fill();

    doc
      .fillColor("#ffffff")
      .text("Description", 50, tableTop + 5)
      .text("Qty", 250, tableTop + 5, {
        width: colWidths.quantity,
        align: "right",
      })
      .text("Unit Price", 310, tableTop + 5, {
        width: colWidths.unitPrice,
        align: "right",
      })
      .text("Total", 450, tableTop + 5, {
        width: colWidths.total,
        align: "right",
      });

    // Table rows
    doc.fillColor("#000000").font("Helvetica");

    let currentY = tableTop + 30;
    quotationData.items.forEach((item, index) => {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);

      doc
        .fontSize(9)
        .text(item.name + " - " + item.description, 50, currentY, {
          width: 190,
        })
        .text(item.quantity, 250, currentY, {
          width: colWidths.quantity,
          align: "right",
        })
        .text(formatCurrency(item.unitPrice), 310, currentY, {
          width: colWidths.unitPrice,
          align: "right",
        })
        .text(formatCurrency(itemTotal), 450, currentY, {
          width: colWidths.total,
          align: "right",
        });

      currentY += itemHeight;
    });

    // Horizontal line before totals
    currentY += 10;
    doc
      .strokeColor("#333333")
      .lineWidth(1)
      .moveTo(40, currentY)
      .lineTo(555, currentY)
      .stroke();

    // Calculations
    currentY += 20;
    const subtotal = quotationData.items.reduce(
      (sum, item) =>
        sum + parseFloat(item.quantity) * parseFloat(item.unitPrice),
      0,
    );

    const discountAmount = quotationData.discount
      ? (subtotal * parseFloat(quotationData.discount)) / 100
      : 0;

    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount =
      subtotalAfterDiscount * (parseFloat(quotationData.tax) / 100);
    const grandTotal = subtotalAfterDiscount + taxAmount;

    // Totals on the right
    doc.fontSize(10).font("Helvetica");

    doc.text("Subtotal:", 350, currentY);
    doc.text(formatCurrency(subtotal), 450, currentY, { align: "right" });

    currentY += 20;

    if (quotationData.discount && parseFloat(quotationData.discount) > 0) {
      doc.text(`Discount (${quotationData.discount}%):`, 350, currentY);
      doc.text("-" + formatCurrency(discountAmount), 450, currentY, {
        align: "right",
      });
      currentY += 20;
    }

    doc.text(`Tax (${quotationData.tax}%):`, 350, currentY);
    doc.text(formatCurrency(taxAmount), 450, currentY, { align: "right" });

    currentY += 25;

    // Grand total box
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#1a1a1a")
      .rect(320, currentY - 10, 235, 30)
      .fill();

    // Grand total text - split into two parts to avoid width issues
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text("GRAND TOTAL:", 330, currentY + 4);

    // Grand total amount on the right without width constraint
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text(formatCurrency(grandTotal), 330, currentY + 4, {
        align: "right",
        width: 220,
      });

    // Signature section - only add if there's enough space
    const availableSpace = doc.page.height - currentY - 80;
    if (availableSpace >= 80) {
      currentY += 15; // Reduce spacing before signature section

      // Signature section header
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#1a1a1a")
        .text("APPROVAL & SIGNATURE", 40, currentY);

      currentY += 15;

      // Two column layout for signatures - compact version
      const leftColX = 60;
      const rightColX = 320;
      const signatureLineLength = 80;

      // Customer signature section
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#000000")
        .text("Customer/Client", leftColX, currentY);

      doc
        .moveTo(leftColX, currentY + 18)
        .lineTo(leftColX + signatureLineLength, currentY + 18)
        .stroke();

      doc.fontSize(7).text("Signature", leftColX, currentY + 20);

      doc
        .fontSize(8)
        .font("Helvetica")
        .text("Date:", leftColX, currentY + 32);

      doc
        .moveTo(leftColX, currentY + 45)
        .lineTo(leftColX + signatureLineLength, currentY + 45)
        .stroke();

      // Elcorp Namibia signature section
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#000000")
        .text("Elcorp Namibia Representative", rightColX, currentY);

      doc
        .moveTo(rightColX, currentY + 18)
        .lineTo(rightColX + signatureLineLength, currentY + 18)
        .stroke();

      doc.fontSize(7).text("Signature", rightColX, currentY + 20);

      doc
        .fontSize(8)
        .font("Helvetica")
        .text("Date:", rightColX, currentY + 32);

      doc
        .moveTo(rightColX, currentY + 45)
        .lineTo(rightColX + signatureLineLength, currentY + 45)
        .stroke();
    }

    // Add footer to first page
    const footerY = doc.page.height - 50;

    doc
      .strokeColor("#cccccc")
      .lineWidth(1)
      .moveTo(40, footerY)
      .lineTo(555, footerY)
      .stroke();

    doc
      .fillColor("#666666")
      .fontSize(7)
      .font("Helvetica")
      .text("Professional Solutions for Your Business", 40, footerY + 5, {
        align: "center",
        continued: true,
      })
      .text(
        " | This quotation is valid for 30 days from the date of issue. | ",
        { continued: true },
      )
      .text("Contact: +264 81 7244041 | elcorpnamibia@gmail.com", {
        align: "center",
      });

    // Finalize PDF
    doc.end();

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
