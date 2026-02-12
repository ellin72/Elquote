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

    // Layout helpers
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const marginLeft = doc.page.margins.left || 40;
    const marginRight = doc.page.margins.right || 40;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // Logo: circular container with centered image (falls back to monogram if image missing)
    const logoRadius = 45;
    const logoCenterX = marginLeft + logoRadius - 5; // keep near left margin
    const logoCenterY = 65;

    // Always render the circular container with red/gray split design
    doc.save();
    // Red full circle
    doc.fillColor("#A94442").circle(logoCenterX, logoCenterY, logoRadius);
    // Gray half circle overlay (right side)
    doc.fillColor("#5A5A5A");
    doc
      .moveTo(logoCenterX, logoCenterY - logoRadius)
      .quadraticCurveTo(
        logoCenterX + logoRadius,
        logoCenterY,
        logoCenterX,
        logoCenterY + logoRadius,
      )
      .quadraticCurveTo(
        logoCenterX + logoRadius,
        logoCenterY,
        logoCenterX,
        logoCenterY - logoRadius,
      )
      .fill();
    doc.restore();

    // Try to render the logo image inside the circle while maintaining aspect ratio
    try {
      const logoPath = path.join(__dirname, "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        const logoBoxSize = logoRadius * 2; // diameter

        doc
          .save()
          // Clip to circular container so the image stays inside
          .circle(logoCenterX, logoCenterY, logoRadius)
          .clip()
          .image(
            logoPath,
            logoCenterX - logoBoxSize / 2,
            logoCenterY - logoBoxSize / 2,
            {
              fit: [logoBoxSize, logoBoxSize],
              align: "center",
              valign: "center",
            },
          )
          .restore();
      } else {
        // Fallback: monogram text centered in the circle
        doc
          .fillColor("#ffffff")
          .fontSize(36)
          .font("Helvetica-Bold")
          .text("E", logoCenterX - 25, logoCenterY - 22, {
            width: 50,
            align: "center",
          });
      }
    } catch (e) {
      // If image loading fails for any reason, fall back to text logo
      doc
        .fillColor("#ffffff")
        .fontSize(36)
        .font("Helvetica-Bold")
        .text("E", logoCenterX - 25, logoCenterY - 22, {
          width: 50,
          align: "center",
        });
    }

    // ===== HEADER: Logo, company name, and QUOTATION title =====
    const headerTopY = 45;

    // Company name and subtitle to the right of the logo
    doc
      .fillColor("#000000")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("ELCORP NAMIBIA", marginLeft + logoRadius * 2, headerTopY);

    doc
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text(
        "Professional Business Solutions",
        marginLeft + logoRadius * 2,
        headerTopY + 22,
      );

    // "QUOTATION" on the far right in the header row
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#2C3E50")
      .text("QUOTATION", marginLeft, headerTopY + 5, {
        width: contentWidth,
        align: "right",
      });

    // ===== Company contact row =====
    const contactRowY = headerTopY + 40;

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#333333")
      .text("Phone: +264 81 7244041", marginLeft, contactRowY, {
        continued: true,
      })
      .text(" | Email: elcorpnamibia@gmail.com", { continued: true })
      .text(" | Website: https://elli-portfolio.vercel.app/");

    // Thin horizontal line below contact row
    const headerLineY = contactRowY + 16;
    doc
      .strokeColor("#999999")
      .lineWidth(2)
      .moveTo(marginLeft, headerLineY)
      .lineTo(marginLeft + contentWidth, headerLineY)
      .stroke();

    // ===== Quotation meta information (right-aligned block) =====
    doc.fontSize(9).font("Helvetica").fillColor("#000000");

    const rawQuoteDate =
      quotationData.quotationDate || new Date().toISOString();
    const parsedQuoteDate = new Date(rawQuoteDate);
    const safeQuoteDate = isNaN(parsedQuoteDate.getTime())
      ? new Date()
      : parsedQuoteDate;

    const quoteDate = safeQuoteDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const quoteId =
      (typeof savedQuotation !== "undefined" && savedQuotation.id) ||
      quotationData.id ||
      Math.floor(Math.random() * 100000);

    const metaTopY = headerLineY + 18;

    doc.text(`Date: ${quoteDate}`, marginLeft + contentWidth / 2, metaTopY, {
      width: contentWidth / 2,
      align: "right",
    });
    doc.text(
      `Quotation ID: QT-${quoteId}`,
      marginLeft + contentWidth / 2,
      metaTopY + 14,
      {
        width: contentWidth / 2,
        align: "right",
      },
    );

    // ===== Client information section =====
    const clientTopY = metaTopY + 35;

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#2C3E50")
      .text("CLIENT INFORMATION", marginLeft, clientTopY);

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#000000")
      .text(`Name: ${quotationData.clientName}`, marginLeft, clientTopY + 20)
      .text(`Email: ${quotationData.clientEmail}`, marginLeft, clientTopY + 35)
      .text(`Phone: ${quotationData.clientPhone}`, marginLeft, clientTopY + 50);

    // ===== Items table =====
    const tableTop = clientTopY + 80;
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
      .fillColor("#FFFFFF")
      .rect(marginLeft, tableTop - 5, contentWidth, 25)
      .fill()
      .fillColor("#2C3E50")
      .rect(marginLeft, tableTop - 5, contentWidth, 25);

    doc
      .fillColor("#2C3E50")
      .text("Description", marginLeft + 10, tableTop + 5)
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
        .text(item.name + " - " + item.description, marginLeft + 10, currentY, {
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
      .fillColor("#2C3E50")
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

    // Compute position just below the grand total box for the signature section
    const grandTotalBoxHeight = 30;
    const signatureTopY = currentY - 10 + grandTotalBoxHeight + 8; // small, professional gap

    // Signature section - only add if there's enough space, starting below the box
    const availableSpace = pageHeight - signatureTopY - 80;
    if (availableSpace >= 80) {
      currentY = signatureTopY;

      // Signature section header
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#2C3E50")
        .text("APPROVAL & SIGNATURE", marginLeft, currentY, {
          width: contentWidth,
          align: "center",
        });

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

    // Add footer near the bottom of the last page so it never overwrites main content
    const pageRange = doc.bufferedPageRange();
    if (pageRange.count > 0) {
      const lastPageIndex = pageRange.count - 1;
      const originalPageIndex = doc.page.index;

      // Switch to the last page (for single-page PDFs this is also page 1)
      doc.switchToPage(lastPageIndex);

      const footerMarginFromBottom = 40;
      const footerY = doc.page.height - footerMarginFromBottom;
      const footerWidth = doc.page.width - 80; // respect left/right margins

      // Separator line
      doc
        .strokeColor("#cccccc")
        .lineWidth(1)
        .moveTo(40, footerY)
        .lineTo(doc.page.width - 40, footerY)
        .stroke();

      // Footer text (small, professional font)
      doc
        .fillColor("#666666")
        .fontSize(7)
        .font("Helvetica")
        .text(
          "Professional Solutions for Your Business | This quotation is valid for 30 days from the date of issue. | Contact: +264 81 7244041 | elcorpnamibia@gmail.com",
          40,
          footerY + 5,
          {
            width: footerWidth,
            align: "center",
          },
        );

      // Switch back to whichever page we were on when we finished rendering content
      if (originalPageIndex >= 0 && originalPageIndex < pageRange.count) {
        doc.switchToPage(originalPageIndex);
      }
    }
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
