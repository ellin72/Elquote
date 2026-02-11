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

    // Save quotation to file
    saveQuotation(quotationData);

    // Create PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="quotation.pdf"',
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Company Header
    doc.fontSize(20).font("Helvetica-Bold").text("ELCORP NAMIBIA", 40, 40);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Professional Business Solutions", 40, 65);

    doc
      .fontSize(9)
      .text("Phone: +264 81 7244041", 40, 80)
      .text("Email: elcorpnamibia@gmail.com", 40, 93)
      .text("Website: https://elli-portfolio.vercel.app/", 40, 106);

    // Horizontal line
    doc
      .strokeColor("#333333")
      .lineWidth(2)
      .moveTo(40, 120)
      .lineTo(555, 120)
      .stroke();

    // Quotation title
    doc.fontSize(16).font("Helvetica-Bold").text("QUOTATION", 40, 135);

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

    doc.text(`Date: ${quoteDate}`, 40, 160);
    doc.text(
      `Quotation ID: QT-${quotationData.id || Math.floor(Math.random() * 100000)}`,
      40,
      175,
    );

    // Client details
    doc.fontSize(11).font("Helvetica-Bold").text("CLIENT INFORMATION", 40, 205);

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(`Name: ${quotationData.clientName}`, 40, 225)
      .text(`Email: ${quotationData.clientEmail}`, 40, 240)
      .text(`Phone: ${quotationData.clientPhone}`, 40, 255);

    // Items table
    const tableTop = 290;
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
    const totalsX = 350;
    const totalsRightX = 500;

    doc.fontSize(10).font("Helvetica");

    doc
      .text("Subtotal:", totalsX, currentY, { width: 100 })
      .text(formatCurrency(subtotal), totalsRightX, currentY, {
        width: 60,
        align: "right",
      });

    currentY += 20;

    if (quotationData.discount && parseFloat(quotationData.discount) > 0) {
      doc
        .text(`Discount (${quotationData.discount}%):`, totalsX, currentY, {
          width: 100,
        })
        .text("-" + formatCurrency(discountAmount), totalsRightX, currentY, {
          width: 60,
          align: "right",
        });
      currentY += 20;
    }

    doc
      .text(`Tax (${quotationData.tax}%):`, totalsX, currentY, { width: 100 })
      .text(formatCurrency(taxAmount), totalsRightX, currentY, {
        width: 60,
        align: "right",
      });

    currentY += 25;

    // Grand total box
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#1a1a1a")
      .rect(350, currentY - 10, 150, 25)
      .fill();

    doc
      .fillColor("#ffffff")
      .text("GRAND TOTAL:", totalsX, currentY, { width: 100 })
      .text(formatCurrency(grandTotal), totalsRightX, currentY, {
        width: 60,
        align: "right",
      });

    // Footer
    currentY = doc.page.height - 80;

    doc
      .strokeColor("#cccccc")
      .lineWidth(1)
      .moveTo(40, currentY)
      .lineTo(555, currentY)
      .stroke();

    doc
      .fillColor("#666666")
      .fontSize(8)
      .font("Helvetica")
      .text("Professional Solutions for Your Business", 40, currentY + 15, {
        align: "center",
      })
      .text(
        "This quotation is valid for 30 days from the date of issue.",
        40,
        currentY + 28,
        { align: "center" },
      )
      .text(
        "Contact: +264 81 7244041 | elcorpnamibia@gmail.com",
        40,
        currentY + 41,
        { align: "center" },
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

app.post("/api/save-quotation", (req, res) => {
  try {
    const quotation = saveQuotation(req.body);
    res.json({ success: true, quotation });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: "Failed to save quotation" });
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
